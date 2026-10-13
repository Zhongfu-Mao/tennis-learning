import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
assert(write || process.argv.includes('--check'), 'Use --write or --check');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const counts = (items, key) => Object.fromEntries(Object.entries(Object.groupBy(items, key)).map(([k, v]) => [k, v.length]));
const unique = (items, label) => assert.equal(new Set(items).size, items.length, `${label}: duplicate ID`);
const text = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

const modules = [
  { id: 'basics-rules', title: '入门与规则', description: '球场、球线、计分、发球顺序与比赛流程。', topicIds: ['court-geometry', 'rules-scoring', 'match-basics'] },
  { id: 'technique', title: '击球技术', description: '正反手、发球、接发与击球准备的基础概念。', topicIds: ['technique-models'] },
  { id: 'movement', title: '步伐与站位', description: '启动、距离、调整步、回位与不同站位。', topicIds: ['spacing-footwork'] },
  { id: 'ball-environment', title: '球性与环境', description: '旋转、轨迹、弹跳、场地和天气。', topicIds: ['spin-physics', 'ball-environment'] },
  { id: 'tactics', title: '战术与比赛', description: '相持、进攻、防守、发接发模式与比分下的选择。', topicIds: ['match-tactics'] },
  { id: 'body', title: '体能、恢复与安全', description: '专项体能、恢复、训练负荷和伤病相关知识。', topicIds: ['body-strength', 'recovery-load', 'injury-prevention', 'movement-conditioning'] },
  { id: 'learning', title: '训练与学习方法', description: '热身、训练目标、笔记、视频观察与复盘方法。', topicIds: ['training-routine'] },
  { id: 'equipment', title: '装备百科', description: '网球、球拍、球线、握把、球鞋和配件维护。', topicIds: ['equipment-balls', 'equipment-racquets', 'equipment-strings', 'equipment-footwear'] }
];
const topics = read('content/atlas/topics.json');
const publicTopics = topics.filter(t => t.id !== 'vr-practice');
const files = fs.readdirSync(path.join(root, 'content/atlas/cards')).filter(f => f.endsWith('.json')).sort();
const sourceCards = files.flatMap(f => read(`content/atlas/cards/${f}`).map(card => ({ card, sourcePack: `content/atlas/cards/${f}` })));
const cards = sourceCards.map(c => c.card);
const images = read('content/atlas/image-manifest.json');
const evidence = read('content/atlas/evidence-ledger.json');
const relations = read('content/atlas/relationships.json');
const cardIds = new Set(cards.map(c => c.id));
const topicIds = new Set(topics.map(t => t.id));
const imageById = new Map(images.map(i => [i.id, i]));
const evidenceByCard = new Map(evidence.map(e => [e.cardId, e]));
const overrides = read('editorial/wiki-overrides.json');
for (const id of Object.keys(overrides)) assert(cardIds.has(id), `Unknown Wiki override: ${id}`);
unique(cards.map(c => c.id), 'cards');
unique(topics.map(t => t.id), 'topics');
unique(images.map(i => i.id), 'images');
unique(evidence.map(e => e.cardId), 'evidence');
unique(modules.flatMap(m => m.topicIds), 'module topics');
assert.deepEqual(new Set(modules.flatMap(m => m.topicIds)), new Set(publicTopics.map(t => t.id)), 'Every non-VR topic must have one module');

function home(card) {
  const id = card.id;
  if (id.startsWith('equipment.')) return 'equipment';
  if (/^(court|rules|match)\./.test(id)) return 'basics-rules';
  if (/^(stroke|serve|return)\./.test(id)) return 'technique';
  if (id.startsWith('spacing.')) return 'movement';
  if (/^(spin|trajectory|ball|environment)\./.test(id)) return 'ball-environment';
  if (id.startsWith('tactics.')) return 'tactics';
  if (/^(progression|training)\./.test(id) && id !== 'training.pain-scale-stoplight') return 'learning';
  if (/^(recovery|injury|conditioning)\./.test(id) || id === 'training.pain-scale-stoplight') return 'body';
  throw new Error(`Unmapped card: ${id}`);
}

for (const card of cards) {
  assert(/^[a-z0-9.-]+$/.test(card.id), `Unsafe ID: ${card.id}`);
  for (const field of ['title', 'summary', 'encyclopedia', 'reviewPrompt']) assert(typeof card[field] === 'string' && card[field].trim(), `${card.id}: missing ${field}`);
  assert(['verified', 'personal-note', 'needs-review'].includes(card.verificationStatus));
  assert(card.topicIds.length > 0 && card.topicIds.every(id => topicIds.has(id)), `${card.id}: topic`);
  assert(card.relatedCards.every(r => cardIds.has(r.targetId)), `${card.id}: related card`);
  const image = imageById.get(card.generatedImage.assetId);
  assert(image && image.cardIds.includes(card.id), `${card.id}: image backlink`);
  if (card.verificationStatus === 'verified') assert(evidenceByCard.has(card.id), `${card.id}: evidence`);
}
for (const image of images) {
  assert(image.path.startsWith('/assets/knowledge/') && !image.path.includes('..'), `${image.id}: image path`);
  assert(['approved', 'candidate', 'replace', 'needs-generation'].includes(image.status));
  assert(fs.existsSync(path.join(root, 'public', image.path)), `${image.id}: file`);
  assert(image.cardIds.every(id => cardIds.has(id)), `${image.id}: card`);
}
for (const record of evidence) assert(cardIds.has(record.cardId), `Orphan evidence: ${record.cardId}`);
for (const relation of relations) assert(cardIds.has(relation.sourceId) && cardIds.has(relation.targetId), 'Orphan graph relation');

const catalog = sourceCards.map(({card, sourcePack}) => {
  const image = imageById.get(card.generatedImage.assetId);
  const override = overrides[card.id] ?? {};
  const slug = override.slug ?? card.id.replaceAll('.', '-');
  return {
    id: card.id, slug, title: override.title ?? card.title,
    moduleId: home(card), topicIds: card.topicIds.filter(t => t !== 'vr-practice'),
    tags: card.tags.filter(t => !/vr|2\.7|3\.0|3\.5|4\.0/i.test(t)),
    summary: card.summary, sourcePack, sourceSha256: hash(JSON.stringify(card)),
    articlePath: `content/wiki/articles/${home(card)}/${card.id}.md`,
    route: `/wiki/${slug}/`,
    sourceVerificationStatus: card.verificationStatus,
    evidence: evidenceByCard.get(card.id) ?? null,
    image: { assetId: image.id, path: image.path, status: image.status, alt: override.imageAlt ?? card.generatedImage.alt, hideInline: override.hideInlineImage ?? false },
    projectionNote: override.note ?? null,
    relatedIds: card.relatedCards.map(r => r.targetId),
    editorialStatus: 'needs-wiki-review', publishByDefault: false,
    reviewReasons: [
      'Wiki 改写、逐项来源核对和通用措辞尚未完成',
      ...(card.verificationStatus !== 'verified' ? ['原卡为个人笔记或待核查'] : ['verified 为既有审核状态，不代表本次重新核实']),
      ...(image.status !== 'approved' ? [`图片状态为 ${image.status}`] : []),
      ...(evidenceByCard.has(card.id) && evidenceByCard.get(card.id).evidenceType !== 'verified-source' ? ['来源属于综合判断或观察，需明确与通用事实的界限'] : [])
    ]
  };
});
unique(catalog.map(c => c.slug), 'slugs');
const entryById = new Map(catalog.map(c => [c.id, c]));
const snapshot = read('docs/source-snapshot.json');
for (const file of snapshot.files) assert.equal(hash(fs.readFileSync(path.join(root, file.path))), file.sha256, `Source changed: ${file.path}. Update provenance deliberately.`);

const legacyDestinations = {
  'knowledge-cards.json': ['basics-rules', 'ball-environment', 'equipment', 'body', 'learning'],
  'knowledge-chapters.json': ['basics-rules', 'ball-environment', 'equipment', 'body', 'learning'],
  'technique-cards.json': ['technique', 'movement', 'tactics'],
  'strokes.json': ['technique', 'movement'],
  'footwork-drills.json': ['movement', 'learning'],
  'match-playbook.json': ['tactics', 'learning'],
  'progression.json': ['learning'],
  'progression-blocks.json': ['learning'],
  'stage-assessments.json': ['learning'],
  'strength-blocks.json': ['body'],
  'strength-phases.json': ['body'],
  'fatigue-rules.json': ['body']
};
const legacyFiles = fs.readdirSync(path.join(root, 'content')).filter(f => f.endsWith('.json')).sort();
assert.deepEqual(legacyFiles, Object.keys(legacyDestinations).sort(), 'Legacy file needs disposition');
const legacy = legacyFiles.map(file => {
  const source = read(`content/${file}`);
  const records = [];
  function walk(value, pointer = '') {
    if (Array.isArray(value)) value.forEach((item, i) => {
      const p = `${pointer}/${i}`;
      if (item && typeof item === 'object') records.push({ pointer: p, id: item.id ?? null, title: item.title ?? item.label ?? item.test ?? item.phase ?? item.trigger ?? `记录 ${i + 1}`, sha256: hash(JSON.stringify(item)) });
      else records.push({ pointer: p, id: null, title: String(item), sha256: hash(JSON.stringify(item)) });
    });
    else if (value && typeof value === 'object') for (const [key, v] of Object.entries(value)) walk(v, `${pointer}/${key.replaceAll('~', '~0').replaceAll('/', '~1')}`);
  }
  walk(source);
  return { sourcePath: `content/${file}`, sourceSha256: hash(JSON.stringify(source)), recordCount: records.length, proposedModuleIds: legacyDestinations[file], disposition: 'preserved-reference-only', publishByDefault: false, records };
});

const unusedImages = images.filter(i => !cards.some(c => c.generatedImage.assetId === i.id)).map(i => ({id: i.id, path: i.path, status: i.status, cardIds: i.cardIds}));
const report = {
  snapshotDate: snapshot.snapshotDate,
  scope: '完整迁移、分类、字段和资源一致性确认；不等于全量事实复核或网站发布',
  cardCount: cards.length, packCount: files.length, rawTopicCount: topics.length,
  wikiTopicCount: publicTopics.length, moduleCount: modules.length,
  contentStatusCounts: counts(cards, c => c.verificationStatus), evidenceCount: evidence.length,
  evidenceTypeCounts: counts(evidence, e => e.evidenceType),
  imageCount: images.length, imageStatusCounts: counts(images, i => i.status),
  activeImageStatusCounts: counts(catalog, c => c.image.status),
  preservedInactiveImages: unusedImages, legacyFileCount: legacy.length,
  legacyRecordCount: legacy.reduce((sum, f) => sum + f.recordCount, 0),
  sourceFileCount: snapshot.files.length,
  modules: modules.map(m => ({ ...m, cardIds: catalog.filter(c => c.moduleId === m.id).map(c => c.id), contentStatusCounts: counts(catalog.filter(c => c.moduleId === m.id), c => c.sourceVerificationStatus) })),
  defaultPublishableCount: 0,
  structuralErrors: [],
  retainedFields: ['encyclopedia', 'summary', 'relatedCards', 'evidence', 'generatedImage', 'source verification and image states'],
  excludedWikiFeatures: ['VR drills', 'personal level progression', 'training logs', 'SRS queue', 'account/API key settings', 'booking state']
};

const outputs = new Map();
outputs.set('content/wiki/modules.json', json(modules));
outputs.set('content/wiki/topics.json', json(publicTopics));
outputs.set('content/wiki/catalog.json', json(catalog));
outputs.set('content/wiki/legacy-inventory.json', json(legacy));
outputs.set('docs/content-audit.json', json(report));

const statusLabel = {verified: '原版标记为 verified（本轮未逐条重新核实）', 'personal-note': '原版个人笔记', 'needs-review': '原版待核查'};
for (const entry of catalog) {
  const card = cards.find(c => c.id === entry.id);
  const override = overrides[card.id] ?? {};
  const image = entry.image;
  const e = entry.evidence;
  const related = card.relatedCards.map(r => {
    const target = entryById.get(r.targetId);
    return `- [${target.title}](../${target.moduleId}/${target.id}.md)（${r.type}）`;
  });
  const article = [
    '---', `id: ${json(card.id).trim()}`, `title: ${json(entry.title).trim()}`, `module: ${entry.moduleId}`,
    `slug: ${entry.slug}`, `editorial_status: needs-wiki-review`, 'publish: false',
    `source_verification_status: ${card.verificationStatus}`, `image_status: ${image.status}`, '---', '',
    `# ${entry.title}`, '',
    '> 迁移草稿：保留原文供编辑核对，尚未完成面向球友的通用改写和逐条来源复核。', '',
    card.summary, '', '## 概念说明', '', override.encyclopedia ?? card.encyclopedia, '',
    '## 配图', '',
    image.status === 'approved' && !image.hideInline ? `![${image.alt}](../../../../public${image.path})` : `[查看原版配图](../../../../public${image.path})（原状态 ${image.status}，不作为 Wiki 已审核插图展示）`, '',
    '## 常见误区（原版素材）', '', card.progressionLens.commonFailure, '',
    '## 理解自测（待编辑）', '', card.reviewPrompt, '',
    '## 相关词条', '', ...related, '',
    '## 来源与审核', '',
    `- 内容状态：${statusLabel[card.verificationStatus]}。`,
    `- 原始内容：[${entry.sourcePack}](../../../atlas/cards/${path.basename(entry.sourcePack)})；ID：${card.id}。`,
    ...(e ? [`- 证据类型：${e.evidenceType}。`, `- 来源：${/^https?:/.test(e.source) ? `[${e.title}](${e.source})` : `${e.title} — ${e.source}`}。`, `- 原版说明：${e.verificationNote}`, `- 原版审核：${e.reviewer}，${e.reviewedAt}。`] : ['- 尚无独立证据记录；不能从草稿状态自动升为已核实。']),
    '- Wiki 编辑需检查措辞、适用条件、原版个人化断言及来源支持范围。', '',
    ...(override.note ? [`- Wiki 投影调整：${override.note}`, ''] : [])
  ].join('\n');
  outputs.set(entry.articlePath, article);
}

const overview = ['# 内容总目录', '', '本目录从原始 JSON 自动生成。181 张词条按唯一主栏目归档；跨主题联系仍由 topicIds 与 relatedCards 保留。所有 Markdown 都是迁移草稿。', '', '| 栏目 | 词条数 | 原版 verified | 原版个人笔记 |', '|---|---:|---:|---:|', ...report.modules.map(m => `| ${m.title} | ${m.cardIds.length} | ${m.contentStatusCounts.verified ?? 0} | ${m.contentStatusCounts['personal-note'] ?? 0} |`), '', ...report.modules.flatMap(m => [`## ${m.title}`, '', ...m.cardIds.map(id => { const c = entryById.get(id); return `- [${text(c.title)}](../${c.articlePath}) · ${c.id} · ${c.sourceVerificationStatus} · image:${c.image.status}`; }), '']), '## 旧版素材逐项清单', '', '| 文件 | 记录数 | 处置 |', '|---|---:|---|', ...legacy.map(f => `| [${f.sourcePath}](../${f.sourcePath}) | ${f.recordCount} | 完整保留，作为复核和补缺素材；不自动上线 |`), '', '逐项 JSON Pointer、ID、标题和哈希见 [legacy-inventory.json](../content/wiki/legacy-inventory.json)。', ''].join('\n');
outputs.set('docs/CONTENT_INDEX.md', overview);
outputs.set('docs/REVIEW_QUEUE.md', ['# Wiki 编辑复核队列', '', '每条均需要 Wiki 改写。优先处理规则与安全内容、来源不足和 replace 配图；下列列表与当前文件一致。旧审计文档只作历史参考。', '', ...modules.flatMap(m => [`## ${m.title}`, '', '| 词条 | 原内容状态 | 图片状态 | 来源日期 |', '|---|---|---|---|', ...catalog.filter(c => c.moduleId === m.id).map(c => `| [${text(c.title)}](../${c.articlePath}) | ${c.sourceVerificationStatus} | ${c.image.status} | ${c.evidence?.reviewedAt ?? '无记录'} |`), '']), '## 未被当前卡片引用的配图', '', ...unusedImages.map(i => `- ${i.id} · ${i.status} · ${i.path}`), '', '这些是保留的旧版本，不是缺失内容或网站新增词条。', ''].join('\n'));

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walkFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
const unexpected = walkFiles(path.join(root, 'content/wiki/articles')).map(p => path.relative(root, p)).filter(p => !outputs.has(p));
assert.equal(unexpected.length, 0, `Untracked generated articles: ${unexpected.join(', ')}`);
for (const [p, value] of outputs) {
  const target = path.join(root, p);
  if (write) { fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, value); }
  else assert.equal(fs.readFileSync(target, 'utf8'), value, `${p} is stale: npm run content:generate`);
}
// Check all generated Markdown relative links against the actual repository.
for (const [p, value] of outputs) if (p.endsWith('.md')) {
  for (const match of value.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^https?:/.test(link)) continue;
    assert(fs.existsSync(path.resolve(root, path.dirname(p), link)), `${p}: broken Markdown link ${link}`);
  }
}
console.log(json({mode: write ? 'generated' : 'checked', cards: report.cardCount, modules: report.modules.map(m => ({id:m.id,count:m.cardIds.length})), rawTopics: report.rawTopicCount, wikiTopics:report.wikiTopicCount, contentStatusCounts:report.contentStatusCounts, images: report.imageCount, imageStatusCounts:report.imageStatusCounts, activeImageStatusCounts:report.activeImageStatusCounts, legacyFiles: report.legacyFileCount, legacyRecords:report.legacyRecordCount, outputFiles:outputs.size, structuralErrors:report.structuralErrors}));

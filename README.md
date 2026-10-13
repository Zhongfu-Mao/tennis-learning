# Tennis Learning · 网球 Wiki

面向球友、以主题百科为中心的中文网球 Wiki 内容工程。已有内容来自 `progression-assistant`，现在按公共知识主题重组，供 dots 接手编辑和网站实现。

**当前交付是内容重组和开发交接，不是已经上线的网站。**

## 从这里开始

- [网站定位与信息架构](docs/WIKI_PLAN.md)
- [完整词条目录](docs/CONTENT_INDEX.md)
- [dots 接手任务](docs/DOTS_HANDOFF.md)
- [逐条内容与图片复核队列](docs/REVIEW_QUEUE.md)
- [当前结构审计数据](docs/content-audit.json)

## 内容组织

八个主栏目：入门与规则、击球技术、步伐与站位、球性与环境、战术与比赛、体能恢复与安全、训练与学习方法、装备百科。

181 张原版知识卡、13 个卡包、18 个原版主题全部保留。面向 Wiki 的主题索引为 17 个；`vr-practice` 不进入网站导航。12 个旧版素材 JSON 逐项登记，保留用于核对和补缺。189 条配图记录及其引用文件一并迁移。

原版有 66 张卡标记 `verified`、115 张为 `personal-note`；这代表历史编辑状态。本次确认内容完整性和引用一致性，没有把个人笔记升级成已核实教材。Wiki 迁移草稿默认 `publish: false`，等待 dots 完成通用改写、来源核对和配图处理。

## 文件说明

```text
content/atlas/              原版卡片、主题、关系、来源、图片状态；编辑事实源
content/*.json             旧版知识、技术、训练和进阶素材；不直接上线
content/wiki/              自动生成的 Wiki 栏目、索引和 Markdown 迁移草稿
editorial/wiki-overrides.json  面向 Wiki 的显式投影调整，保留原文与调整原因
public/assets/knowledge/   全部 manifest 引用的教学图片（包含候选/旧版）
docs/                      定位、全量目录、复核队列与交接说明
reference/progression-assistant/  旧 App 源码与测试，仅供迁移参考
scripts/wiki-content.mjs   内容生成、完整性和资源一致性校验
```

`content/atlas/` 是卡片原文的唯一编辑源。少量去除 VR 表述和个人化标题的投影调整记录在 `editorial/wiki-overrides.json`。Wiki Markdown 与 catalog 是生成结果，避免两份正文相互漂移。完成来源复核后，可由 dots 明确迁移为独立 Wiki schema；此前不要只改生成文件。

## 验证与生成

内容检查只需要 Node.js 22 或更高版本，无需安装依赖：

```bash
npm run content:generate
npm run content:check
```

若需要运行旧 App 参考代码：

```bash
npm ci --prefix reference/progression-assistant
npm run reference:test
npm run reference:build
```

旧 App 通过相对符号链接共享根目录的 content、public、docs 和 scripts，避免再复制一份百科。旧界面中的个人进阶、VR、日志和设置都不属于 Wiki 产品需求。

教学原图约 365 MiB。网站实现时需要优化交付尺寸、缩略图和懒加载；保留原图，不在每次打开网站时预缓存整个图集。

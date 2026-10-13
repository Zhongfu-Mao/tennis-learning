import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const auditDocPath = path.join(appRoot, "docs/equipment-encyclopedia-readiness-audit-2026-05-25.md");

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const hasUserConfirmation = args.has("--confirm-user-approved");

if (shouldApply && !hasUserConfirmation) {
  throw new Error("Refusing to finalize equipment encyclopedia without --confirm-user-approved.");
}

function runNodeScript(scriptName, scriptArgs = []) {
  execFileSync(process.execPath, [path.join(appRoot, "scripts", scriptName), ...scriptArgs], {
    cwd: appRoot,
    stdio: "inherit"
  });
}

function replaceRequired(source, before, after) {
  if (!source.includes(before)) {
    throw new Error(`Could not find required audit-doc text:\n${before}`);
  }

  return source.replace(before, after);
}

function updateAuditDocForCompletion() {
  let doc = fs.readFileSync(auditDocPath, "utf8");

  doc = replaceRequired(
    doc,
    "装备百科已经具备“可浏览、可收藏、可复习、可查证”的主题模块骨架，并且 62 张既有装备知识图已经完成首轮逐张审图；但还不能标记为最终完成。\n\n当前唯一关键阻塞是：6 张重做图已经通过 Codex 初审与 Gemini 外部审稿，但仍停留在 `candidate`，需要用户最终逐张确认后才能升为 `approved`。目前 56 张为 `approved`，6 张为 `candidate`，0 张为 `replace`。",
    "装备百科初版已经具备“可浏览、可收藏、可复习、可查证”的主题模块骨架，并且 62 张装备知识图全部通过首轮审图、重做复审和用户最终确认。\n\n当前状态：62 张装备知识图全部为 `approved`，`candidate / replace / needs-generation` 均为 0。装备百科主题初版可以作为后续世界观、技术训练基础等大主题的前置完成基线。"
  );

  doc = replaceRequired(doc, "| 图片 candidate | 6 |\n| 图片 approved | 56 |", "| 图片 candidate | 0 |\n| 图片 approved | 62 |");
  doc = replaceRequired(
    doc,
    "- 重做批次（6 张）：`球毛影响`、`罐装球保存`、`拍框厚度`、`减震器`、`掉磅`、`防晒和补水`已重新生成，Codex 初审通过，Gemini 审稿通过，目前状态为 `candidate`。",
    "- 重做批次（6 张）：`球毛影响`、`罐装球保存`、`拍框厚度`、`减震器`、`掉磅`、`防晒和补水`已重新生成，Codex 初审通过，Gemini 审稿通过，并经用户最终确认后升为 `approved`。"
  );

  doc = replaceRequired(
    doc,
    "## 仍未完成\n\n1. 用户逐张确认 6 张 `candidate` 图片：`球毛影响`、`罐装球保存`、`拍框厚度`、`减震器`、`掉磅`、`防晒和补水`。\n2. 用户通过后运行 `npm run equipment:approve-candidates -- --apply --confirm-user-approved`，把 6 张图从 `candidate` 改为 `approved`。\n3. 用户指出问题的图改回 `replace`，并在 `.codex/image-failure-ledger.md` 追加失败原因。\n4. 最终达成：装备图 `approved` 数量应覆盖初版范围，且 `replace / needs-generation / candidate` 都为 0。",
    "## 完成判定\n\n1. 62 张装备卡全部为 `verificationStatus: \"verified\"`。\n2. 62 张装备卡全部有 `evidence-ledger.json` 记录。\n3. 62 张装备图片全部存在于 `public/assets/knowledge/`。\n4. 62 张装备图片全部为 `approved`。\n5. `npm run equipment:audit -- --strict-approved` 通过。"
  );

  doc = replaceRequired(
    doc,
    "- `npm run equipment:audit`：当前候选态通过结构审计；严格完成审计需在用户确认并升为 `approved` 后运行 `npm run equipment:audit -- --strict-approved`。",
    "- `npm run equipment:audit -- --strict-approved`：passed。"
  );

  doc = replaceRequired(
    doc,
    "## 下一步建议\n\n下一步不要继续扩卡。优先让用户确认 6 张 `candidate` 装备知识图：\n\n1. 打开 `docs/equipment-candidate-review-pack-2026-05-25.md`，一次展示 6 张或按 3 张一组审。\n2. 用户通过则改为 `approved`。\n3. 用户指出问题则改为 `replace` 并记录 ledger。\n4. 每轮结束跑内容测试，确保 manifest、资产、状态一致。",
    "## 下一步建议\n\n装备百科初版已完成。下一步可以进入后续大主题的规划与制作：\n\n1. 世界观 / 赛事 / 场地 / 规则脉络。\n2. 技术训练基础：动作原则、击球窗口、球路和站位。\n3. VR drill 与真实上场练习的桥接。"
  );

  fs.writeFileSync(auditDocPath, doc);
}

if (!shouldApply) {
  runNodeScript("approve-equipment-candidates.mjs");
  console.log("Finalize dry run OK. Add --apply --confirm-user-approved after user approval to approve images and update audit docs.");
  process.exit(0);
}

runNodeScript("approve-equipment-candidates.mjs", ["--apply", "--confirm-user-approved"]);
updateAuditDocForCompletion();
runNodeScript("audit-equipment-encyclopedia.mjs", ["--strict-approved"]);
console.log("Equipment encyclopedia finalized.");

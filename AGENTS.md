# Tennis Wiki 工作约定

这是面向球友的中文网球 Wiki，不是个人训练助手。任务范围以 README、docs/WIKI_PLAN.md 和用户最新指示为准。

- 原文与来源在 content/atlas/；旧 content/*.json 为素材，不自动上线。
- content/wiki/、docs/CONTENT_INDEX.md、docs/REVIEW_QUEUE.md、docs/content-audit.json 由 `npm run content:generate` 生成，不单独改生成结果。
- 内容修改须同步来源、审核状态与 provenance；保留稳定 ID 和互链。
- 原版 verified 只是历史审核状态，不能把迁移、生成或结构检查当成新的事实验证。
- 个人笔记、综合推断和观察需要明确标注，规则注明赛制/版本，伤病内容不得写成个人诊断，装备建议保留适用条件。
- 图片 candidate/replace 不自动提升 approved；教学图文含义一致，严查数值、单位和否定条件。
- 不把 VR、个人等级路线、训练日志、SRS、订场联动或 API key 设置带入 Wiki。
- reference/progression-assistant 仅供迁移参考，旧 UI 不约束新站信息架构。
- 验证内容检查和本地链接；网站实现后补构建与桌面/手机浏览验证。报告内容、构建和部署状态时分开陈述。
- 不复制 automations/court-monitor 的配置、凭据、状态或日志到仓库。

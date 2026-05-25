# 1688 官方资料原文区

把已经整理好的 1688 官方文章放在这里，系统会用 `scripts/buildKnowledgeIndex.ts` 注册文章源。

目录约定：

- `vertical-business/`：垂直生意、严选、托管、行家选、PLUS 等
- `member-service/`：诚信通 AI 版、超级工厂、数字小店等
- `operating-tools/`：新商工作台、数字员工、分销铺货、服务市场等
- `search-operation/`：搜索、推荐、图搜、商品成长、商品质量星级等
- `rules/`：官方物流、88 小仓、买家保障等规则资料
- `skipped-or-incomplete/`：残缺、目录型、弱参考资料，默认不参与自动派单

支持 `.md` 和 `.html`。Markdown 可选 frontmatter：

```markdown
---
title: 一文搞懂1688搜索运营
sourceUrl: https://...
category: search_operation
crawledAt: 2026-05-25
tags:
  - 搜索
  - 曝光
---
```

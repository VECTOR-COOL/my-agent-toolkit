@AGENTS.md

## Claude Code

<!-- 只放 Claude 專屬內容；共用規則寫在 AGENTS.md。整份維持 200 行以內。 -->

- 大範圍或跨模組的修改先用 plan mode 提出計畫。
- 改完程式先跑 `<測試指令>` 與 `<lint 指令>`，通過才算完成。
- 只對部分路徑有效的規則放 `.claude/rules/`，用 `paths` 限定。

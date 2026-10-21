# claude/

Claude 專屬的共用知識與範本，給 `my-claude-codebase-convert`、`my-codebase-init-claude`、`my-claude-cloud-agent` 引用。這裡不是 skill（Claude Code 只發現 `skills/<name>/SKILL.md`，不認巢狀目錄），所以 skill 一律平鋪在 `skills/`，共用內容放這裡。

| 檔案 | 內容 |
|------|------|
| [`best-practices.md`](best-practices.md) | Claude Code 專案設定最佳實踐（官方文件確認過） |
| [`platform-mapping.md`](platform-mapping.md) | Cursor、Copilot、Codex 等平台設定 → Claude 對應 |
| [`templates/`](templates/) | `CLAUDE.md`、`.claude/settings.json`、路徑規則範本 |

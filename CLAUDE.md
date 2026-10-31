@AGENTS.md

## Claude Code

- 根目錄只是導覽；要改 plugin 就讀該 plugin 的 `AGENTS.md`（如 `my-plugins/my-workflow/AGENTS.md`）與 `docs/NOTE.md`，不要憑記憶。
- 安裝：Claude Code 用 `/plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit` → `/plugin install my-workflow@my-agent-toolkit`，到 `/plugin` 開 auto-update；網頁／Cowork／雲端 session 在 [Customize > Plugins](https://claude.ai/customize/plugins) 加入並開 **Sync automatically**。網頁版不執行 hook，規則靠入口 skill 讀 `references/global.md`。代為安裝時載入 skill `my-plugin-install`。
- plugin 的 manifest（`.claude-plugin/plugin.json`、`plugin.json`）**不要加 `version`**，否則自動更新會被凍結。
- 改 `my-plugins/my-workflow/` 後先跑 `node my-plugins/my-workflow/scripts/check-release.mjs`，通過才 commit。

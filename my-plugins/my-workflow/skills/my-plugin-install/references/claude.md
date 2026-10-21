# Claude 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。各平台的 plugin 來源不同，裝在一處不一定出現在另一處：

| 平台 | plugin 從哪來 | hook（常駐規則注入） |
|------|------|------|
| Claude Code（終端機、Desktop Code 分頁、IDE） | 本機 `~/.claude` 的安裝，三者共用 | 有 |
| claude.ai 網頁、Desktop 聊天 | claude.ai 帳號的 plugin 設定 | 無；只載入 skills、MCP |
| Cowork | claude.ai 帳號同步；不讀本機 `~/.claude` | 無；另支援 agents |
| Claude 雲端 session | claude.ai 帳號同步的 plugin；repo 內宣告的 marketplace 不會載入 | 有 |

**同步方向**：claude.ai 帳號上設定的 plugin 會同步到 Cowork 與 Claude Code；本機 CLI 裝的**不會**回傳到帳號。

## Claude Code

終端機（官方 CLI 子命令已確認）：

```text
claude plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit
claude plugin install my-workflow@my-agent-toolkit
claude plugin list
```

更新：

```text
claude plugin marketplace update my-agent-toolkit
claude plugin update my-workflow@my-agent-toolkit
```

- 對話中也可用 `/plugin`（`/plugin marketplace add …`、`/plugin install …`）。
- 更新或安裝後要**重開 Claude Code** 才載入新版。
- Desktop 的 Code 分頁與終端機共用設定：在終端機裝一次即可，到 **+ → Plugins → Manage plugins** 確認。
- 其他：`claude plugin disable|enable|uninstall <id>`。

## 網頁與 Cowork

沒有 shell，**你不能替使用者執行**，只能一步步引導（官方文件寫法，介面名稱可能隨版本變動，未實測）：

1. claude.ai 或 Desktop → **Customize → Plugins → Add → Add marketplace**，填 `https://github.com/VECTOR-COOL/my-agent-toolkit`。
2. 私有 repo：先連結 GitHub，並讓 Claude GitHub App 能讀取該 repo。
3. 從清單安裝 `my-workflow`。
4. 更新：在同一處重新整理 marketplace 或更新 plugin。

這裡只有 skills 與 MCP；全域規則不會自動注入，必要時請使用者把 `rules/global.md` 加到專案或個人指示。

## 雲端 session

- plugin 來自 claude.ai 帳號同步，在 session 開始時就固定，**不能在 session 內安裝或更新**。
- 檢查目前版本：讀 `~/.claude/plugins/synced/` 下 my-workflow 的 `.claude-plugin/plugin.json`，對照最新版本。
- 版本落後：請使用者到 claude.ai 的 Customize → Plugins 更新，再開新的雲端 session。
- repo 的 `.claude/settings.json` 裡宣告的 `extraKnownMarketplaces`／`enabledPlugins`，雲端 session 不會載入。

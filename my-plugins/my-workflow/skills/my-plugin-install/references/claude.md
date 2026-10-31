# Claude 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。各平台的 plugin 來源不同，裝在一處不一定出現在另一處：

| 平台 | plugin 從哪來 | hook（常駐規則注入） |
|------|------|------|
| Claude Code（終端機、Desktop Code 分頁、IDE） | 本機 `~/.claude` 的安裝，三者共用；登入同帳號時也會下載帳號上的 plugin（`/reload-plugins` 立即載入） | 有 |
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

沒有 shell，**你不能替使用者執行**。照下面的引導，一步一步帶使用者做，每步給連結、說要點哪個按鈕，等使用者回報結果再走下一步。出處：[Claude plugins 官方說明](https://claude.com/docs/plugins/overview)。

**引導：第一次安裝**

1. 打開 👉 [Customize > Plugins](https://claude.ai/customize/plugins)（網頁或 Desktop 都一樣）。
2. 點 **Add → Add marketplace**，輸入 `https://github.com/VECTOR-COOL/my-agent-toolkit`（或 `VECTOR-COOL/my-agent-toolkit`）。
3. 這是私有 repo，對話框若出現 **Connect GitHub** 就點它連結 GitHub；若出現 **Install the Claude GitHub App**，到 👉 [Claude GitHub App](https://github.com/apps/claude/installations/select_target) 授權它讀取 `VECTOR-COOL/my-agent-toolkit`，再回來重試。
4. 加入後，到 **Discover** 找 `my-workflow`，點 **Add**。
5. 建議打開這個 marketplace 的 **Sync automatically**（從 github.com 加入的才有），之後 `main` 有新版會自動同步，不用再手動更新。
6. 開 plugin 的 **Connectors** 分頁，`composio` 若顯示 **Not connected** 或 **Not added**，就照提示加入並登入。

**引導：更新**

已開 **Sync automatically** 的話跳過第 1、2 步。

1. 打開 👉 [Customize > Plugins](https://claude.ai/customize/plugins)。
2. 在 `my-agent-toolkit` marketplace 點 **Check for updates**。新版同步後會自動套用，不用再按接受。
3. 開**新對話**（Cowork 是下一個任務）才會用到新版。

**引導完要提醒**

- 網頁與 Desktop 聊天只載入 skills、commands、MCP；Cowork 另外載入 agents。**hook 不會執行，全域規則不會自動注入**；載入入口 skill `my-workflow` 時會自己讀 `references/global.md`；仍沒生效就請使用者把該檔加到個人偏好或專案指示。
- 帳號上的 plugin 會同步到 Cowork 與 Claude Code；反過來，Claude Code 終端機裝的不會回到帳號。
- 停用：plugin 頁的 **Disable plugin** 開關；移除：plugin 選單的 **Remove**。

## 雲端 session

- plugin 來自 claude.ai 帳號同步，在 session 開始時就固定，**不能在 session 內安裝或更新**。
- 檢查目前版本：讀 `~/.claude/plugins/synced/` 下 my-workflow 的 `.claude-plugin/plugin.json`，對照最新版本。
- 版本落後：用上面「引導：更新」帶使用者到 [Customize > Plugins](https://claude.ai/customize/plugins) 按 **Check for updates**，再開新的雲端 session。
- repo 的 `.claude/settings.json` 裡宣告的 `extraKnownMarketplaces`／`enabledPlugins`，雲端 session 不會載入。

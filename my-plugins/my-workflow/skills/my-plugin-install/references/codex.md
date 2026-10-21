# Codex：安裝與更新

方法見 [SKILL.md](../SKILL.md)。依 Codex 官方 plugin 文件整理，**未實機驗證**。

- marketplace 定義在來源 repo 的 `.agents/plugins/marketplace.json`。
- 在專案的 `.codex/config.toml` 啟用：

```toml
[plugins."my-workflow@my-agent-toolkit"]
enabled = true
```

- 此設定適用於 marketplace 所在 repo 內的專案；其他專案如何加入這個 marketplace，官方頁未寫清楚，先查最新文件再做，不要猜。
- hooks 要使用者檢視並信任後才會執行；hooks 有變動要重新信任。
- 更新：更新來源 repo 後重新啟用 plugin。
- Composio MCP 首次使用會開瀏覽器 OAuth 授權。

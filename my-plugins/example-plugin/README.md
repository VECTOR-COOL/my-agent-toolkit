# example-plugin

範例 plugin 骨架，用來測試「一個 repo（marketplace）放多個 plugin」。版本 `0.1.0`。

## 結構

| 路徑 | 用途 |
|------|------|
| `.claude-plugin/plugin.json` | Claude Code manifest |
| `plugin.json` | Codex 可攜 manifest（hooks 指向 `hooks/codex.json`） |
| `skills/<name>/SKILL.md` | skill，`name` 與資料夾名一致 |
| `rules/example-rules.md` | 常駐規則，由 SessionStart hook 注入 |
| `hooks/hooks.json`、`hooks/codex.json` | Claude／Codex 的 SessionStart hook |
| `scripts/inject-rules.mjs` | 讀規則並輸出 `additionalContext` JSON |

要加 MCP：Claude 放根目錄 `.mcp.json`，Codex 放 `mcp.json`，格式見 [`../my-workflow`](../my-workflow/) 的同名檔。

## 安裝（手動）

```text
/plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit
/plugin install example-plugin@my-agent-toolkit
```

裝完開新對話，輸入 `example hello`，應回覆已載入並提到常駐規則。

## 移除

`/plugin uninstall example-plugin@my-agent-toolkit`。不需要時，刪除本目錄並從兩個 marketplace 檔移除對應項目。

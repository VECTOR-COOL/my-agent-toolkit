# Cursor Plugin adapter

> 快照日期：2026-10-16。Cursor 的 plugin format 與 Agent Plugins portable core 有重疊，但不是同一份 manifest 契約。

## 官方來源

- Plugin 建立：<https://cursor.com/docs/plugins/building>
- Plugin 規格：<https://cursor.com/docs/plugins/reference>
- Agent Skills：<https://cursor.com/docs/context/skills>

## 何時需要 Cursor adapter

只交付 skills 或標準 MCP 時，先保留 Agent Plugins root `plugin.json`、`skills/`、`mcp.json`。需要下列 Cursor-only 能力時，才加入 `.cursor-plugin/plugin.json`：

- rules
- agents
- commands
- hooks
- variables
- Cursor marketplace metadata

Cursor manifest 可指向 skills 與 MCP，也可宣告上述元件；它是 adapter，不能取代 portable root manifest。

## Layout

```text
my-plugin/
├── plugin.json
├── skills/
├── mcp.json
└── .cursor-plugin/
    └── plugin.json
```

Cursor local plugins 位於 `~/.cursor/plugins/local`。安裝或複製到該位置是外部狀態變更，只有使用者明確要求時才執行。

## Placeholder 差異

Agent Plugins v1 的 `${PLUGIN_ROOT}` 與 `${PLUGIN_DATA}` 不會由 Cursor 展開。Cursor plugin config 使用 `${CURSOR_PLUGIN_ROOT}` 指向 plugin root。

- 不要直接把 portable `mcp.json` 內的 placeholders 全域取代。
- 需要 bundled stdio MCP 時，將 Cursor config inline 放入 Cursor manifest，或由其 `mcpServers` 指向專用 config；保留 root `mcp.json` 作 portable 版本。
- Portable 與 Cursor configs 各自驗證，並在 Cursor 中實際啟動至少一次。

## Skill frontmatter

Cursor 支援 `paths` 來限制 skill 套用範圍；這是 Cursor extension，不是 Agent Skills portable frontmatter。若同一 skill 必須跨 clients，將 `paths` 留在 Cursor-specific copy／adapter，或接受其他 clients 可能拒絕未知欄位的風險並清楚標示。

## 最低驗證

1. 執行 `node scripts/validate-agent-plugin.mjs <plugin-root> --target cursor`。
2. 驗證 `.cursor-plugin/plugin.json` 所有路徑存在且未逸出 plugin root。
3. 在 Cursor 本機安裝後，確認 skills 被發現、MCP 能啟動，並逐項測試 rules／agents／commands／hooks。
4. 靜態驗證通過不等於 Cursor runtime 相容。

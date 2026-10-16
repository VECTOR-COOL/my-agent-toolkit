# Agent Plugins v1.0.0 參考

> 快照日期：2026-10-16。執行新的建立或遷移任務時，若可連網，先檢查官方規格是否已有較新發布版本；不要把草案或 discussion 當成已發布規格。

## Canonical sources

- 規格：<https://agent-plugins.org/specification>
- Plugin schema：<https://agent-plugins.org/schemas/1.0.0/plugin.schema.json>
- MCP schema：<https://agent-plugins.org/schemas/1.0.0/mcp.schema.json>
- Agent Skills：<https://agentskills.io/specification>
- OpenAI packaging adapter：<https://developers.openai.com/plugins/build/plugins>
- Cursor plugin adapter：<https://cursor.com/docs/plugins/reference>

Agent Plugins v1.0.0 是 vendor-neutral 的 portability floor。它標準化 package identity、Agent Skills 與 MCP server configuration；distribution、installation、permissions、marketplace、hooks 與 client UI 不屬於 portable core。

## 固定結構

```text
my-plugin/
├── plugin.json                    # 必要
├── skills/                        # 選用；只探索直接子目錄
│   └── summarize/
│       ├── SKILL.md               # 必要於此 skill
│       ├── references/            # 選用
│       ├── scripts/               # 選用
│       └── assets/                # 選用
├── mcp.json                       # 選用
└── com.example.client/            # 選用 client extension directory
```

- `plugin.json`、`skills/` 與 `mcp.json` 的位置不可由 manifest 改寫。
- 缺少某個選用位置不是錯誤。
- `skills/` 若存在，client 只發現其直接子目錄中名為 `SKILL.md` 的 regular file，不遞迴尋找更深層 skills。
- 任一 package file 或 plugin-relative path 實際解析後都不得逸出 plugin root。

## plugin.json

最小 manifest：

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin"
}
```

Portable top-level 是 closed schema，只允許：

- `$schema`（必要）
- `name`（必要）
- `version`
- `description`
- `author`
- `homepage`
- `repository`
- `license`
- `keywords`
- `extensions`

`name` 限制：1–64 字元；只可用小寫 ASCII letters、數字、`.`、`-`；開頭與結尾必須是英數；禁止 `--` 與 `..`。

`author` 只可含 string 類型的 `name`、`email`、`url`。`extensions` 的每個 key 應為 client 控制的 reverse-domain namespace，value 必須是 object。

Semantic Versioning 與 SPDX license 是建議，不是 v1 schema 的強制語法；建立者仍應在準備發行時優先採用，且不得捏造未知值。

## Agent Skills

每個 `skills/<skill-name>/SKILL.md` 依 Agent Skills 規格撰寫：

```markdown
---
name: summarize
description: Summarize project records when a user asks for a concise status update.
---

Summarize the records and identify unresolved blockers.
```

必要 frontmatter：

- `name`：1–64 字元，小寫 letters、數字、hyphens；不可前後為 hyphen、不可有 `--`，且與父目錄相同。
- `description`：1–1024 字元，說明做什麼及何時使用。

選用欄位只有在有真實需求時加入。詳細規則、腳本與資產採 progressive disclosure，不要將所有內容塞入入口檔。

## mcp.json

Top-level 只允許 `$schema` 與 `mcpServers`：

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "docs": {
      "type": "streamable-http",
      "url": "https://example.com/mcp"
    }
  }
}
```

支援的 server shapes：

| `type` | 必要 | 選用 | 注意 |
| --- | --- | --- | --- |
| `stdio` | `command` | `args`, `env`, `cwd` | `command` 為單一 executable token；不得覆寫 `PLUGIN_ROOT`、`PLUGIN_DATA` |
| `streamable-http` | `url` | `headers` | 非 loopback 必須 HTTPS；headers 是公開 package data，不可放 secrets |
| `sse` | `url` | `headers` | deprecated legacy HTTP+SSE；client 可不支援 |

`plugin.json` 與 `mcp.json` 必須使用同一 Agent Plugins spec version。MCP entry 內只可使用該 transport schema 允許的欄位。

Portable placeholders：

- `${PLUGIN_ROOT}`：client 管理的 plugin root。
- `${PLUGIN_DATA}`：client 管理的持久 runtime data root。

`command` 不做 placeholder expansion。`args`、`env`、`cwd` 可依規格使用 placeholders。不要依賴 shell parsing 或把多段 command 塞進一個 string。

## Client extensions 與相容格式

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-plugin",
  "extensions": {
    "com.example.client": {
      "setting": true
    }
  }
}
```

- Client-specific manifest data 放入 `extensions`。
- 只有 client 官方文件已定義 namespace 與 shape 時，才加入對應的 `extensions` data；不要自行發明契約。
- Agent Plugins extension files 放入與 namespace 完全相同的 root directory；若 client 另有官方 layout，將它視為獨立 adapter。
- Extensions 不會變成 portable components；未知 namespace 可由其他 clients 忽略。
- OpenAI-specific presentation、registered app mapping、onboarding 與 hooks 使用 `extensions.com.openai`。`.codex-plugin/plugin.json` 是 compatibility fallback，不是 portable manifest。
- OpenAI 文件另允許 MCP server entry 內的 `extensions.com.openai.auth`；Agent Plugins v1.0.0 MCP schema 本身仍是 closed schema。使用這項能力時應標示為 OpenAI target extension，不可宣稱該 `mcp.json` 通過 strict portable schema。
- Cursor 使用 `.cursor-plugin/plugin.json` 描述 skills、MCP、rules、agents、commands、hooks 與 variables。Cursor 不展開 Agent Plugins 的 `${PLUGIN_ROOT}`／`${PLUGIN_DATA}`，其 adapter 使用 `${CURSOR_PLUGIN_ROOT}`。
- `.claude-plugin/plugin.json`、legacy Copilot manifest、marketplace catalogs 與 client config 都是 adapter／distribution layer，不能取代 root portable manifest。

## Legacy migration mapping

| Legacy pattern | Portable v1 方向 |
| --- | --- |
| `.codex-plugin/plugin.json` 或 `.claude-plugin/plugin.json` 作為唯一 identity | 建立 root `plugin.json`；保留 legacy file 只作明確需要的 fallback |
| Manifest 內自訂 `skills` path | 將 skills 移至固定 `skills/<name>/SKILL.md`，移除 portable manifest 的 path field |
| `.mcp.json` | 轉為 root `mcp.json`，為每個 server 明確加入 `type`，並核對 schema |
| Root-level hooks、commands、agents、LSP config | 依 target client 官方 adapter layout 遷移；沒有已定義契約時保留並標示 unsupported，不可自行發明 namespace |
| Manifest 內 secrets 或 credential headers | 移除並改由 client-managed authentication／secret storage 提供 |

遷移時先保存原行為清單，再逐項標成 portable、client extension 或不支援。不要為通過 schema 而悄悄刪除仍有使用者價值的 legacy 行為。

## 驗證矩陣

| 層級 | 最低證據 |
| --- | --- |
| Manifest | JSON 可解析、schema ID 支援、required fields 與 closed fields 合法 |
| Skills | 每個直接子目錄的 `SKILL.md` 通過 Agent Skills validator 或等價檢查 |
| MCP config | JSON/schema 合法、版本一致、每個 entry 符合唯一 transport shape |
| Filesystem | 固定位置類型正確、real path 不逸出 plugin root |
| Security | 無 secrets；command、URL、headers、scripts 與 permissions 經人工檢視 |
| Runtime | 在 target client 實際安裝／載入；MCP 連線與工具呼叫依授權測試 |

本技能提供 `scripts/validate-agent-plugin.mjs` 做 deterministic preflight；它不是官方 certification。Cursor 目標使用 `--target cursor`，OpenAI／Codex 目標使用 `--target openai`。Agent Skills 官方參考 validator `skills-ref` 僅覆蓋 skill frontmatter，不取代 plugin 與 MCP 驗證；Windows 非 ASCII 內容應以 UTF-8 mode 執行。

Schema validation 只能證明結構；只有 target client runtime test 才能證明實際相容。發布到 marketplace 或 directory 還需要各 client 的額外 metadata、政策與審查。


# 其他平台設定 → Claude 對應

轉換原則：**保留原平台的檔案不刪**，共用內容收斂到 `AGENTS.md`，Claude 專屬的放 `CLAUDE.md`／`.claude/`。表中其他平台的路徑依常見慣例整理，以專案實際檔案為準。

| 平台 | 原檔 | Claude 對應 | 做法 |
|------|------|-------------|------|
| 通用 | `AGENTS.md` | `CLAUDE.md` 的 `@AGENTS.md` | 保留為唯一來源 |
| Cursor | `.cursor/rules/*.mdc`，`alwaysApply: true` | `.claude/rules/<topic>.md`，不加 `paths` | 全域規則優先併進 `AGENTS.md`，兩邊都讀 |
| Cursor | `.cursor/rules/*.mdc`，有 `globs` | `.claude/rules/<topic>.md`，`globs` 轉成 `paths` | Claude 版放 `.claude/rules/`，原檔保留；兩檔開頭互註「同步來源」 |
| Cursor | `.cursor/rules/*.mdc`，只有 `description`（按需） | `.claude/skills/<name>/SKILL.md` 或無 `paths` 的規則 | 依內容是流程還是規範決定 |
| Cursor | `.cursorrules`（舊版） | 併入 `AGENTS.md` | 原檔保留 |
| Cursor | `.cursor/mcp.json` | 專案根 `.mcp.json` | 同為 `mcpServers`；金鑰改 `${VAR}` |
| Cursor | `.cursor/commands/*.md` | `.claude/commands/*.md` 或 skill | |
| Cursor／通用 | `.cursor/skills/`、`.agents/skills/` 等的 `SKILL.md` | `.claude/skills/<name>/SKILL.md` | 格式相同，可直接複製；選一處當來源 |
| GitHub Copilot | `.github/copilot-instructions.md` | 共用內容併入 `AGENTS.md`，或 `CLAUDE.md` 用 `@` 引用 | 原檔保留 |
| Codex | `AGENTS.md`、`.codex/` | `AGENTS.md` 共用；`.codex/` 不動 | |
| Gemini CLI | `GEMINI.md` | 併入 `AGENTS.md` 或 `@` 引用 | 原檔保留 |
| Windsurf | `.windsurfrules`、`.windsurf/rules/` | 同 Cursor 規則 | 原檔保留 |
| ChatGPT | 自訂指示、GPT 設定（不在 repo） | 有書面版本就併入 `AGENTS.md` | |

## 判斷要不要併進 AGENTS.md

- 所有 agent 都該遵守的（建置、測試指令、程式風格、禁止事項）→ `AGENTS.md`。
- 只對 Claude 有意義的（plan mode 時機、Claude 的 skill／hook 用法）→ `CLAUDE.md`。
- 只對部分路徑有效的 → `.claude/rules/` 加 `paths`（Cursor 端保留 `.mdc`）。

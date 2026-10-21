# Claude Code 專案設定最佳實踐

出處：[記憶與 CLAUDE.md](https://code.claude.com/docs/en/memory)、[設定](https://code.claude.com/docs/en/settings)。標「未確認」的是官方文件沒寫清楚、需實機驗證的。

## 指令檔

- Claude 讀 `CLAUDE.md`（或 `.claude/CLAUDE.md`）。工作目錄與上層的會在啟動時載入；**子目錄的 `CLAUDE.md` 在 Claude 讀寫該目錄檔案時才載入**。
- Claude Code v2.1.277 起可直接讀 `AGENTS.md`，但**只在沒有任何 `CLAUDE.md`／`CLAUDE.local.md` 時**。兩者並存時只讀 `CLAUDE.md`。
- 要多平台共用一份：保留 `AGENTS.md` 為唯一來源，`CLAUDE.md` 第一行寫 `@AGENTS.md` 引用，下面只放 Claude 專屬內容。這樣新舊版本、讀不到 `AGENTS.md` 的 session 都能用，也不會讀兩次。
- `@path` 引用：相對路徑以引用它的檔案為基準，最多遞迴 4 層。引用不會減少 context 成本。
- `CLAUDE.local.md`：個人、不入版控的補充，加進 `.gitignore`。注意它會讓 Claude 不再直接讀 `AGENTS.md`，所以有它時 `CLAUDE.md` 必須 `@AGENTS.md`。

## 寫法

- 每個 `CLAUDE.md` **200 行以內**。太長會吃 context、降低遵循度。
- 寫可驗證的具體指令：「執行 `npm test` 再 commit」，不寫「記得測試」。
- 用標題與條列分組；互相矛盾的指令 Claude 可能任選一條，要定期清掉。
- 只跟部分程式碼有關的規則，放 `.claude/rules/` 並加 `paths`，碰到相符檔案才載入。
- `CLAUDE.md` 是 context，不是強制設定。真的要擋的行為用 `PreToolUse` hook。

## `.claude/rules/`

- 每檔一個主題（`testing.md`、`api-design.md`），子目錄會遞迴發現，支援 symlink。
- 沒有 `paths` 的規則每次都載入；有 `paths` 的只在讀寫相符檔案時載入：

```markdown
---
paths:
  - "src/api/**/*.ts"
---
```

## `.claude/` 其餘

| 路徑 | 用途 | 入版控 |
|------|------|--------|
| `.claude/settings.json` | 全隊共用：`permissions`、`hooks`、`env`、`enabledPlugins`、`extraKnownMarketplaces` | 是 |
| `.claude/settings.local.json` | 個人覆寫（手動建立要自己加 `.gitignore`） | 否 |
| `.claude/skills/<name>/SKILL.md` | 專案 skill（Agent Skills 格式） | 是 |
| `.claude/commands/*.md` | 自訂斜線命令 | 是 |
| `.claude/agents/*.md` | 專案 subagent | 是 |
| `.mcp.json`（專案根） | 專案 MCP server，金鑰用 `${VAR}` | 是 |

- 設定檔是嚴格 JSON，不能有註解或結尾逗號。
- `permissions.allow`、`extraKnownMarketplaces` 等要等成員**信任資料夾**後才生效；`deny`、`ask` 立即生效。

## 起手與檢查

- 沒有 `CLAUDE.md`：先跑 `/init` 讓 Claude 分析專案產生初稿，再精簡。已有時 `/init` 會建議改進。
- `/doctor prompt-audit`：找出過時、矛盾、引用不存在檔案的指令。
- `/status` 看載入了哪些設定來源；`claude doctor` 看設定檔錯誤。

## 雲端 session

- 全新 clone，只帶 repo 內容（`CLAUDE.md`、`.claude/settings.json`、`.claude/skills/` 等）。
- 不載入 plugin 與 marketplace，不讀個人設定。雲端要用的規則必須放進 repo。
- 細節見 [`my-claude-cloud-agent`](../skills/my-claude-cloud-agent/SKILL.md)。

---
name: my-agent-plugin-creator
description: 依 Agent Plugins 開放標準建立、更新、遷移或驗證可攜式 AI agent plugin，組合 Agent Skills 與 MCP servers，並隔離 OpenAI、Codex、Cursor、Claude Code 等 client-specific 設定。用於 plugin scaffold、plugin.json、mcp.json、skills packaging、相容性轉換或發布前封裝檢查；不適用於 WordPress 或一般應用框架的 plugin 開發。
metadata:
  version: "1.0.0"
  agent-plugins-spec: "1.0.0"
---

# 開放標準 Agent Plugin Creator

## 目的

建立以 Agent Plugins 規格為核心、可被相容 clients 載入的最小 plugin package。Portable core 與 client adapter 必須分離；不要把單一產品的格式宣稱為開放標準。

## 先判斷任務

- 若使用者要的是 AI agent plugin、Agent Skills bundle 或 MCP package，使用本技能。
- 若是 WordPress、瀏覽器、IDE runtime、build tool 或其他應用框架的 plugin，改用該領域技能。
- 區分「新建」、「更新既有 package」、「legacy 格式遷移」、「驗證」與「發布」。驗證不授權修改；建立 package 不授權安裝、註冊、上傳或發布。
- 新 package 預設使用最新已發布的 Agent Plugins 規格；既有 package 預設保留其宣告版本。升級 schema 前先說明相容性影響，不可靜默改版。

## 規格來源

需要建立、遷移或判定 conformance 時，先讀 [Agent Plugins v1 參考](references/agent-plugins-v1.md)。

- 時效允許時，以 `https://agent-plugins.org/specification` 與其 canonical schemas 為準。
- Skill 格式以 `https://agentskills.io/specification` 為準。
- 規格本文與 machine-readable schema 衝突時，以規格本文為準。
- Client 文件只決定 namespaced extension、安裝與 marketplace 行為，不得改寫 portable core。

## 版本與合規邊界

- Frontmatter 的 `metadata.version` 是本 skill 的版本；`metadata.agent-plugins-spec` 是本版已核對的 Agent Plugins 規格版本。兩者不可混用。
- 本資料夾依 Agent Skills 規格組織，本身不是完整的 Agent Plugin package。要作為 portable plugin 發布時，必須放入 `<plugin-root>/skills/my-agent-plugin-creator/`，並由 plugin root 的 `plugin.json` 宣告 Agent Plugins schema。
- 產出的 plugin 在 `plugin.json.version` 維護自己的 SemVer；不可自動複製本 skill 的版本。
- 修改本 skill 時依 SemVer 調整 `metadata.version`：不相容工作流程為 major、向後相容能力為 minor、修正或文字澄清為 patch。
- Agent Plugins 規格升級時，先重新核對 normative specification 與兩份 canonical schemas，再更新 `metadata.agent-plugins-spec` 和 reference；不得只改版號。

## 實作偏好

- 在目標專案沒有既定語言或更強限制時，輔助腳本預設使用 Node.js ES Modules（`.mjs`）；這是使用者慣用的腳本格式。
- 優先使用 Node.js built-in APIs，沒有具體需要時不增加 npm dependencies。
- 產生器與修改型腳本應提供 `--dry-run`，預設不得覆寫既有檔案；需要覆寫時使用明確的 `--force` 或等價選項。
- `.mjs` 腳本至少提供清楚的 `--help`、非零失敗 exit code 與可理解的錯誤訊息。
- Python 不是 Agent Skills 或 Agent Plugins 的必要條件。只有目標專案已有 Python toolchain、官方工具只能用 Python，或使用者明確指定時才優先採用。

## 工作流程

### 1. 確認目標與現況

1. 找出目標 plugin root、repo 規則、現有 manifest、skills、MCP 設定及未提交變更。
2. 確認 plugin 的單一明確目的與預期使用情境。
3. 選擇最小形態：skills only、MCP only，或 skills + MCP。
4. 只在結果會明顯改變 package identity、權限、安全或相容性時提問；其餘採最小且可逆的預設。

### 2. 建立 portable core

以 plugin root 的固定位置為準：

```text
plugin-name/
├── plugin.json
├── skills/       # 有 Agent Skills 時才建立
└── mcp.json      # 有 MCP servers 時才建立
```

- `plugin.json` 必須位於 root，並宣告 canonical `$schema` 與合法 `name`。
- 只加入已知且真實的 metadata；未知的 author、URL、license 或 version 不可捏造。
- Skills 只放在 `skills/<skill-name>/SKILL.md`；每個 skill 是 `skills/` 的直接子目錄。
- MCP 設定只放在 root `mcp.json`，schema 版本必須與 `plugin.json` 對齊。
- 不建立空目錄、空 config、範例 placeholder 或未使用資產。

### 3. 設計 Agent Skills

- 每個 skill 對應可辨識的使用者目標；`description` 同時說明能力與觸發時機。
- Skill 提供工作流程與判斷；MCP server 提供資料、工具、驗證與受控動作。不要在兩者重複實作同一責任。
- `SKILL.md` 保持精簡；條件式細節放入 `references/`，可重複且需確定性的操作才放入 `scripts/`。
- Skill 名稱必須符合 Agent Skills 規格並與父目錄完全一致。
- 保留使用者的工具選擇與權限界線；skill 不得以安裝後即視為獲得外部系統寫入權限。

### 4. 設定 MCP servers

- 沒有 live data、外部 action、認證或受控工具需求時，不要增加 MCP server。
- 使用規格允許的 transport；新 remote server 優先 `streamable-http`，不要為新整合選用 deprecated `sse`。
- `stdio.command` 是單一 executable token，不是 shell command；參數分別放入 `args`。
- Package path 必須留在 plugin root；runtime data 應使用 client 提供的 `PLUGIN_DATA`。
- 禁止把 token、API key、cookie、密碼或私人 header 寫入 `plugin.json`、`mcp.json`、skills、scripts 或範例。Portable v1 的認證與秘密保存由 client 管理。

### 5. 隔離 client adapter

- Portable manifest 的 client-specific data 只能放在 `extensions.<reverse-domain-namespace>`。
- Client-specific files 放在與 namespace 同名的 root directory。
- 只有使用者指定 target client，或交付必須依賴該 client 時才新增 adapter。
- OpenAI/Codex 相容 metadata 放在 `extensions.com.openai`；legacy `.codex-plugin/plugin.json` 僅在明確需要 compatibility fallback 時建立，且不可取代 root `plugin.json`。
- Marketplace、安裝、啟用、workspace publication 與 directory submission 不屬於 portable standard；沒有明確要求時不要執行。

### 6. 驗證

完成前至少執行：

1. 解析所有 JSON，確認 schema identifier、版本對齊、closed fields 與名稱限制。
2. 驗證每個 `SKILL.md` 的 frontmatter、名稱與目錄一致性；有 `skills-ref` 或受信任 validator 時使用它。
3. 確認固定元件位置、所有 plugin-relative path、symlink／junction 實際解析結果都留在 plugin root。
4. 掃描明顯 secrets、placeholder、空元件與未被引用的 client config。
5. 若新增 scripts，實際執行其 help、dry-run 或最小安全案例；若設定 MCP，只在已授權且安全時啟動連線測試。
6. 在 Git repo 內檢查 `git diff --check` 與 scoped diff，確保未覆寫無關變更。

若缺少 validator、runtime、credentials 或 target client，明確標示「未驗證」，不要把靜態檢查寫成 runtime 相容證明。

## 完成回報

簡短列出：

1. Plugin root 與建立／修改的 portable components。
2. 使用的 Agent Plugins schema 版本。
3. Client adapters，以及它們為何不是 portable core。
4. 實際執行的驗證與結果。
5. 尚未測試的 client、MCP 連線、安裝或發布步驟。

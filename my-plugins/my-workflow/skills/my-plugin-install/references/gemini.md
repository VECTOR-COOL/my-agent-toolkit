# Gemini 與 Antigravity 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。涵蓋 **Google Antigravity（AGY：Antigravity 2.0 桌面版、Antigravity IDE、`agy` CLI）**、**Gemini CLI** 與 **Gemini 網頁**。2026-10-31 核對 Antigravity 內建 `plugin`／`agy-customizations` 規格與本機 `gemini` CLI（`gemini extensions validate ./my-plugins/my-workflow` 實測通過；實際對話載入與更新仍須於新對話驗證）。

## 先選安裝目標（Marketplace 與 Web 支援範圍）

先確認使用者要求的目標是「**支援 Web 的 marketplace**」、「**Antigravity 本機／專案 plugin**」或「**Gemini CLI extension**」。**不得把本機安裝（Antigravity `plugins.json`／`~/.gemini/config/plugins/` 或 Gemini CLI `extensions`）算成支援 Web 的 marketplace 安裝**，也不自動偷換目標平台。

| 目標 | 方法 | Marketplace／Web 支援與驗證範圍 |
|------|------|------|
| **對話內安裝到支援 Web 的 marketplace**（目標為 **Gemini 網頁** `gemini.google.com`） | **平台不支援** → 先執行「檢查更新（只讀）」，再依下方「失敗或環境不適用」回報限制並引導 | Gemini 網頁目前僅有 Gems（手動貼指示／知識檔），**無私人或工作區 plugin／skill marketplace**；不得以本機安裝、Gem 貼文或改裝到 ChatGPT 冒充完成 |
| **對話內安裝到支援 Web 的 marketplace**（目標為 **ChatGPT Web** 或 **claude.ai Web**） | 先在對話內完成來源端「檢查更新（只讀）」，再依下方引導轉至目標平台執行（OpenAI 接 [openai.md](openai.md)、Claude 接 [claude.md](claude.md)） | Antigravity／Gemini 對話內沒有 OpenAI Plugin Creator／Management 工具或 claude.ai 帳號寫入能力；須附跨對話交接提示，於目標 Web 驗證 |
| **Google Antigravity（AGY）**（對話內本機／專案安裝與更新） | 下節「Antigravity（AGY）：對話內安裝與更新」（`plugins.json` 指向來源目錄，或安裝至 `~/.gemini/config/plugins/my-workflow` 並以 RPC 管理） | 原生支援 `plugin.json` 與 `skills/*/SKILL.md`；屬本機／工作區範圍，**不會同步到 Gemini 網頁**。公開 Agent Marketplace（`InstallCustomization`）僅限官方 catalog，不支援私有 GitHub repo |
| **本機 Gemini CLI** | 下節「Gemini CLI：本機 extension 與 skills」（`gemini extensions link`／`install`／`update`） | 官方有 [Extensions Gallery](https://geminicli.com/docs/extensions/)，但 [安裝規格](https://geminicli.com/docs/extensions/reference/) 無支援 Web 同步的私人 marketplace 流程；僅限本機 CLI |

## 檢查更新（只讀）

安裝或更新前必做；使用者只要求「檢查更新」時，到回報結果為止，**不修改 `plugins.json`、不覆寫 `~/.gemini/config/plugins/`、不呼叫 `JetboxWriteState`／`InstallCustomization`／`DeletePlugin`，也不執行 `gemini extensions install|link|update`**。

1. **查目標環境目前已安裝狀態**：
   - **Antigravity（AGY）**：檢查全域 `~/.gemini/config/plugins.json`、專案 `.agents/plugins.json` 與 `~/.gemini/config/plugins/`，或透過 Language Server RPC `GetAllPlugins` 搭配 `jq` 過濾（`[.plugins[] | {name, dir: (.path | split("/") | last), disabled: (.disabled // false), isGlobal, skills: [.skills[]?.name]}]`；**嚴禁未經 `jq` 過濾直接讀取 `GetAllPlugins`**，否則會內嵌所有 `SKILL.md` 全文塞爆 context）。若已註冊或安裝 `my-workflow`，讀取該路徑下的 `pack.yaml` 版本與對應 Git commit（若為 Git 目錄）。
   - **Gemini CLI**：執行 `gemini extensions list`（可一併查 `gemini skills list`），確認是否已安裝 `my-workflow` 及其版本與來源路徑。
   - **支援 Web 的 marketplace 目標**：在 Antigravity／Gemini 對話內無法直接查詢帳號端已安裝 release（Gemini Web 無此機制；ChatGPT Web／claude.ai 需對應平台工具或介面），必須標明「帳號端狀態：目前環境無法直接查詢（需於目標平台確認）」，不得拿本機狀態代替。
2. **查來源 repo `main` 最新狀態**：
   - 透過唯讀 Git 查詢（`git fetch origin main`、`git rev-parse --short origin/main`、`git show origin/main:my-plugins/my-workflow/pack.yaml`）或已授權的 GitHub 工具，取得來源 repo `main` 的最新 commit、`pack.yaml` 版本與 `my-plugins/my-workflow/` 內容。遠端讀取失敗時，本地 `origin/main` 只算舊快照，不能宣稱是最新。
   - 區分開發分支與發布分支：正式安裝與 marketplace 一律以 `main` 為準；若工作區 `develop` 領先 `origin/main`，一併標示「`develop` 有尚未合併至 `main` 的變更」。
3. **比對 plugin 本身的內容差異**：
   - 比對已安裝路徑（或已記錄的來源 commit）與 `origin/main` 在 `my-plugins/my-workflow/` 下的實際檔案差異（如 `git diff <installed-commit>..origin/main -- my-plugins/my-workflow`）；repo 其他 plugin 或獨立 skill 的 commit 不代表 `my-workflow` 有更新。
4. **回報四種狀態之一**（「**已是最新／有更新／尚未安裝／無法確認**」）：
   - 回報包含：檢查時間、目標環境與 scope、目前安裝狀態／路徑／版本／commit、來源 `origin/main` commit／標籤（及 `develop` 版本若不同）、內容差異摘要、驗證狀態、下一步。未取得的欄位標「未取得」，不填猜測值。

## Antigravity（AGY）：對話內安裝與更新

Antigravity 原生支援 `my-plugins/my-workflow/plugin.json`。先完成「檢查更新（只讀）」並說明將執行的動作；使用者已明確授權安裝或更新時即可執行。

### 首次安裝（二選一）

**方式 A：`plugins.json` 指向本地 clone 的 marketplace 目錄（推薦，更新免重裝）**

1. 確認本地已 clone `https://github.com/VECTOR-COOL/my-agent-toolkit` 且可讀取（正式使用切到 `main` 分支）。
2. 在全域 `~/.gemini/config/plugins.json`（跨專案生效）或專案 `.agents/plugins.json`（僅本工作區生效）登記 `entries` 指向 `<repo>/my-plugins`（`entries` 會往下一層子目錄掃描 `plugin.json`，以 `"include_only": ["my-workflow"]` 指定只載入本 plugin）：

```json
{
  "entries": [
    {
      "path": "d:/PROJECTS/my-agent-toolkit/my-plugins",
      "include_only": ["my-workflow"]
    }
  ]
}
```

**方式 B：安裝至 `~/.gemini/config/plugins/my-workflow/` 並以 Language Server RPC 管理**

1. 將來源 repo `main` 的 `my-plugins/my-workflow/` 同步至 `~/.gemini/config/plugins/my-workflow/`。
2. 透過 Language Server Connect 端點（`http://${ANTIGRAVITY_LS_ADDRESS}/exa.language_server_pb.LanguageServerService/<Method>`，Header 帶 `x-codeium-csrf-token: ${ANTIGRAVITY_CSRF_TOKEN}`）管理生命周期。**所有變更一律以安裝資料夾名 `<dir>`（`my-workflow`）為 key，絕不直接手改 `~/.gemini/config/config.json`**：
   - 盤點確認：`lsrpc GetAllPlugins '{"workspaceUris":["file:///path/to/workspace"]}' | jq '[.plugins[] | {name, dir: (.path | split("/") | last), disabled: (.disabled // false), isGlobal, skills: [.skills[]?.name]}]'`
   - 啟用／停用：`lsrpc JetboxWriteState '{"userConfig":{"plugins":{"my-workflow":{"enabled":true}}}}'`（立即生效，免重啟）。
   - 移除：`lsrpc DeletePlugin '{"pluginId":"my-workflow"}'`（若原本是 `disabled`，刪除前先用 `JetboxWriteState` 設回 `"enabled": true`，避免殘留設定導致重裝後預設停用；內建 `/builtin/plugins/` 不可移除）。
   - 注意：`lsrpc InstallCustomization '{"id":"<marketplace-id>"}'` **僅限已上架公開 Agent Marketplace 目錄的項目**；`my-workflow` 為私有 repo 且不上架公開市集，請勿對 `my-workflow` 呼叫 `InstallCustomization`。

### 更新已安裝的 plugin

1. 先完成「檢查更新（只讀）」；無內容差異則回報「已是最新」，不重複寫入。
2. **方式 A（`plugins.json`）**：在本地來源 repo 確認切到 `main` 並執行 `git pull origin main`（若新版還在 `develop`，先依 [`docs/RELEASE.md`](../../docs/RELEASE.md) 完成發布合併至 `main`）。
3. **方式 B（`~/.gemini/config/plugins/my-workflow/`）**：將來源 `main` 的 `my-plugins/my-workflow/` 同步更新至 `~/.gemini/config/plugins/my-workflow/`，保留使用者在 `config.json` 的啟用狀態，再以 `GetAllPlugins`（過濾 `jq`）確認元件清單。

### 驗證與相容性說明

- 回報管理頁面連結：`[my-workflow](customization://my-workflow)`（**必須使用 `customization://<dir>`**，不可使用 `plugin://` 或 `plugins://`）。
- **重啟要求**：首次建立 plugin 目錄或新增 `plugins.json` 項目後，必須提醒使用者**重啟 Antigravity** 才會發現新目錄；重啟前點開 `customization://` 頁面會顯示尚未安裝。啟用／停用與移除則立即生效。
- **元件相容性（誠實標示）**：
  - **Skills**：`skills/*/SKILL.md` 自動掃描並按需載入（Progressive Disclosure）。
  - **規則**：Antigravity 自動載入 plugin 下 `rules/*.md`（情境規則）；全域規則 `skills/my-workflow/references/global.md` 於載入入口 skill `my-workflow` 時讀取（或在工作區由 `AGENTS.md`／`GEMINI.md` 載入）。
  - **Hooks 與 MCP**：Antigravity 原生 plugin（含 `plugin.json`）只讀取 plugin 根目錄的 `hooks.json`（`injectSteps` 契約）與 `mcp_config.json`；本 plugin 目前的 `hooks/hooks.json`（Claude）、`hooks/codex.json`（Codex）與 `.mcp.json`／`mcp.json` **不會**被 Antigravity 自動當成原生 hook／MCP 載入。若需在 Antigravity 使用 Composio MCP，請引導在 `~/.gemini/config/mcp_config.json` 設定 Streamable HTTP 端點 `"composio": {"url": "https://connect.composio.dev/mcp"}`。未在新對話實際完成工具呼叫前，不得宣稱 hook 或 MCP 已生效。

## Gemini CLI：本機 extension 與 skills

- extension 定義在 plugin 目錄的 `gemini-extension.json`（`contextFileName` 指向 `GEMINI.md`），`GEMINI.md` 指到 `skills/my-workflow/references/global.md` 與 `skills/my-workflow/SKILL.md`，不複製內容。本機 `gemini extensions validate ./my-plugins/my-workflow` **已實測通過**。
- 先完成「檢查更新（只讀）」，確認本地 clone 的來源 repo 在 `main` 分支（需在一般 shell 執行，Gemini CLI 互動模式內不支援 `extensions install|link`）：
  - **連結安裝（推薦，更新免重裝）**：

    ```text
    gemini extensions link ./my-plugins/my-workflow
    ```

    連結模式下，本地 repo `git pull` 後變更會直接反映，不必重裝。
  - **複製安裝**：

    ```text
    gemini extensions install ./my-plugins/my-workflow
    ```

    CLI 安裝時會複製一份快照，之後來源變動不會自動反映。
- GitHub URL 直裝要求 repo 根目錄就是 extension；本 repo 根目錄是多 plugin 的 marketplace，所以不走根 URL 直裝。
- **更新**：先在來源 repo 執行 `git pull origin main`；若用 `link` 安裝即已生效，若用 `install` 安裝則重新執行 `gemini extensions install ./my-plugins/my-workflow`（或 `gemini extensions update my-workflow`）。
- **驗證**：執行 `gemini extensions list`（及 `gemini skills list`）確認已列出，並開新 Gemini CLI 對話實際執行 skill 任務驗證。規則靠 `GEMINI.md` 指示讀 `global.md`。

## Gemini 網頁（`gemini.google.com`）

沒有私人 plugin／skill marketplace、沒有 hook 與自訂 MCP 匯入機制；**不屬於 marketplace 安裝**。若使用者明確只要求在 Gemini 網頁使用規則與特定 skill（非 market 安裝）：

1. 把 `skills/my-workflow/references/global.md` 與 `skills/my-workflow/SKILL.md` 貼到 **Gem** 指示。
2. 需要的子 skill 內容貼進指示或上傳為知識檔。
3. 更新時手動重貼／重傳，並標示「手動 Gem 指示，非 marketplace 安裝」。

## 失敗或環境不適用：引導下一步

先按 [SKILL.md](../SKILL.md) 回報失敗階段、實際錯誤（移除憑證）與已完成進度（如來源 `main` 檢查結果），再給對應操作：

| 情境 | 如何引導與接續 |
|------|------|
| 要求「對話內安裝到支援 Web 的 market」，且目標是 **Gemini 網頁** | 明確說明 Google Gemini 網頁目前只有 Gems，無支援私人／工作區 plugin 或 skill 的 Web marketplace；不能以本機 Antigravity／Gemini CLI 安裝或貼 Gem 指示冒充完成。詢問是否改裝到支援 Web marketplace 的 **ChatGPT Web**（走 [openai.md](openai.md)）或 **claude.ai Web**（走 [claude.md](claude.md)），或改採本機 Antigravity／手動 Gem 替代方案。 |
| 要求「對話內安裝到支援 Web 的 market」，且目標是 **ChatGPT Web** | 說明目前對話在 Antigravity／Gemini 環境，沒有 OpenAI 的 `search_plugins`／`create_plugin`／`update_plugin` 帳號端工具。先在對話內完成來源 `main` 的唯讀檢查，再提供下方**跨對話交接提示**，引導使用者到同一帳號／工作區的 ChatGPT（或具備帳號端工具的對話）貼上接續執行，切勿改裝成本機 plugin 充數。 |
| 要求「對話內安裝到支援 Web 的 market」，且目標是 **claude.ai Web** | 說明目前對話無法代為操作 claude.ai 帳號外掛頁。先在對話內完成來源 `main` 的唯讀檢查，再依 [claude.md](claude.md)「對話內：安裝到帳號 marketplace」一步一步引導使用者打開 👉 [Customize > Plugins](https://claude.ai/customize/plugins) → **Add → Add marketplace** 輸入 `VECTOR-COOL/my-agent-toolkit` → 授權 [Claude GitHub App](https://github.com/apps/claude/installations/select_target) → 安裝 `my-workflow` 並開啟 **Sync automatically**。 |
| 在 Antigravity 呼叫 `InstallCustomization` 出現 `source not found` | `InstallCustomization` 僅能安裝已上架 Antigravity Agent Marketplace 公開目錄（catalog）的項目；`my-workflow` 是私有 repo 且不上架公開市集，請改走本檔「Antigravity（AGY）：對話內安裝與更新」的 `plugins.json` 或 `~/.gemini/config/plugins/my-workflow/` 方式。 |
| 檢查發現 `origin/main` 落後於本地 `develop`（新版還沒發布到 `main`） | 說明正式安裝與各平台 marketplace 一律抓 `main` 分支；只改 `develop` 不會進入 `main`。引導先執行專案 skill `my-plugin-release`（或依 [`docs/RELEASE.md`](../../docs/RELEASE.md) 檢查版本、跑 `check-release.mjs`、合併 `develop` 到 `main` 並 push），完成後再更新。 |
| 私有 GitHub repo 無法讀取（`git fetch` 失敗或權限不足） | 保留實際錯誤訊息，引導在本機執行 `gh auth login` 或設定 SSH key 授權讀取 `VECTOR-COOL/my-agent-toolkit`；不要求使用者貼出 token。無法讀遠端時標示「無法確認最新遠端狀態」，不拿本地舊分支冒充最新。 |
| Antigravity 已設定 `plugins.json` 或建立目錄，但點 `[my-workflow](customization://my-workflow)` 顯示空白或找不到 skill | 說明 Antigravity 只在啟動時掃描新 plugin 目錄與 `plugins.json`，引導使用者**重啟 Antigravity** 後再開新對話驗證；若曾停用，用 `JetboxWriteState` 確認 `"enabled": true`。 |
| Antigravity 中 Composio MCP 或 SessionStart 自動注入未生效 | 說明 Antigravity 原生 plugin 只讀 plugin 根目錄的 `mcp_config.json` 與 `hooks.json`（`injectSteps` 格式），不讀 Claude／Codex 專用檔。引導在 `~/.gemini/config/mcp_config.json` 加入 `"composio": {"url": "https://connect.composio.dev/mcp"}`，規則則由載入 `my-workflow` skill 時讀取 `references/global.md`。 |
| 在 Gemini CLI 互動對話內輸入 `gemini extensions install` 失敗 | 說明 `gemini extensions install|link|update` 是系統 shell 命令，不是 Gemini CLI 互動模式內的斜線指令；引導在一般終端機（PowerShell／bash）執行。 |

需要轉往支援 Web marketplace 的目標環境（如 ChatGPT／Codex 帳號端對話）接續時，提供可直接貼上的交接提示（只填實際查得的值，未知寫「未取得」）：

```text
請檢查並接續 my-workflow 的安裝／更新，目標是支援 Web 的帳號端 marketplace。
目標平台與帳號／工作區：<ChatGPT Web 或 claude.ai Web；已知帳號／工作區資訊>
Plugin：<既有連結、backend ID 或 my-workflow@my-agent-toolkit；未取得就標未取得>
目前帳號端 release／版本：<未取得（前一個對話在 Antigravity／Gemini 環境，無法直查帳號端）>
來源：https://github.com/VECTOR-COOL/my-agent-toolkit，main，my-plugins/my-workflow
來源查證結果：origin/main commit <實際 SHA>（pack.yaml 版本 <實際版本>）；工作區 develop commit <實際 SHA>（版本 <實際版本>）
來源內容差異：<實際查得之差異摘要>
已完成／尚未完成：已完成來源 repo 唯讀檢查；因原環境無目標 Web marketplace 帳號端寫入工具，尚未執行帳號端安裝／更新
本次授權：<只檢查／已授權安裝或更新；照原要求填>
請先在目標環境查詢帳號端目前安裝與 release 狀態，比對上述來源資訊後接續完成，並在新 Web 對話實際驗證 skill。
```

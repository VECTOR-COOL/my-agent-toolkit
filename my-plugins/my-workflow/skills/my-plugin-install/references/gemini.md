# Gemini 與 Antigravity 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。涵蓋 **Google Antigravity（AGY：Antigravity 2.0 桌面版、Antigravity IDE、`agy` CLI）**、**Gemini CLI** 與 **Gemini 網頁**。2026-10-31 核對 Antigravity 內建 `plugin`／`agy-customizations` 規格與本機 `gemini` CLI（`gemini extensions validate ./my-plugins/my-workflow` 實測通過；實際對話載入與更新仍須於新對話驗證）。

## 先選安裝目標（Marketplace 與 Web 支援範圍）

先確認使用者要求的目標是「**支援 Web 的 marketplace**」、「**Antigravity 本機／專案 plugin**」或「**Gemini CLI extension**」。**不得把本機安裝（Antigravity `plugins.json`／`~/.gemini/config/plugins/` 或 Gemini CLI `extensions`）算成支援 Web 的 marketplace 安裝**，也不自動偷換目標平台。

| 目標 | 方法 | Marketplace／Web 支援與驗證範圍 |
|------|------|------|
| **對話內安裝到支援 Web 的 marketplace**（目標為 **Gemini 網頁** `gemini.google.com`） | **平台不支援** → 先執行「檢查更新（只讀）」，再依下方「失敗或環境不適用」回報限制並引導 | Gemini 網頁目前僅有 Gems（手動貼指示／知識檔），**無私人或工作區 plugin／skill marketplace**；不得以本機安裝、Gem 貼文或改裝到 ChatGPT 冒充完成 |
| **對話內安裝到支援 Web 的 marketplace**（目標為 **ChatGPT Web** 或 **claude.ai Web**） | 先在對話內完成來源端「檢查更新（只讀）」，再依下方引導轉至目標平台執行（OpenAI 接 [openai.md](openai.md)、Claude 接 [claude.md](claude.md)） | Antigravity／Gemini 對話內沒有 OpenAI Plugin Creator／Management 工具或 claude.ai 帳號寫入能力；須附跨對話交接提示，於目標 Web 驗證 |
| **Google Antigravity（AGY）**（對話內本機／專案安裝、檢查與自動更新） | 下節「檢查並更新」與「Antigravity（AGY）：對話內安裝與更新」（`plugins.json` 指向來源目錄，或安裝至 `~/.gemini/config/plugins/my-workflow` 並以 RPC 管理） | 原生支援 `plugin.json` 與 `skills/*/SKILL.md`；屬本機／工作區範圍，**不會同步到 Gemini 網頁**。公開 Agent Marketplace（`InstallCustomization`）僅限官方 catalog，不支援私有 GitHub repo |
| **本機 Gemini CLI** | 下節「檢查並更新」與「Gemini CLI：本機 extension 與 skills」（`gemini extensions link`／`install`／`update`） | 官方有 [Extensions Gallery](https://geminicli.com/docs/extensions/)，但 [安裝規格](https://geminicli.com/docs/extensions/reference/) 無支援 Web 同步的私人 marketplace 流程；僅限本機 CLI |

## 檢查更新（只讀）

安裝或更新前必做；使用者只說「檢查／檢查更新」時，到回報結果為止：**不修改 `plugins.json`、不覆寫 `~/.gemini/config/plugins/`、不呼叫 `JetboxWriteState`／`InstallCustomization`／`DeletePlugin`，也不執行 `gemini extensions install|link|update`**。

1. **直接上 GitHub 查來源 `main` 最新狀態**（私有 repo，優先用已登入的 `gh` 或 `github-mcp-server` 工具讀遠端 GitHub，讀不到就報「無法確認」，**不拿本地未同步的舊 `origin/main` 當最新**）：

   ```bash
   gh api repos/VECTOR-COOL/my-agent-toolkit/commits/main --jq .sha
   gh api "repos/VECTOR-COOL/my-agent-toolkit/commits?sha=main&path=my-plugins/my-workflow&per_page=1" --jq ".[0].sha, .[0].commit.message"
   gh api "repos/VECTOR-COOL/my-agent-toolkit/contents/my-plugins/my-workflow/pack.yaml?ref=main" --jq .content | base64 -d
   ```

   - 第二行是 **GitHub `main` 上最後一次動到 `my-plugins/my-workflow` 的 commit**；repo 其他目錄有新 commit 不算本 plugin 有更新。
   - 第三行讀取 GitHub `main` 上的 `pack.yaml` 版本標籤。若工作區 `develop` 領先 GitHub `main`，另外標示「本地 `develop` 有尚未合併發布至 `main` 的變更」。

2. **查目標環境目前已安裝版本與 SHA**：
   - **Antigravity（AGY）**：
     - 檢查全域 `~/.gemini/config/plugins.json`、專案 `.agents/plugins.json` 與 `~/.gemini/config/plugins/my-workflow/`，或透過 Language Server RPC `GetAllPlugins` 搭配 `jq` 過濾（`[.plugins[] | {name, dir: (.path | split("/") | last), disabled: (.disabled // false), isGlobal, skills: [.skills[]?.name]}]`；**嚴禁未經 `jq` 過濾直接讀取 `GetAllPlugins`**，否則會內嵌所有 `SKILL.md` 全文塞爆 context）。
     - 若由 `plugins.json` 指到本地 Git repo（如 `<repo>/my-plugins`）：查該 repo 下本 plugin 目前對應的 commit SHA 與 `pack.yaml` 版本：

       ```bash
       git -C <repo> log -n 1 --format=%H -- my-plugins/my-workflow
       ```

     - 若獨立安裝於 `~/.gemini/config/plugins/my-workflow/`：讀取目錄內的 `.source-commit`（安裝／更新時記錄的 GitHub `main` SHA）與 `pack.yaml`；若無 `.source-commit` 則比對目錄檔案與 GitHub `main`。
   - **Gemini CLI**：執行 `gemini extensions list`（可一併查 `gemini skills list`）確認是否已安裝 `my-workflow` 及來源路徑；若為 `link` 模式，同樣讀取所連結 repo 的 commit SHA。
   - **支援 Web 的 marketplace 目標**：在 Antigravity／Gemini 對話內無法直接查詢帳號端已安裝 release，必須標明「帳號端狀態：目前環境無法直接查詢（需於目標平台確認）」，不得拿本機狀態代替。

3. **在 GitHub 上比對差異並判定**：
   - 已安裝 SHA 等於第 1 步任一 SHA，或兩者間 `my-plugins/my-workflow/` 無差異 →「**已是最新**」；確認有差異 →「**有更新**」並摘要差異；讀不到任一側 →「**無法確認**」；目標環境明確沒裝 →「**尚未安裝**」。
   - 用 GitHub API 直接比對已安裝 `<SHA>` 到 `main` 之間有沒有動到本 plugin：

     ```bash
     gh api "repos/VECTOR-COOL/my-agent-toolkit/compare/<SHA>...main" --jq '[.status, .ahead_by, ([.files[].filename | select(startswith("my-plugins/my-workflow/"))] | length)]'
     gh api "repos/VECTOR-COOL/my-agent-toolkit/commits?sha=main&path=my-plugins/my-workflow&per_page=10" --jq '.[] | .sha[0:7] + " " + (.commit.message | split("\n")[0])'
     ```

     第一行回 `identical` 或第三個值（plugin 變更檔案數）為 `0` →「已是最新」；`ahead` 且檔案數 `> 0` →「有更新」，用第二行列出最近改動當差異摘要；`diverged` 或 `404` → 已安裝 SHA 不在 `main` 上（例如指在開發分支 `develop`），照實標出與 `main` 的差異。

4. **回報**：檢查時間、目標環境與 scope、目前安裝狀態／路徑／版本／SHA、GitHub `main` 最新版本／SHA（及 `develop` 狀態若不同）、內容差異摘要、下一步。未取得的欄位寫「未取得」，不填猜測值。

## 檢查並更新（執行這個 skill 時一次做完）

使用者說「更新」「檢查並更新」，或直接叫用這個 skill（未限定「只檢查」）時，**自動上 GitHub 檢查 `main` 並一次更新完成**。只說「檢查／檢查更新」時停在上一節回報。

1. **先跑「檢查更新（只讀）」上 GitHub 查 `main`**：
   - 若判定「已是最新」或「無法確認」，直接回報結果並停止，不盲目重裝或覆寫。
   - 若判定「尚未安裝」，已獲授權安裝時直接轉入下節「首次安裝」。
2. **判定「有更新」時，自動從 GitHub `main` 拉取更新**：
   - **Antigravity 方式 A（`plugins.json` 指到本地 repo）＋ Gemini CLI `link` 模式**：
     - 先檢查該本地 repo 的分支與工作區狀態（`git -C <repo> branch --show-current`、`git -C <repo> status -s`）：
       - 若在 `main` 分支且工作區乾淨：直接執行 `git -C <repo> fetch origin main && git -C <repo> merge --ff-only origin/main`，Antigravity 與 Gemini CLI `link` 即同時更新至最新 `main`。
       - 若該 repo 正處於 `develop` 或有未提交修改（開發工作區）：**不強制切換分支或洗掉未提交變更**；改將 GitHub `main` 最新版同步至獨立安裝目錄 `~/.gemini/config/plugins/my-workflow/`（下方方式 B），或提醒使用者目前掛載的是開發工作區（若 `develop` 領先 `main`，提醒先發版合併至 `main`）。
   - **Antigravity 方式 B（安裝於 `~/.gemini/config/plugins/my-workflow/`）**：
     - 直接從 GitHub `main` 將最新 `my-plugins/my-workflow/` 同步覆蓋至 `~/.gemini/config/plugins/my-workflow/`（例如先 `git fetch origin main` 再將 `origin/main:my-plugins/my-workflow` 匯出至該目錄，或用 `gh api repos/VECTOR-COOL/my-agent-toolkit/tarball/main` 下載解壓 `my-plugins/my-workflow/`），並將本次 GitHub `main` 的 plugin commit SHA 寫入 `~/.gemini/config/plugins/my-workflow/.source-commit`。
     - 保留 `~/.gemini/config/config.json` 內既有的啟用狀態，不手改 `config.json`。
   - **Gemini CLI 複製安裝模式（`gemini extensions install`）**：
     - 先將本地來源同步至 GitHub `main`，再執行 `gemini extensions update my-workflow`（或 `gemini extensions install ./my-plugins/my-workflow --consent`）。
3. **更新後再做一次「檢查更新（只讀）」驗證**：
   - 確認本機已安裝 SHA 已變成 GitHub `main` 最新 SHA（判定變為「**已是最新**」），並以 `GetAllPlugins`（過濾 `jq`）或 `gemini extensions list` 確認 plugin 正常載入。沒變就依「失敗或環境不適用」排除，不重複盲試。
4. **提醒載入時機**：
   - Antigravity 開**新對話**（首次新增目錄需**重啟 Antigravity**）、Gemini CLI 開**新 session** 才會載入新版。
5. **回報**：更新前後 SHA 與版本標籤、這次從 GitHub `main` 帶進來的 commit 摘要、驗證結果。

### 自動更新（不用每次手動跑的做法）

- **Antigravity ＋ Gemini CLI 共用本地追蹤目錄**：
  - Antigravity 用 `~/.gemini/config/plugins.json`、Gemini CLI 用 `gemini extensions link` 指到同一個專門追蹤 `main` 的本地 clone；只要該目錄拉取 GitHub `main`，兩邊就同時生效，免重裝。
  - **在 Antigravity 設定排程自動上 GitHub 檢查並更新**：Antigravity 本機 `plugins.json` 沒有雲端 GitHub webhook 開關，可用 Antigravity 內建排程（在對話中用 `/schedule` 或 `/automation` 建立排程任務）定時觸發本 skill：「上 GitHub 檢查 `VECTOR-COOL/my-agent-toolkit` 的 `main` 有無 `my-workflow` 更新，有就自動拉取更新並回報前後 SHA」。
- **Gemini CLI `--auto-update` 的限制**：
  - `gemini extensions install <url> --auto-update` 要求 GitHub repo 根目錄就是單一 extension；本 repo 根為多 plugin marketplace，因此 Gemini CLI 建議用 `gemini extensions link` 搭配上述排程自動拉取 `main`。

## Antigravity（AGY）：對話內安裝與更新

Antigravity 原生支援 `my-plugins/my-workflow/plugin.json`。先完成「檢查更新（只讀）」並說明將執行的動作；使用者已明確授權安裝或更新時即可執行。

### 首次安裝（二選一）

**方式 A：`plugins.json` 指向本地 clone 的 marketplace 目錄（推薦，更新免重裝）**

1. 確認本地已 clone `https://github.com/VECTOR-COOL/my-agent-toolkit` 且可讀取（純使用環境建議切到 `main` 分支）。
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

1. 從 GitHub `main` 將 `my-plugins/my-workflow/` 同步至 `~/.gemini/config/plugins/my-workflow/`，並把 GitHub `main` 的 commit SHA 寫入 `~/.gemini/config/plugins/my-workflow/.source-commit`。
2. 透過 Language Server Connect 端點（`http://${ANTIGRAVITY_LS_ADDRESS}/exa.language_server_pb.LanguageServerService/<Method>`，Header 帶 `x-codeium-csrf-token: ${ANTIGRAVITY_CSRF_TOKEN}`）管理生命周期。**所有變更一律以安裝資料夾名 `<dir>`（`my-workflow`）為 key，絕不直接手改 `~/.gemini/config/config.json`**：
   - 盤點確認：`lsrpc GetAllPlugins '{"workspaceUris":["file:///path/to/workspace"]}' | jq '[.plugins[] | {name, dir: (.path | split("/") | last), disabled: (.disabled // false), isGlobal, skills: [.skills[]?.name]}]'`
   - 啟用／停用：`lsrpc JetboxWriteState '{"userConfig":{"plugins":{"my-workflow":{"enabled":true}}}}'`（立即生效，免重啟）。
   - 移除：`lsrpc DeletePlugin '{"pluginId":"my-workflow"}'`（若原本是 `disabled`，刪除前先用 `JetboxWriteState` 設回 `"enabled": true`，避免殘留設定導致重裝後預設停用；內建 `/builtin/plugins/` 不可移除）。
   - 注意：`lsrpc InstallCustomization '{"id":"<marketplace-id>"}'` **僅限已上架公開 Agent Marketplace 目錄的項目**；`my-workflow` 為私有 repo 且不上架公開市集，請勿對 `my-workflow` 呼叫 `InstallCustomization`。

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

    連結模式下，本地 repo 從 GitHub `main` 拉取後變更會直接反映，不必重裝。
  - **複製安裝**：

    ```text
    gemini extensions install ./my-plugins/my-workflow
    ```

    CLI 安裝時會複製一份快照，之後來源變動不會自動反映。
- GitHub URL 直裝要求 repo 根目錄就是 extension；本 repo 根目錄是多 plugin 的 marketplace，所以不走根 URL 直裝。
- **更新**：走上方「檢查並更新」流程；`link` 模式只需讓本地來源 repo 同步 GitHub `main`，`install` 模式則在同步後執行 `gemini extensions update my-workflow`（或重新 `install`）。
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
| 要求「對話內安裝到支援 Web 的 market」，且目標是 **ChatGPT Web** | 說明目前對話在 Antigravity／Gemini 環境，沒有 OpenAI 的 `search_plugins`／`create_plugin`／`update_plugin` 帳號端工具。先在對話內完成 GitHub `main` 的唯讀檢查，再提供下方**跨對話交接提示**，引導使用者到同一帳號／工作區的 ChatGPT（或具備帳號端工具的對話）貼上接續執行，切勿改裝成本機 plugin 充數。 |
| 要求「對話內安裝到支援 Web 的 market」，且目標是 **claude.ai Web** | 說明目前對話無法代為操作 claude.ai 帳號外掛頁。先在對話內完成 GitHub `main` 的唯讀檢查，再依 [claude.md](claude.md)「對話內：安裝到帳號 marketplace」一步一步引導使用者打開 👉 [Customize > Plugins](https://claude.ai/customize/plugins) → **Add → Add marketplace** 輸入 `VECTOR-COOL/my-agent-toolkit` → 授權 [Claude GitHub App](https://github.com/apps/claude/installations/select_target) → 安裝 `my-workflow` 並開啟 **Sync automatically**。 |
| 在 Antigravity 呼叫 `InstallCustomization` 出現 `source not found` | `InstallCustomization` 僅能安裝已上架 Antigravity Agent Marketplace 公開目錄（catalog）的項目；`my-workflow` 是私有 repo 且不上架公開市集，請改走本檔「Antigravity（AGY）：對話內安裝與更新」的 `plugins.json` 或 `~/.gemini/config/plugins/my-workflow/` 方式。 |
| `plugins.json` 指向的本地 repo 正處於 `develop` 或有未提交修改，無法直接 `pull origin main` | 不強制切分支或覆蓋工作區；若是要測試本地開發版就照實回報「目前掛載開發工作區 `develop`」；若要安裝／更新正式版，改將 GitHub `main` 同步至獨立目錄 `~/.gemini/config/plugins/my-workflow/`，或先執行 `my-plugin-release` 將 `develop` 合併發布至 `main`。 |
| 檢查發現 GitHub `main` 落後於本地 `develop`（新版還沒發布到 `main`） | 說明正式安裝與各平台 marketplace 一律抓 `main` 分支；只改 `develop` 不會進入 `main`。引導先執行專案 skill `my-plugin-release`（或依 [`docs/RELEASE.md`](../../docs/RELEASE.md) 檢查版本、跑 `check-release.mjs`、合併 `develop` 到 `main` 並 push），完成後再更新。 |
| 私有 GitHub repo 無法讀取（`gh api` 或 `git fetch` 權限不足） | 保留實際錯誤訊息，引導在本機執行 `gh auth login` 或設定 SSH key 授權讀取 `VECTOR-COOL/my-agent-toolkit`；不要求使用者貼出 token。無法讀遠端 GitHub 時標示「無法確認最新遠端狀態」，不拿本地舊快照冒充最新。 |
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
來源查證結果：GitHub main commit <實際 SHA>（my-workflow 最後 commit <實際 SHA>，pack.yaml 版本 <實際版本>）；工作區 develop commit <實際 SHA>（版本 <實際版本>）
來源內容差異：<實際查得之差異摘要>
已完成／尚未完成：已完成 GitHub 來源 repo 唯讀檢查；因原環境無目標 Web marketplace 帳號端寫入工具，尚未執行帳號端安裝／更新
本次授權：<只檢查／已授權安裝或更新；照原要求填>
請先在目標環境查詢帳號端目前安裝與 release 狀態，比對上述來源資訊後接續完成，並在新 Web 對話實際驗證 skill。
```

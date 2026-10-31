# OpenAI 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。2026-10-31 核對官方文件與本回合工具契約；Codex 命令已核對本機新版 CLI help，帳號端建立、更新與 Web 執行仍須實測。

## GitHub 更新來源與觸發方式

| 項目 | 固定來源 |
|------|------|
| 私有 repo | [VECTOR-COOL/my-agent-toolkit](https://github.com/VECTOR-COOL/my-agent-toolkit) |
| 更新分支 | `main`；不用 `develop` 或本地未提交修改當正式更新 |
| Plugin 目錄 | [my-plugins/my-workflow](https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-plugins/my-workflow) |
| 來源標籤 | [pack.yaml](https://github.com/VECTOR-COOL/my-agent-toolkit/blob/main/my-plugins/my-workflow/pack.yaml) |
| Marketplace | [.agents/plugins/marketplace.json](https://github.com/VECTOR-COOL/my-agent-toolkit/blob/main/.agents/plugins/marketplace.json)，名稱 `my-agent-toolkit` |

- 使用者直接執行本 skill（未限定只檢查），或說「更新」「檢查並更新」：**當次主動上 GitHub 查 `main`，有適用更新就接著更新既有 plugin，不停在詢問要不要更新**。這不包含只是讀取、審查或修改本 skill 文件的任務。
- 使用者說「只檢查」「先不要更新」：只查 GitHub 並回報，不寫入。
- 既有 plugin 的 ID、帳號／工作區、分享範圍與 Web 目標保持不變。尚未安裝時回報並引導首次安裝；不能把一次更新操作擴大為建立副本、遷移管理方式或移除功能。
- skill 本身不會在對話結束後持續執行。無人操作的背景更新須有已設定的工作區 GitHub 同步或其他經授權的排程；不能把寫入這段指引說成已啟用背景自動更新。

## 檢查並更新（執行本 skill 的預設流程）

1. 確認目標與現有 plugin，依下節讀取實際 release／安裝內容；先探索可用的 GitHub 連線，私有 repo 優先用已授權 connector。能力不足且可用 shell 時，才用已登入的 GitHub CLI／Git 讀取；沒有權限就按失敗表引導，不用公開搜尋結果猜內容。
2. 每次向 GitHub 取得 `main` 的完整 commit SHA，記為本次目標。後續讀 `pack.yaml`、manifest、檔案清單、內容及下載來源時都固定到這個 SHA，避免查版本與打包時混入不同提交。可另查該 SHA 下 `my-plugins/my-workflow/` 的最後變更 commit，但時間戳與版本標籤都不能代替內容比對。
3. 完成「檢查更新（只讀）」的內容比較。沒有差異就結束；有適用更新就依來源接續：可編輯帳號項目呼叫 `update_plugin`；受 GitHub 管理的工作區項目走同步；只有明確選擇本機目標才走 Codex marketplace upgrade。只檢查模式在此回報，不執行更新。
4. 帳號上傳型以固定 SHA 的 plugin 子目錄準備更新，保留既有 Web 相容調整、App 綁定與使用者自訂內容。遇到衝突或新增本機依賴時先解決範圍問題，不直接用原始 repo 覆蓋；讀回當前 release 並按「更新同一個 plugin」提交與驗證。GitHub 端只讀，不改使用者的開發 checkout。
5. 更新後回讀實際 release／安裝內容，與目標來源比對；平台同步若已前進到另一 SHA，重新查該 SHA 的差異並如實回報，不能沿用舊 SHA 宣稱驗證通過。最後依 Web 驗證步驟確認實際任務；需要新對話或使用者操作時，標記已更新與仍待驗證的部分。
6. 在結果附上來源 repo、分支、完整 SHA、plugin ID、前後 release／版本與更新摘要，供下次追蹤。沒有持久保存的紀錄不能假定下次讀得到；沒有基準就重新比較實際內容。失敗沿用下方引導，保留原安裝，不盲目重試寫入。

## ChatGPT 現況（2026-10-31 使用者實測）

- **個人帳號只能用 ZIP 安裝**：到 ChatGPT **網頁版**用 ZIP 安裝或更新（`create_plugin`／`update_plugin`），會同步到 ChatGPT 桌面版。從 GitHub 匯入 marketplace 是工作區管理員功能，個人帳號沒有。
- **不會自動更新**：帳號端 plugin 不追蹤 GitHub，每次發版都要從 `main` 重新打包再上傳。
- **桌面版的「新增外掛市集」不會到網頁版**：在桌面版加 GitHub 市集只裝在本機（`my-workflow@my-agent-toolkit`），和帳號端那份（如 `my-workflow@openai-curated-remote`）是兩份，不同步。兩份不要同時啟用，同名 skill 會互相干擾。
- 要網頁版與桌面版一致：只留帳號端那份，用 ZIP 更新；本機市集那份停用或移除。
- **網頁版 ZIP 不能帶 hook**：含 `hooks/codex.json`（要在本機跑 `node`）的包會被標成「僅限桌面版」。網頁版包排除 `hooks/`、根 `scripts/`，並只刪 `plugin.json` 裡 `extensions.com.openai.hooks`。
- **網頁版要有入口設定**：`plugin.json` 的 `extensions.com.openai` 要保留 `onboardingSkill`（指到 `./skills/my-workflow/SKILL.md`）與 `interface`；全域規則由入口 skill 讀 `global.md`，入口 skill 的 description 不能寫「規則已由 hook 注入」。只拿掉 hook、沒有這兩項的 1.16.2 包，裝得上但不生效。
- **網頁版 ZIP 不能帶 `mcp.json`**（2026-11-01 實測）：只差 `mcp.json`（Composio 遠端 MCP）的兩個包，帶的不生效、不帶的可用。與[社群回報](https://community.openai.com/t/remote-mcp-plugin-is-desktop-only-while-direct-mcp-works-on-web-mobile-how-can-we-deploy-it-workspace-wide/1404606)一致：ZIP 內宣告的遠端 MCP 在網頁版不會連線。網頁版包排除 `mcp.json`；桌面版、Codex、Claude 照常帶 MCP。
- **網頁版要用 Composio**：在 ChatGPT 直接加 Composio 連線（`https://connect.composio.dev/mcp`），不經 plugin。個人帳號能否自加 MCP 連線依方案而定，**未驗證**；沒有就回報記憶、Notion 等需要 Composio 的 skill 在網頁版不能用外部服務。
- 網頁版包的檢查清單：沒有 `hooks/`、根 `scripts/`、`mcp.json`；`plugin.json` 有 `version`（高於帳號現有版本）、`onboardingSkill`、`interface`，沒有 `extensions.com.openai.hooks`。
- **版本號要比帳號裡的高**：ChatGPT 存檔時要求包內 `plugin.json` 的 `version` 大於目前版本（錯誤：`Bump the plugin manifest version before saving`）。包內版本用發版的 `pack.yaml` 版本；同一版要重傳就先發新版，不要只改包。

## 先選安裝目標

已確認目標是 OpenAI，且使用者要求「在對話內安裝／更新」「ChatGPT Web 也能用」時，優先走**帳號端的私人或工作區 marketplace**，即使目前對話是 Codex 也一樣。安裝整個 plugin，不逐一安裝子 skill，不以貼規則或本機 cache 代替。目標若是其他產品的 Web，改讀該產品的 reference，不套用本節。

| 目標 | 方法 | 驗證範圍 |
|------|------|------|
| 對話內操作，ChatGPT Web 可用 | 下節「帳號端安裝與更新」 | 帳號端儲存、安裝、Web 執行分別確認 |
| 工作區要從 GitHub 自動同步 | 管理員匯入 GitHub marketplace | 驗證同步的來源 commit 與帳號端 release |
| 使用者明確只要本機 Codex | 「Codex 本機 marketplace」 | 不代表 Web 已安裝或可用 |

私人可見性 `PRIVATE` 不等於個人範圍 `USER`；workspace 內也可建立私人 plugin。這個流程不需要上架公開目錄。

## 帳號端安裝與更新（對話內）

先探索當前可用的 Plugin Creator／Plugin Management 工具，載入其建立或更新 skill。這些是有相應 plugin 工具與權限時的操作流程，不保證每個 Codex／ChatGPT 客戶端或對話都有。以下工具名稱與可讀寫範圍以當前工具契約為準；沒有工具時依後文引導，不改走本機安裝冒充完成。

### 找到現有項目

1. 已有確切 backend `plugin_id` 就直接用；否則以 `search_plugins` 搜尋 `my-workflow`，核對來源與 scope，逐字保留回傳 ID。名稱、URL、`plugin://` reference 不能代替 backend ID。
2. 個人帳號且沒有 active workspace 時，可用 `list_owned_personal_plugins` 補查並完成分頁；它不是工作區清單。多個候選無法辨識才問使用者。
3. 用 `get_plugin_metadata` 查 scope、版本與 release；需檔案時改用 `get_plugin_files`，先列清單、完成分頁，再用實際路徑讀檔。保留 `current_release_id`。
4. 先辨識來源：帳號端可編輯項目走下列工具；GitHub 同步或其他受管理項目走原來源的更新流程。不要為更新建立同名副本。

### 檢查更新（只讀）

這是預設「檢查並更新」的只讀階段。安裝或更新前先做；使用者只要求檢查時，到回報結果為止，不呼叫 `create_plugin`、`update_plugin` 或本機 marketplace upgrade。

1. 依前節找到目標。用 `get_plugin_metadata`／`get_plugin_files` 讀取有權限存取的帳號端 metadata／檔案，只採用實際回傳的版本、scope 與 `current_release_id`；缺少欄位就標未取得。這些工具不保證回傳 Git 來源 commit、同步方式或安裝狀態：來源對應需從已查證的發布紀錄、同步設定或檔案內容補查；安裝狀態需由目標環境的工具或 Plugins 介面另行確認。帳號端 release 不代表目前對話已載入該版本。
2. 依「GitHub 更新來源與觸發方式」主動讀取遠端 `main` 並固定 SHA，取得該 SHA 的 `pack.yaml` 與 `my-plugins/my-workflow/` 內容；本次已取到就沿用，不重複查。遠端讀取失敗時，本地 `origin/main` 只能算舊快照，不能宣稱是最新。
3. 已有來源 commit 紀錄時，比對兩個 commit 間本 plugin 的檔案；沒有對應紀錄時，讀取目前 release 的必要檔案，與 `main` 對應內容比較。排除已知的封裝版本、平台相容轉換差異，另外標出帳號端自訂修改；不能把自訂內容直接當成應被覆蓋的舊版。
4. GitHub 同步項目另外比對來源 commit 與平台實際同步結果；只看到 repo 已更新不能判定帳號已同步。`list_plugin_releases` 可補查歷史，但回傳項目可能尚未發布，不能把清單第一筆當作目前已生效版本。
5. 證據完整且有效內容一致才報「已是最新」；確認來源有尚未套用的更新才報「有更新」，並列出影響與應走的流程。只有差異但無法辨識更新方向時，報「內容不同，更新狀態無法確認」。只有目標帳號／工作區的工具或介面明確證明未安裝，才報「尚未安裝」。`search_plugins` 並非完整安裝清單，搜尋不到、列表範圍不符、權限不足、來源無法讀取或證據不足，均報「無法確認」並引導補足。

回報包含：檢查時間、目標 Web／本機與 scope、plugin ID、帳號端 release／版本、來源 commit／標籤、內容差異、安裝與 Web 驗證狀態、下一步。沒有取得的欄位寫「未取得」，不填猜測值。只有使用者已授權更新時才接著更新；已有授權不重複詢問。

### 首次建立與安裝

1. 依來源 repo `main` 的指定 commit 準備單一 `my-workflow` 套件；使用者指定工作區內容時才改用該來源，並說明未發布修改。不要把整個 toolkit／marketplace 打成 plugin。
2. 檢查 Web 相容性：核心規則由入口 skill 讀取，不能依賴本機 SessionStart、shell、stdio MCP 或本機路徑。遠端 MCP 可保留，但要確認端點、驗證方式與目標 Web 支援。檢查 local-executor 要求與 Desktop only 標示，不能只改旗標就宣稱相容。
3. 有本機依賴時列出需要調整的功能；必要時製作獨立的 Web 上傳產物，保留來源 SSOT。不得默默刪除 MCP、skills 或功能；若只能提供部分功能，先確認這個範圍符合使用者要求。
4. 按 Plugin Creator 的套件規格產生 ZIP／tar.gz，含 `plugin.json`、skills 與必要資源，檢查 JSON、frontmatter、相對連結及封裝內容。帳號上傳產物採其要求的版本格式；不要把版本需求寫回 repo 刻意不含 version 的 marketplace manifest。
5. 呼叫 `create_plugin` 儲存：

   ```yaml
   create_plugin: {archive: <絕對本機路徑>}
   ```

   工具會使用目前 active workspace，沒有才用個人帳號；讀回 scope，保留 `plugin_id`、release ID、版本與 `plugin_url`。結果不明時先查現況，不能重複建立。
6. 回傳可點擊的 `plugin_url`。先查是否已安裝；尚未安裝且工具支援時，用 `search_plugins` 回傳的確切 ID 呼叫 `suggest_plugins` 顯示安裝入口，或引導使用者從 plugin 詳情安裝。需要使用者按鈕／OAuth 時清楚標記待完成，不能把儲存成功當成已安裝。

### 更新同一個 plugin

1. 先完成「檢查更新」；沒有需更新內容就回報，不為檢查而升版。以現有 `plugin_id` 讀取當前檔案與 `current_release_id`。文字檔優先用 `get_plugin_files`；二進位或大小限制才用 `get_owned_plugin_archive`。
2. 比對來源新版與現有套件，保留 plugin 身分、scope、受眾、App 綁定、整合、提示與資產；只修改授權範圍。準備更新 manifest 與變更檔，依既有版本規則升版。
3. 呼叫 `update_plugin`：

   ```yaml
   update_plugin:
     plugin_id: <backend plugin_id>
     archive: <絕對本機路徑>
     expected_release_id: <讀到的 current_release_id>
     delete_paths: [<確切路徑>]   # 選填；只放從清單取得、在授權範圍內的路徑
   ```

   這是覆蓋合併：沒上傳的檔案仍保留，要刪的檔只能靠 `delete_paths`。
4. release 衝突時重新讀取並整合，不拿舊 ZIP 換個 expected ID 強送。權限拒絕、打包失敗、上傳失敗分開回報。
5. 成功後讀回版本、release 與變更內容，回傳原 plugin 的連結。更新同一項目，不重建，也不自行擴大分享範圍。

帳號端手動上傳不等於追蹤 GitHub；每次執行本 skill 會重新讀取遠端 `main`，有適用更新就執行上述流程。GitHub 同步型項目則讀取原來源並要求平台同步、驗證結果，不用 archive editor 覆蓋，也不在安裝 skill 中修改來源 repo。

### Web 驗證與回報

- 在同一帳號／工作區的 ChatGPT Web 確認項目可見、可安裝，沒有阻擋使用的 Desktop only 限制。
- 開新 Web 對話，選取 plugin，執行一項實際 skill 任務並完成回應；確認入口讀到規則。有 MCP 功能則另外驗證連線及授權。
- 分別回報「已儲存 release」「已安裝」「Web skill 已實測」「MCP 已實測」及未完成項目。只有本機或靜態檢查時，Web 必須標未驗證。
- 不要求一般 Chat 執行本機 hook；不能用模型口頭回答「已載入」取代實際任務驗證。

## 工作區 GitHub marketplace 同步

這是平台背景同步，與每次執行 skill 時查 GitHub 分開。設定前先核對 Web 相容性：官方說明 GitHub 匯入的 MCP plugin 可能標成 **Desktop only**，即使是遠端 HTTPS MCP 也一樣。本 repo 的 `my-workflow` 含 Composio MCP，不能直接承諾匯入後可在 Web 使用；需先準備、確認相容方案，不能默默刪掉整合。

適用且已授權設定時，由工作區管理員在 **Admin > Plugins > Add > Import marketplace** 使用：Source 為上述 repo URL、Path 留空（marketplace 在 repo 根）、Branch 填 `main`。匯入會處理 marketplace 的全部有效項目，須確認範圍。新 marketplace 預設每日同步；手動立即更新在 **Admin > Plugins > Marketplaces > 選取來源 > Sync now**。

每次讀同步報告與個別 plugin 結果，再驗證 release／內容及 Web 行為；整體完成不代表每個 plugin 成功。沒有管理工具或權限時，提供上述入口請管理員接續，不能宣稱已設定。已存在的帳號上傳 plugin 不自動改成 GitHub 管理；需要遷移時另確認並依官方流程保留 ID。未設定背景同步的個人／帳號上傳項目，使用前述「執行 skill 時檢查並更新」。

依據：[Import and sync plugins from GitHub](https://learn.chatgpt.com/docs/enterprise/plugin-management)。

## Codex 本機 marketplace

只在使用者選擇本機目標時使用。先確認實際 executable 的版本與 `plugin --help`；PATH 舊版與 App 隨附版可能不同。支援以下命令的版本可用：

```text
codex plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit.git --ref main
codex plugin add my-workflow@my-agent-toolkit
codex plugin marketplace list
```

來源 repo 根的 `.agents/plugins/marketplace.json` 指到 `./my-plugins/my-workflow`。若該版沒有 `plugin add`，使用支援的 Plugins 介面安裝。`config.toml` 的 `enabled` 是啟用設定，不能取代加入來源與安裝。

更新使用 `codex plugin marketplace upgrade my-agent-toolkit`，再檢查實際安裝內容／版本，必要時依該版 Plugins 介面完成更新。hooks 依主機信任流程處理，MCP 依提示授權；新對話驗證。這些結果不代表帳號端或 Web 已同步。

## 失敗或環境不適用：引導下一步

先按 [SKILL.md](../SKILL.md) 回報實際錯誤與已完成進度，再給對應操作。以下入口以當前工具與官方介面為準。

| 情境 | 如何引導與接續 |
|------|------|
| 對話沒有 Plugin Creator／Management 工具 | 先探索可用工具與 plugin；能提供安裝入口就提供。否則引導到同帳號／工作區的 ChatGPT Plugins，選目標 plugin 的 Edit Plugin 開啟編輯對話；首次建立走官方 Build plugins 流程。帶上交接提示，不改成本機安裝。 |
| 登入錯帳號／workspace，或只能建立到非目標 scope | 請使用者切到目標帳號／工作區再開對話；帶上已查證 plugin 連結與 ID。未確認前不建立替代項目。 |
| 搜尋不到、沒有編輯權限或 ID 格式錯誤 | 先核對 backend ID 與 scope；個人列表沒有結果不代表工作區沒有。權限不足引導擁有者／工作區管理員／plugin editor 操作；格式錯誤不能說成權限拒絕。 |
| 私有 GitHub repo 無法讀取 | 保留錯誤，引導授權正確 repo 或由有權限者提供來源封裝與 commit。無法讀來源就報無法確認更新，不猜最新版。 |
| GitHub 同步或受管理 plugin 不能 archive 更新 | 引導到原來源 repo 與工作區管理端的 GitHub 同步設定，核對分支、repo 授權、同步狀態；同步後重查 release，不建立同名副本。 |
| 打包驗證、上傳失敗或網路暫時異常 | 有明確未寫入的失敗就修正內容／連線再重試；有可能已寫入時先查 ID、release 與內容。保留封裝及差異，回報仍待上傳或待查證。 |
| `expected_release_id` 衝突 | 重讀最新 release，整合差異、重新打包再更新，不覆蓋他人的新修改。 |
| 已儲存但尚未安裝／OAuth 未完成 | 提供回傳的 plugin 連結或安裝卡，引導完成安裝／服務授權，再開新對話測試。標示「已儲存，待安裝／授權」。 |
| Web 顯示 Desktop only 或仍依賴本機能力 | 列出具體依賴與可調整範圍，準備相容方案；若會失去功能先取得該範圍同意。保留 Web 目標，不能要求改用 Desktop 就算完成。 |
| CLI `unknown command` | 查實際 executable、版本及 help；引導使用已確認支援的 CLI／Plugins 介面。若目標是 Web，接回帳號端流程；不因 CLI 失敗改寫設定冒充安裝。 |
| release 已更新，但舊對話仍用舊 skill | 回讀更新內容後，引導在同帳號／工作區開新 Web 對話並選取 plugin。執行實際任務；未完成回應前標「已更新，Web 待驗證」，不再次上傳。 |

需要換環境時，提供可直接貼上的交接提示；只填實際取得的值：

```text
請檢查並接續 my-workflow 的安裝／更新，目標是 ChatGPT Web 可用的帳號端 marketplace。
目標帳號／工作區：<已確認資訊；未知就標未知>
Plugin：<連結、backend ID、scope；未取得就標未取得>
目前 release／版本：<實際值>
來源：https://github.com/VECTOR-COOL/my-agent-toolkit，main，my-plugins/my-workflow
來源 commit 與差異：<實際值或尚未取得>
已完成／尚未完成：<進度與實際錯誤，不含憑證>
本次授權：<只檢查／已授權安裝或更新；照原要求填>
請先重新確認狀態，沿用既有 plugin ID；安裝與更新後在新 Web 對話驗證。
```

## 依據

- [Plugins：目錄、安裝與平台支援](https://learn.chatgpt.com/docs/plugins)
- [Build plugins：對話內建立與更新](https://learn.chatgpt.com/docs/build-plugins)
- [Package your plugin：marketplace 與本機來源](https://developers.openai.com/plugins/build/plugins)
- Plugin Creator 的 `create-plugin`、`update-plugin` skills 與本回合工具契約；操作前重新確認可用欄位。

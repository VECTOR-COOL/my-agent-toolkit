# NOTE — 交接紀錄

給下一位接手的人或 agent。**先讀這份再動手；做完一段工作或交接時更新。** 保持精簡，過時的刪掉，不記密碼、token、金鑰。

最後更新：`2026-11-12` · 版本：`v1.17.1` · 分支：`develop` · 範圍：plugin `my-workflow`（repo 根沒有自己的 NOTE）

## 目前狀態

- plugin `my-workflow` 最新是 `1.17.1`，已合併到 `main`。
- **ChatGPT（個人帳號）**：網頁版與桌面版的本機市集不同步；帳號端不自動更新，只能在網頁版用 ZIP 安裝（同步到桌面版），每次發版要重傳。使用者帳號目前是測試包 `1.16.7`，`1.17.1` 網頁包待上傳。
- `1.16.0`：init 採用「B + 生態慣例優先」——根目錄只留入口與生態規定的檔，新專案交接紀錄在 `docs/NOTE.md`、打包設定在 `scripts/release.config.json`（腳本先讀同目錄，其次根目錄）；`my-docs` 新增「docs/ 結構」。
- 結構穩定：`my-plugins/`（plugin）、`my-skills/`（獨立 skill，含 `claude/` 分類）、`skills/`（第三方）。
- 發布流程與更新排除已文件化：`my-plugins/my-workflow/docs/RELEASE.md`，並有 `check-release.mjs` 檢查。

## 進行中

- [ ] [docs 檔案架構定義](plans/2026-10-31-docs-structure.md)：已寫進 `my-docs`，**待使用者確認**。
- [ ] 使用者在 ChatGPT 網頁版用 `1.17.0` 網頁包更新帳號那份 plugin，並停用桌面版本機市集那份；Composio 在 ChatGPT 直接加連線（未驗證）。

## 下一步

1. 發布 skill 補上：合併 `main` 後自動產出 OpenAI ZIP，並在包內 `plugin.json` 寫入版本號。
2. 使用者帳號的 plugin 同步目前停在舊版（`1.12.2`）；需使用者在 claude.ai 外掛頁移除後重新加入，並開 Sync automatically。
3. 使用者本機 Claude Code CLI 太舊（`claude plugin` 沒有 `marketplace`、`update`）；需 `claude update` 或重裝。

## 已決定

- **每個 plugin 是自己的專案**：repo 根的 `AGENTS.md`、`CLAUDE.md` 只做目錄導覽，不放 `NOTE.md`、`docs/`、`scripts/`；plugin 的入口、交接紀錄、計畫都在 `my-plugins/my-workflow/` 內（2026-10-31）。
- skill 一律平鋪；Claude 專屬的 skill 放 `my-skills/claude/`，不隨 plugin 安裝。
- `my-skills/` 內每個 skill 獨立，不互相連結；`skills/` 只放第三方、不改內容。
- plugin 不做 Cursor 相容層；Claude 是第一個支援的客戶端（記憶 `user_id=claude`）。
- `.agents/skills/` 是跨編輯器的專案 skill 位置；此 repo 目前沒有專屬 skill，所以沒建。
- 版本以 `my-plugins/my-workflow/pack.yaml` 為基準，6 處同號（manifest 不寫 version）。

## 避雷：ChatGPT plugin（2026-11-01 實測）

遇到 ChatGPT 網頁版 plugin「裝得上但不生效」「僅限桌面版」「拒存」，先看這裡，再看 `skills/my-plugin-install/references/openai.md`「ChatGPT 現況」。

- **ZIP 帶 `mcp.json` → 網頁版不生效**：1.16.3 與 1.16.5 只差 `mcp.json`，帶的不生效、不帶的可用。ZIP 內宣告的遠端 MCP 網頁版不連線（[社群回報](https://community.openai.com/t/remote-mcp-plugin-is-desktop-only-while-direct-mcp-works-on-web-mobile-how-can-we-deploy-it-workspace-wide/1404606)同症狀）。網頁包不帶 `mcp.json`；Composio 在 ChatGPT 直接連線。
- **hook 在 ChatGPT 沒作用也不擋**：1.16.7（帶 hook、無 MCP）網頁可用，但網頁與桌面對話都不執行；只有 Claude Code（Codex 信任後理論上會，未驗證）。網頁包不帶 hook。常駐規則改靠 ChatGPT 自訂指令＋入口 skill 讀 `global.md`。
- **入口 skill 的 description 不能寫「規則已由 hook 注入」**：沒 hook 的平台會因此不讀規則。
- **`plugin.json` 保留 `extensions.com.openai.onboardingSkill` 與 `interface`**：1.7.3 起就有，正式欄位。
- **版本號**：包內 `version` 必須高於帳號現有版本，否則 `Bump the plugin manifest version before saving`；同一版不能重傳，除錯包也會用掉版號（1.16.4、1.16.5、1.16.7 已用掉）。
- **個人帳號**：只能在網頁版上傳 ZIP，同步到桌面版；不自動更新；桌面版「新增外掛市集」只裝本機、與帳號那份不同步。
- **除錯方法**：以已知可用的包為基準（stash `02046c3` 的 1.7.3），一次只改一個變數再上傳；測 hook 有沒有執行，要模型逐字貼出注入內容裡「plugin 根目錄：」後的路徑，不要問「有沒有看到」。

## 待確認／阻礙

- docs/ 檔案架構定義（`specs/`、`guides/`、`adr/`、`plans/`、`diagrams/`、`archived/`）是否確認。
- `user_id=claude` 是沿用 `gpt`、`cursor` 的命名自訂的，需使用者確認；舊的 `user_id=cursor` 記憶不會自動轉移。
- 帳號端為何沒自動同步新版：Sync automatically 是否開啟、私有 repo 授權是否有效。
- `my-release-packaging` 沒在使用者的 PHP 專案實跑過；使用者 Windows 的 Git 版本是否支援 `--add-virtual-file` 未確認。
- Windows／Codex／Desktop 聊天 的實機行為多為「未驗證」。

## 怎麼驗證

```bash
node my-plugins/my-workflow/scripts/check-release.mjs --remote
node --test my-plugins/my-workflow/skills/my-release-packaging/scripts/pack-release.test.mjs
```

## 更新紀錄

- `2026-11-12` Claude：`1.17.1` 使用者說「/subtask」就是要派 subagent，`my-subagent` 觸發詞與索引關鍵字補上；`/subtask` 是否為 Claude Code 內建指令未確認，底層仍用 `Agent` 工具。
- `2026-11-11` Claude：`1.17.0` 新增 `my-plan-review`（矛盾、安全、慣例，直接更正，有疑問先問）與 `my-testing`；`my-subagent` 由主線指定模型與思考程度、驗收後關閉；入口加「執行計畫盡量用 my-subagent」；`my-codebase-init` 測試集中 `tests/`。
- `2026-11-01` Claude：測試包 1.16.7（1.16.6 加回 hook、不帶 `mcp.json`）網頁版可用；ChatGPT 網頁與桌面都不執行 hook，只有 Claude Code 會。更正 `openai.md` 與發布 skill：hook 不擋網頁版但沒作用，擋網頁版的只有 `mcp.json`。使用者帳號目前是 1.16.7，下次上傳至少 1.16.8。
- `2026-11-01` Claude：`1.16.6` 確定 ChatGPT 網頁版不生效的主因是 ZIP 內的 `mcp.json`。除錯分支 `debug/chatgpt-web-1.7.3`（本機，未推）實測：1.16.4（1.7.3 內容）可用、1.16.5（1.16.3 只拿掉 `mcp.json`）可用。網頁包改為排除 `mcp.json`，寫進 `openai.md` 與發布 skill；1.16.4、1.16.5 版號已用於除錯包。
- `2026-11-01` Claude：`1.16.3` 修 ChatGPT 網頁版不生效。比對 stash 裡可用的 1.7.3：網頁版要有 `plugin.json` 的 `onboardingSkill`、`interface`，不能帶 hook，入口 skill 的 description 不能說「規則已由 hook 注入」。repo 的 `plugin.json` 補回這兩項；發布 skill 加「ChatGPT 網頁包」。帶 Composio MCP 的網頁版待使用者實測。
- `2026-10-31` Claude：記錄 ChatGPT 現況（使用者實測）——個人帳號只能在網頁版用 ZIP 安裝並同步到桌面版、不自動更新、桌面版本機市集與網頁版不同步；同步到 `openai.md`、根 `AGENTS.md`／`README.md` 與 plugin `README.md`。
- `2026-10-31` Codex：補齊 OpenAI 安裝 reference 的 GitHub repo／main 連結、固定來源 SHA、直接叫用 skill 時檢查並更新既有 plugin；區分只讀檢查、帳號上傳更新與工作區每日同步，補充 MCP 匯入的 Desktop only 限制。僅改文件，未啟用背景同步或更新帳號 plugin。
- `2026-10-31` Antigravity：補齊 `my-plugin-install/references/gemini.md` 與 `SKILL.md` 的 Google Antigravity（AGY：`plugins.json`、`~/.gemini/config/plugins/` 與 Language Server RPC）及 Gemini CLI（`link`／`install`／`validate` 實測通過）安裝、直接上 GitHub 檢查 `main` 差異、執行 skill 一鍵檢查並更新、`/schedule` 排程自動更新流程；明確區分 Web marketplace 限制、失敗與環境不適用引導表及跨對話交接提示。
- `2026-10-31` Codex：更正安裝指引的目標平台分流與工具能力條件；已授權安裝／更新不重複確認。來源 commit 與安裝狀態須另取證據，搜尋不到不再判成未安裝，repo 任意新 commit 不再判成本 plugin 更新。僅修改文件。
- `2026-10-31` Codex：安裝 skill 加入唯讀檢查更新、來源內容與帳號 release 比對、四種結果狀態；補上失敗／環境不適用的具體引導表與跨對話交接提示。未執行帳號端安裝或更新。
- `2026-10-31` Codex：補齊 `my-plugin-install/references/openai.md` 的對話內帳號端建立、安裝與同 ID 更新流程，Web 目標優先；區分本機 marketplace、GitHub 工作區同步及 Web 實測。同步入口路由與 Gemini 範圍說明；僅更新文件，未建立／更新帳號 plugin，未發布。
- `2026-10-31` Claude：plugin 文件瘦身（`AGENTS.md`、`README.md`、`RELEASE.md`、`global.md`、入口與各 skill）；規則與觸發條件不變，`my-codebase-init` 的「既有檔案轉換」拆到 `references/convert.md`。
- `2026-10-31` Claude：撤回根目錄 init 產物——`AGENTS.md`、`CLAUDE.md` 改寫成純目錄導覽，`NOTE.md` 與 `docs/plans/` 搬進 plugin 的 `docs/`；清掉未追蹤雜物（`.cursor/`、`.playwright-mcp/`、`dist/`、舊版 zip、`.codex-plugin/`、`my-skills/my-workflow/`）。
- `2026-10-31` Claude：`1.16.0` 落地 init codebase 結構（B + 生態慣例優先）與 docs/ 結構定義；實測新專案、舊格式搬家、打包排除三項通過。
- `2026-10-31` Claude：記錄 init codebase 結構討論到 `docs/plans/`。
- `2026-10-30` Claude：補齊根目錄 `AGENTS.md`、`CLAUDE.md`、`NOTE.md`；README 版本移到標題正下方。

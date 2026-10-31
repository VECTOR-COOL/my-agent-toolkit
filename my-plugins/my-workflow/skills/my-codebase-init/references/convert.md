# 既有檔案：轉換成最新格式

專案已有入口文件或發佈配置時讀（舊專案、別的 skill 或工具建的）。原則：**不遺失資訊**——舊內容每一條都要在新檔找得到，只是重組；不確定歸類的放「待確認」，不丟棄。

## 流程

1. **盤點**：逐檔對照下表「舊格式特徵」，分出已是最新（不動）、要轉換、缺的。
2. **提出轉換計畫**：表格列每個檔的現況、要改什麼、舊內容放哪、無法歸類項、會刪的重複內容。**使用者同意前不寫檔。**
3. **新分支轉換**（如 `chore/init-format`），一個 commit：`chore(docs): 入口文件轉換成最新格式`。沒有 Git 就先 `git init` 並提交現況當還原點。
4. **驗證**：逐條核對舊內容都在；`git diff` 只應有結構調整與新增；指令實際跑過；發佈配置跑 `--dry-run`；有遺失就補回。
5. 回報：轉換哪些檔、主要變更、待確認項。

## 各檔轉換規則

| 檔案 | 舊格式特徵 | 轉換成 |
|------|-----------|--------|
| `AGENTS.md` | 沒有「接手三步」；指令、目錄、規範、禁止事項散落；超過 200 行；含平台專屬內容 | 範本結構（接手三步、專案、指令、目錄架構、規範、禁止事項、發佈、各 agent 平台備註）。舊條目逐條歸位；平台專屬移到最後一節或對應入口；過長拆到 `docs/` 並留連結 |
| `README.md` | 版本只在徽章或內文、不在標題正下方；沒有版本 | **標題正下方一行** ``**版本：`vX.Y.Z`**``，取自專案版本來源（徽章是靜態文字就以版本來源為準）；其餘保留；缺的「技術棧」「快速啟動」「文件」依實際補 |
| `docs/NOTE.md` | 沒有；在根目錄 `NOTE.md`；或叫 `TODO.md`、`HANDOFF.md`、`MEMORY.md`、`STATUS.md` | `git mv` 到 `docs/NOTE.md`，轉成 NOTE 結構（目前狀態、進行中、下一步、已決定、偏好、待確認、怎麼驗證、更新紀錄；偏好歸「偏好」，決策歸「已決定」）。舊檔只剩重複內容就刪（git 留底），並更新所有引用 |
| `CLAUDE.md` | 與 `AGENTS.md` 重複；或沒有 `@AGENTS.md` | 第一行 `@AGENTS.md`；重複段落移除（先確認 `AGENTS.md` 已有）；只留 Claude 專屬 |
| `.cursorrules`、`.cursor/rules/*.mdc`、`.github/copilot-instructions.md`、`GEMINI.md`、`.windsurfrules` | 各平台各寫一份 | **不刪、不改壞**。通用內容收斂進 `AGENTS.md`；原檔保留，必要時開頭註明「以 AGENTS.md 為準」。轉 Claude 最佳實踐用 `my-claude-codebase-convert` |
| `.agents/skills/`、`.claude/skills/`、`.cursor/skills/` | 專案 skill 多處各一份 | 以 `.agents/skills/` 為唯一來源，其他指向它（symlink，或複製並在 `docs/NOTE.md` 記同步方式） |
| 根目錄其他檔 | 散著規格、計畫、設計文件、腳本、打包設定（`SPEC.md`、`RELEASE_SPEC.md`、`build.mjs`、`release.config.json`） | 文件 `git mv` 進 `docs/`，腳本與設定進 `scripts/`，再全專案 `grep` 舊路徑更新引用（含 CI、`package.json` scripts）。**生態規定的檔與原有程式目錄不搬**；搬了會壞或不確定的列給使用者決定 |
| `.gitignore` | 缺 `.env*`、`dist/`、`scripts/tmp/`、`log/*`、`.claude/settings.local.json`、`CLAUDE.local.md`、`*.log` | 只**補缺的條目**，不改既有行 |
| `.gitattributes` | 打包專案缺 `/docs`、`/scripts` 或 AI 治理檔的 `export-ignore` | 只補缺的行；不確定是否打包部署就問 |
| `scripts/pack-release.mjs`、`scripts/release.config.json`、`docs/RELEASE_SPEC.md` | 設定在根目錄；或**舊版打包腳本**：無 `release.config.json` 支援、專案名／版本檔／禁則／lint 路徑寫死、用 `tar -tf` 讀 zip、無 `--since`、無內容掃描 | 見下「發佈配置轉換」 |

## 發佈配置轉換

主流程步驟 7 發現舊版打包腳本時：

1. 讀舊腳本，把寫死的內容**搬到 `scripts/release.config.json`**（根目錄已有就 `git mv`）：`name`、`version`（來源檔與 regex）、`lint`、`forbiddenExtra`（帳密檔、上傳與日誌目錄 pattern）、`outDir`；上傳、日誌目錄的 base path 同時列入 `placeholders`。
2. 用 `my-release-packaging` 附的最新腳本**取代** `scripts/pack-release.mjs`（舊版留在 git 歷史，不另存備份）。舊腳本裡**無法歸入設定的客製邏輯**逐項列給使用者決定，不默默丟掉。
3. `.gitattributes` 確認有 `/scripts export-ignore`；`docs/RELEASE_SPEC.md` 依最新範本補「占位目錄」「增量更新檔」「部署 SOP（解壓覆蓋）」，保留專案自己的白名單與排除清單。
4. **驗證新舊一致**：新舊腳本各打一次（或各 `--dry-run`），比對包內檔案清單；差異必須能解釋（如新腳本多了內容掃描、占位目錄），解釋不了就是漏了東西。

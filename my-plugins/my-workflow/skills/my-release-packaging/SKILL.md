---
name: my-release-packaging
description: 建立正式發佈包（更新檔）的打包規則與流程：以 Git 原生 export-ignore（.gitattributes）搭配零依賴 Node.js 腳本，產出排除機敏設定、執行期暫存與 AI／開發治理檔的乾淨 ZIP，並建立打包規格書（docs/RELEASE_SPEC.md）與 AGENTS.md 規範。用於打包、發佈包、更新檔、部署包、正式環境 ZIP、篩選發佈檔案、審核發佈包有沒有洩漏機敏檔時。
---

# my-release-packaging — 正式發佈打包

把專案打成交給正式機、客戶或維運解壓部署的乾淨 `.zip`，**不洩漏機敏檔、不夾帶開發與 AI 治理檔**，並把規則寫進專案的 SSOT 文件。

```mermaid
graph TD
  A[盤點專案與版本來源] --> B[建立 .gitattributes export-ignore]
  B --> C[scripts/ 放打包腳本與 release.config.json]
  C --> D[dry-run 預覽]
  D --> E[正式打包]
  E --> F{審核有洩漏?}
  F -->|有| G[腳本刪除 zip 並失敗，回頭修規則]
  G --> B
  F -->|沒有| H[建立規格書並對齊 AGENTS.md]
```

## 適用與邊界

- **適用**：要產出交給正式機解壓部署的 `.zip`；要建立 `.gitattributes` 與一鍵打包腳本；要寫或對齊發佈打包規格書。
- **不適用**：Docker 映像（用 `.dockerignore` 與 `Dockerfile`）；遠端 CI/CD 自動部署（若專案規則禁止遠端環境，就只在本機產出）。
- **安全邊界**：**禁止**對工作目錄做全目錄壓縮（`zip -r .`、`Compress-Archive *` 等），會把沒進版控的帳密與上傳檔一起打包。一律走 `git archive`。

## 檔案三層分類

所有檔案先歸類，各層用對應機制控制：

| 分層 | 內容範例 | 進 Git | 進發佈包 | 控制機制 |
| --- | --- | :---: | :---: | --- |
| ① 本機私密／執行期暫存 | `.env*`、帳密檔、`log/*.log`、使用者上傳檔、快取、`dist/` | 否 | 否 | `.gitignore` + 腳本禁則審核 |
| ② 開發／測試／AI 治理檔 | `.agents/`、`.claude/`、`.cursor/`、`AGENTS.md`、`CLAUDE.md`、`README.md`、`docs/`（含 `NOTE.md`）、`scripts/`、`tests/` | 是 | 否 | `.gitattributes`（`export-ignore`） |
| ③ 正式執行程式碼 | 應用程式入口、核心、前端靜態資源、必要 `vendor/`、`*.example` 設定範本 | 是 | **是** | `git archive` 自動保留 |
| ④ 上傳／日誌目錄 | `img/`、`log/`、上傳與暫存目錄：**目錄要存在** | 上傳檔否（`.gitignore`） | 已有內容照常；沒有內容就補空目錄 | `placeholders` 只寫 base path |

## 流程

### 1. 盤點

1. `git ls-tree --name-only HEAD`、`git status -s` 看追蹤檔案與頂層結構。
2. 讀 `.gitignore`，確認第 ① 層已完整忽略，且輸出目錄（預設 `dist/`）已列入。
3. 找出**版本來源**（`package.json`、`composer.json`、`VERSION`、或程式內的版本常數）與**檢查指令**（lint、語法檢查）。

### 2. `.gitattributes`（export-ignore）

把第 ② 層路徑標成 `export-ignore`，依專案增減：

```gitattributes
/.agents        export-ignore
/.claude        export-ignore
/.cursor        export-ignore
/dist           export-ignore
/docs           export-ignore
/scripts        export-ignore
/tests          export-ignore
/AGENTS.md      export-ignore
/CLAUDE.md      export-ignore
/README.md      export-ignore
/.gitignore     export-ignore
/.gitattributes export-ignore
```

設定檔在 `scripts/` 內，已被 `/scripts` 涵蓋。舊專案的 `NOTE.md` 或 `release.config.json` 還在根目錄時，另補 `/NOTE.md export-ignore`、`/release.config.json export-ignore`（腳本的內建禁則也會擋根目錄 `NOTE.md`）。

### 3. 打包腳本與設定檔

- 把 [`scripts/pack-release.mjs`](scripts/pack-release.mjs) 複製到專案 `scripts/pack-release.mjs`（只用 Node 內建模組、`git`、`tar`）。
- 專案差異全放 `scripts/release.config.json`（和腳本放一起，根目錄保持整潔），範例見 [`references/release.config.example.json`](references/release.config.example.json)；沒有設定檔也能跑（版本取自 `package.json` 或 `VERSION`）。腳本先找**自己同目錄**的設定檔，其次 repo 根目錄（舊專案相容），`--config` 可指定其他路徑。

| 設定 | 用途 |
| --- | --- |
| `name` | 檔名前綴 |
| `version.file` + `version.regex` | 從任意檔案取版本；regex 要有一個擷取群組 |
| `lint` | 前置檢查指令陣列，如 `["node","scripts/lint.mjs"]`，失敗即中止 |
| `forbiddenExtra` | 專案特有的禁則（正規表示式字串），疊加在內建禁則上 |
| `forbiddenRemove` | 放行的內建禁則（子字串比對），如 `["AGENTS"]` |
| `contentScan` | `{ "enabled": false, "allow": ["正規表示式"] }` |
| `requireClean`、`strict` | 設為 `true` 等同每次加對應旗標 |
| `placeholders` | 內容不發佈、但目錄要存在的路徑，如 `["img", "log", "content/user_files"]`，見下方「占位目錄」 |
| `outDir` | 輸出目錄，預設 `dist` |

腳本流程：**前置檢查** → **工作區檢查**（未追蹤檔警告）→ `git stash create` 快照（含已追蹤檔的未提交修改）→ `git archive --worktree-attributes` 產 ZIP（未 commit 的 `.gitattributes` 也立即生效）→ **審核**（檔名禁則加內容掃描）→ 產生 `.sha256`。審核有洩漏就刪除 zip、結束碼 1。

**審核兩層**
- **檔名禁則**：內建涵蓋 `.env*`、私鑰與憑證檔、`.git/`、AI 治理目錄與檔案、`dist/`；專案特有的用 `forbiddenExtra` 加，不需要的用 `forbiddenRemove`（子字串比對內建禁則）放行。
- **內容掃描**：掃包內文字檔，命中私鑰區塊、AWS／GitHub／Anthropic／OpenAI／Slack 金鑰就**失敗**；疑似寫死的 `password = '…'` 只**警告**。`*.example`、`*.sample` 不掃；`contentScan.enabled:false` 可關，`contentScan.allow` 放行特定路徑。

**工作區檢查**：未追蹤檔不在快照內（新檔漏包的主因），預設只警告並列出；`--strict` 失敗；`--require-clean` 要求工作區完全乾淨。未提交的修改會進包，摘要的 `includesUncommittedChanges` 會標示。

```bash
node scripts/pack-release.mjs --dry-run                  # 預覽，不留下任何檔
node scripts/pack-release.mjs                            # 完整發佈包 dist/<name>-v<版本>-<日期>.zip + .sha256
node scripts/pack-release.mjs --since v1.2.0             # 增量更新檔（見下）
node scripts/pack-release.mjs --require-clean --strict   # 正式發佈建議
node scripts/pack-release.mjs --out dist/custom.zip --force
```

輸出檔已存在會拒絕，要覆寫才加 `--force`。內部不用 `tar` 讀 zip，Windows、macOS、Linux 都能跑；只有內容掃描需要 `tar` 解開檔案。測試：`node --test scripts/pack-release.test.mjs`。

#### 占位目錄（`placeholders`）

上傳圖檔 `img/`、日誌 `log/`、暫存 `content/temp/` 這類目錄，正式機需要它**存在**（程式會寫入、自己建子目錄），但 Git 不追蹤空目錄，包裡沒有內容時目錄就不見，部署後程式寫檔失敗。

- 在 `release.config.json` **只寫 base path**：`"placeholders": ["img", "log", "content/user_files"]`。子目錄（如 `img/2024/01`）由程式執行時自行建立，不必列；若列了，腳本會合併到上層 base path。
- 腳本檢查每個 base path：
  - **目錄在包裡已有檔案或子目錄 → 原樣保留，什麼都不加。**
  - **目錄在包裡完全沒有內容 → 補一個空的 `<目錄>/.gitkeep`**（`git archive --add-virtual-file`），目錄就存在；repo 不必提交 `.gitkeep`。
- 要不要發佈目錄裡的內容，是 `.gitignore` 與 `.gitattributes` 的事，`placeholders` 不改變它。上傳檔通常沒進版控（`.gitignore`），自然不會進包；有進版控的預設資源會照常保留。
- 禁則擋整個目錄（如 `forbiddenExtra: ["^img/"]`）時，占位的 `.gitkeep` 仍放行，目錄裡的真實檔案照樣被擋。
- 更新檔：上一版發佈包裡已有該目錄（正式機就有了），或本次更新檔自己帶了該目錄的檔案，都不放。只有刪除、沒有檔案可附帶時，改列在 `CHANGES.txt` 的「需建立的空目錄」。
- 需要支援 `--add-virtual-file` 的 Git（Git 2.43 實測可用）；太舊會報錯並提示升級，或改在 repo 提交 `.gitkeep`。

#### 增量更新檔（`--since <tag 或 commit>`）

只打包自該 ref 以來「**新增與修改**」的**發佈檔**（同樣套用 export-ignore 與全部審核），並產生 `<zip 名>.CHANGES.txt`：

- **新增／修改**：在 zip 內。
- **刪除**：**不在 zip 內**。部署是「解壓覆蓋」，不會刪舊檔，所以 `CHANGES.txt` 列出要在正式機**手動移除**的檔案。包含「原本在發佈包、現在被 export-ignore 排除」的檔案。
- 發佈範圍沒有任何變更會失敗並說明；只有刪除時不產生 zip，仍產生 `CHANGES.txt`。
- 基準 ref 要用上次實際部署的版本（建議每次部署後打 tag），基準錯了更新檔就會漏檔。

### 4. 規格書與文件對齊

1. 依 [`references/release-spec-template.md`](references/release-spec-template.md) 建立 `docs/RELEASE_SPEC.md`：包含白名單、排除黑名單、命名、指令、部署與覆蓋更新 SOP。
2. `AGENTS.md` 加「發佈打包規範」：唯一產出指令 `node scripts/pack-release.mjs`、規格書路徑；硬約束寫明禁止把 `dist/` 提交版控、禁止手動全目錄壓縮。
3. 同步更新 `README.md`（文件清單）與 `docs/NOTE.md`（交接：目前版本、怎麼打包、上次部署的基準 tag）。

### 5. 驗證

交付前實際執行，不推測：

1. `node scripts/pack-release.mjs` 結束碼為 0。
2. JSON 摘要 `leakedSensitiveOrDevFiles: 0`，`topLevelIncluded` 只有正式環境需要的項目。
3. `git status -s` 確認 `dist/*.zip`、`*.sha256`、`*.CHANGES.txt` 被忽略、沒污染版控（`dist/` 在 `.gitignore`）。
4. 想確認審核真的有效，可暫時加一個機敏檔試跑，應看到失敗並刪除 zip。

## 常見錯誤

| 錯誤 | 原因 | 做法 |
| --- | --- | --- |
| 改了 `.gitattributes` 還沒 commit，打包卻仍含舊檔 | `git archive` 預設讀 commit 內的屬性 | 腳本已加 `--worktree-attributes`；手動執行時別漏 |
| 用 `zip -r` 壓整個專案 | 把未進版控的帳密與上傳檔打進去 | 一律 `git archive` |
| 正式機需要空目錄但包裡沒有（`img/`、`log/` 等） | Git 不追蹤空目錄，內容排除後目錄就消失 | 列進 `placeholders`；或目錄內提交 `.gitkeep`，`.gitignore` 寫 `/log/*` 加 `!/log/.gitkeep` |
| 新增的檔案沒進包 | `git stash create` 不含未追蹤檔 | 先 `git add` 新檔；腳本會列出未追蹤檔，正式發佈用 `--strict` |
| 更新檔部署後舊檔還在 | 解壓覆蓋不會刪檔 | 照 `CHANGES.txt` 的「刪除」清單在正式機手動移除 |
| 更新檔缺檔 | `--since` 基準不是上次實際部署的版本 | 每次部署後打 tag，下次以該 tag 為基準 |

## 完成回報

1. 壓縮包路徑、大小、條目數與 `.sha256`；更新檔另附新增／修改／刪除數量與 `CHANGES.txt` 路徑。
2. `topLevelIncluded` 與審核結果。
3. 新增或更新的檔案：`.gitattributes`、`scripts/pack-release.mjs`、`scripts/release.config.json`、`docs/RELEASE_SPEC.md`、`AGENTS.md`。
4. 沒實測的部分明說。

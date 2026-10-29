# 正式發佈打包規格書範本 (Release Packaging Specification Template)

將以下範本套用至目標專案的 `docs/RELEASE_SPEC.md`，並依專案實際路徑填寫表格。專案特有的禁則同步寫進 `release.config.json` 的 `forbiddenExtra`：

````markdown
# 正式發佈打包規格書 (Release Packaging Specification)

本規格定義 `<專案名稱>` 產出正式環境部署檔（Release Artifact）之標準流程、檔案邊界、安全審核與部署規範。

---

## 1. 目標與原則

1. **零機敏洩漏**：正式包內嚴禁包含本機密碼檔、環境設定檔（`.env*`）與本機日誌（`log/*.log`）。
2. **純淨 Runtime**：正式包僅包含伺服器執行所需資源；所有開發工具、AI 治理設定、測試腳本、本地文件一律排除。
3. **版本與可追溯性**：檔名自動帶入專案版本號與打包日期 `YYYYMMDD`。
4. **自動化驗核**：打包前自動執行語法／Lint 檢查，打包後自動掃描壓縮檔結構（`tar -tf`），若有非預期檔案立即報錯終止。

---

## 2. 檔案分層與邊界定義

### 2.1 包含清單（Runtime 白名單）

| 路徑 / 檔案 | 說明 |
| --- | --- |
| `<入口檔 / 應用程式目錄>` | 正式環境執行程式碼與靜態資源 |
| `<設定檔範本 *.example>` | 供正式機首次部署複製設定使用 |
| `<上傳或日誌目錄>/.gitkeep` | 執行期空目錄結構錨點 |
| `<vendor / 執行期依賴>` | 正式環境必要第三方套件 |

### 2.2 排除清單（自動過濾）

| 類別 | 排除項目 | 控制機制 |
| --- | --- | --- |
| **機敏設定與日誌** | `<帳密檔>`、`.env*`、`log/*.log` | `.gitignore` + `pack-release.mjs` 審核（帳密檔寫進 `forbiddenExtra`） |
| **執行期暫存與上傳** | `<上傳目錄>/*`、`<暫存目錄>/*`（僅保留 `.gitkeep`） | `.gitignore` + `pack-release.mjs` 審核 |
| **AI 規則與技能** | `/.agents/`、`/.claude/`、`/.cursor/`、`AGENTS.md`、`CLAUDE.md`、`NOTE.md` | `.gitattributes` (`export-ignore`) |
| **工程文件與交接** | `NOTE.md`、`README.md`、`/docs/` | `.gitattributes` (`export-ignore`) |
| **自動化測試與腳本** | `/scripts/`、`/profiles/`、`/tests/` | `.gitattributes` (`export-ignore`) |
| **打包與版控設定** | `/.git/`、`/.gitignore`、`/.gitattributes`、`/dist/` | `.gitattributes` (`export-ignore`) |

---

## 3. 產出物規範

- **儲存目錄**：`dist/`（已列入 `.gitignore`，不進版控）
- **命名格式**：`dist/<project>-v<VERSION>-<YYYYMMDD>.zip`；更新檔多 `-patch-<基準>`；另有 `.sha256`、`.CHANGES.txt`
- **壓縮格式**：標準 ZIP 格式

---

## 4. 產生發佈檔方式（標準操作程序）

```bash
# 預覽將打包的清單（不實際寫入壓縮檔）
node scripts/pack-release.mjs --dry-run

# 正式打包
node scripts/pack-release.mjs

# 指定自訂輸出路徑（已存在要加 --force 才覆寫）
node scripts/pack-release.mjs --out dist/custom-name.zip
```

---

## 5. 增量更新檔

```bash
# 以上次實際部署的 tag 為基準，只打包新增與修改的發佈檔
node scripts/pack-release.mjs --since <上次部署的 tag>
```

產出 `dist/<project>-v<VERSION>-<YYYYMMDD>-patch-<基準>.zip`、`.sha256` 與 `.CHANGES.txt`（新增、修改、**刪除**清單）。每次部署成功後打 tag，作為下次的基準。

---

## 6. 正式機部署與更新 SOP（解壓覆蓋）

1. **驗證**：核對 `.sha256`（`sha256sum -c <檔>.sha256`）。
2. **備份**：備份將被覆蓋的目錄或檔案（更新檔可只備份 `CHANGES.txt` 列出的新增與修改項目）。
3. **覆蓋**：解壓縮 ZIP 覆蓋正式環境目錄；不會影響正式機既有帳密與上傳資料。
4. **刪除**：解壓覆蓋**不會刪檔**，照 `CHANGES.txt` 的「刪除」清單手動移除舊檔。
5. **初次安裝才需要**：把 `*.example` 複製為正式設定檔並填寫正式機參數，確認上傳與日誌目錄可寫。
6. **驗證**：開啟網站或執行健康檢查，確認版本號與主要功能。
7. **回滾**：有問題就還原第 2 步的備份。
8. **記錄**：成功後打 tag（作為下次 `--since` 基準），更新 `NOTE.md` 的部署紀錄。
````

---
name: my-commit-all-and-push
description: 安全檢查目前工作區變更、排除機敏資訊與暫存檔，產生 Conventional Commits 繁體中文訊息並完成 commit 與 push。用於 commit all、git push、全部提交、一鍵提交推送、提交變更時。
---

# my-commit-all-and-push — 安全提交與推送

將工作區的現有變更進行安全審查後，產生符合規範的語意化 Commit 訊息並推送至遠端儲存庫。

```mermaid
graph TD
  A[收到提交請求] --> B[檢查 git status 與 diff]
  B --> C{機敏與暫存檢查}
  C -->|發現 .env / Token / 暫存檔| D[阻擋並警告使用者]
  C -->|安全無虞| E[產生 Conventional Commit 訊息]
  E --> F[執行 git add 與 git commit]
  F --> G[執行 git push]
  G --> H[回報 Commit SHA 與推送摘要]
```

## 執行流程

### 1. 變更狀態與安全預檢

執行 `git status` 與 `git diff --cached` / `git diff`：
- **機敏資訊檢查**：嚴禁提交 `.env`、API Key、Token、私鑰或密碼。若有發現，立即中止並通知使用者。
- **暫存產物檢查**：確認無遺留的測試暫存檔（如 `scripts/tmp/`、`.log`、無用 dump 檔）。
- **分支檢查**：確認當前分支。嚴禁在 `main`／`master`、`develop`、`release/*` 執行任何 force push。

### 2. 產生 Conventional Commits 訊息

根據本次實際變更內容，組合標準 Conventional Commits 格式：

```text
<type>(<scope>): <繁體中文簡短主旨>

[選填：詳細條列變更要點 what & why]
```

- **Type 定義**：
  - `feat`：新增功能
  - `fix`：修復 Bug
  - `docs`：文件變更
  - `style`：格式調整（不影響邏輯）
  - `refactor`：重構（無新增功能亦無修 Bug）
  - `perf`：效能優化
  - `test`：增加或修改測試
  - `chore`：建置流程、輔助工具或依賴變更
- **規範要求**：
  - 主旨使用繁體中文、動詞開頭、不超過 50 字元、結尾不加句號。
  - 若有破壞性變更，在 type 後加 `!`（例如 `feat!: ...`）或在 body 註明 `BREAKING CHANGE:`。

### 3. 執行提交與推送

1. 將目標變更加入暫存：`git add <files>` 或 `git add .`（確認 `.gitignore` 正常生效）。
2. 建立提交：`git commit -m "<訊息>"`。
3. 推送至遠端追蹤分支：`git push origin <當前分支>`。
4. 回報結果：輸出 Commit SHA、分支名稱、推送狀態與變更檔案數量。

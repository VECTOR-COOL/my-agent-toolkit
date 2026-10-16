---
name: my-upgrade-plan
description: 為目前工作區／子專案擬定安全升級計畫：查現況與官網、避雷、決版、寫 task 計畫，經同意後才備份升級。用於軟體升級計畫、版本升級評估，或 Plan 模式下規劃升級時。
---

# my-upgrade-plan

為**目前工作區／子專案**擬定安全升級計畫。先切 **Plan 模式**；未經使用者同意，不動遠端正式環境。

## 流程

1. **現況**：讀目錄 `readme` / `AGENTS.md` / `docs/_index.md`，確認目前版本與更新 SOP（若有 `update_rollback_guide`、`backup_guide` 優先遵循）。
2. **官網**：查官方 release notes / changelog，記錄 **stable**（目標）與 **beta**（不採用）。
3. **避雷**：簡查 GitHub issues、論壇，針對候選版與本專案部署方式（Docker、DB、worker 等）看是否有 blocker。
4. **決版**：建議升到 stable 最新 patch；版太新且有爭議 issue 可降一個 patch。說明理由即可。
5. **產出**：在子專案 `task/` 寫簡短計畫（目前版 → 目標版、備份、步驟、驗證、回滾），並請使用者確認是否執行。
6. **執行**（同意後）：備份 → 改版本 → 重啟／部署 → 最小驗證 → 簡短結果。

## 原則

- 升級前先備份；機敏檔（`.env`、金鑰）不提交版控。
- 本地先改配置與文件，遠端依專案規範（如 `/docker-data/*`）且須同意。
- 回覆使用**台灣繁體中文**。

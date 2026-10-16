---
name: my-cursor-cloud-env-init
description: 建立、檢查或對齊 Cursor Cloud 環境腳本與冷啟動，預設 develop，跑測試至可本地與遠端運行，成功後 commit all & push。用於 Cursor Cloud 環境初始化、冷啟動失敗排查，或透過 API 建立／協同排除 Cloud Agent 問題時。
---

> 已遷至 plugins/my-workflow-plugin/skills/my-cursor-cloud-env-init/，勿再改此副本。

# my-cursor-cloud-env-init

1. 建立、檢查或對齊 cursor cloud 環境建立腳本，確保冷啟動正常
2. 盡量腳本化避免 agent 判斷，減少飄移可能
3. 透過 api 建立 新的 cursor cloud 環境 代理使用 grok 4.7 extra high fast
4. 預設開啟為 develop 分支
5. 啟動本專案需啟動服務
6. 專案內有測試跑一遍測試，失敗，找出原因回到第一點
7. 本地與遠端都要能夠運行
8. 追蹤 cursor cloud agent 設置完成
9. 若失敗則透過 API 與 cursor cloud agnet 協同排除問題，直至排除問題
10. 若因爲需要另外設定環境變數無法排除問題，請說明設定 key 與值，儲存於本地專案什麼位置，待設定完成後，由第一步開始
11. 成功冷啟動後 commit all & push

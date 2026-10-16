---
name: my-codebase-clear
description: 分析 codebase 可清理項目、維護 cleanup-candidates.json、經同意後安全刪除並收尾合併分支。用於程式碼清理、垃圾檔掃描、review cleanup-candidates，或使用者說執行清理時。
---

# my-codebase-clear

## 清理前

1. 若尚未進入清理模式時 ( 沒有 cleanup-candidates.json )
2. 根目錄若有此檔 cleanup-candidates.json 請 review
3. 請先 commit ALL & push 當前 repo
4. 並切換到清理 clearup 工作分支

## 查找可清理項目

1. 我想要針對程式碼清理，避免垃圾檔案存在於本專案中，請幫我分析整個codebase列出可清理的程式碼，先不清理，建立一個 json 檔於根目錄 cleanup-candidates.json，並說明原因，列出檔案，刪除cleanup-candidates.json中的2檔案不會影響本地測試環境運作、cursor cloud 環境運作、正式環境與線上測試環境運作
2. 請仔細掃描、分析，請於根目錄整理成一個 cleanup-candidates.json 檔
3. 查找可清理項目包含隱藏檔案、快取檔案、打包過後無用壓縮檔、log 檔

## Review cleanup-candidates.json

1. 已經產生 cleanup-candidates.json 為先決條件
2. 當使用者提示 review，先不執行清理，按照目前 cleanup-candidates.json 進行 review
3. 有需要異動直接異動，需要追加就追加，發現不能刪就移除 cleanup-candidates.json 中的項目
4. 使用者沒有提到"執行清理"就是 再次 review

## 執行清理

1. 已經產生 cleanup-candidates.json 為先決條件
2. 開始執行清理前，請徵得使用者同意
3. 請安全刪除根目錄下的 cleanup-candidates.json 所列檔案
4. 刪除過程逐一檢查檔案是否可刪，若判斷為不可刪除，請跳過，並於對話中回報
5. 清安全移除，git歷史要查得到脈絡，機敏檔案不予記錄

## 刪除完成

1. commit all & push 標記刪除原因
2. 刪除 cleanup-candidates.json
3. cleanup 工作分支合併至刪除前分支， ( 通常為 develop )
4. 刪除工作分支，回報摘要

## 必要遵守

1. 開始執行清理前，請徵得使用者同意
2. 清安全移除，git歷史要查得到脈絡，機敏檔案不予記錄
3. 使用者沒有提到"執行清理"就是 再次 review

---
name: my-skill-update
description: 更新已安裝的 my-workflow plugin（Claude Code 的 /plugin、Codex 的 marketplace）。用於檢查更新或使用者要求更新時。
---

# 檢查與更新 my-workflow

repo：https://github.com/VECTOR-COOL/my-agent-toolkit

帳號需能讀這個私人 repo。不要改 Git 設定，不要強制推送。安裝步驟以 plugin 的 `README.md` 為準；改 plugin 先對 `AGENTS.md`。使用者要求更新時才動手。

## 判斷

1. Claude Code：`/plugin marketplace update my-agent-toolkit`，再更新或重新安裝 `my-workflow`。
2. Codex：更新 repo 內的 marketplace 來源後，重新啟用 `my-workflow@my-agent-toolkit`。hooks 有變動要重新信任。
3. ChatGPT 網頁：重新貼 `rules/global.md` 並上傳需要的 skill 資料夾。
4. 以上流程的實機行為未全部驗證（見 README 驗證狀態），失敗時如實回報，不假裝完成。

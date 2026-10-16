---
name: my-skill-update
description: 用 GitHub CLI 的 gh skill update 更新已安裝的 my-workflow skills。釘住 tag 的不會被更新。用於檢查更新或使用者要求更新時。
---

# 檢查與更新 skills

repo：https://github.com/VECTOR-COOL/my-agent-toolkit

需要 GitHub CLI 2.90.0 以上，且帳號能讀這個私人 repo。不要改 Git 設定，不要強制推送。步驟以 `my-skills/my-workflow/README.md` 為準。改套件先對 `AGENTS.md`。

## 判斷

1. Cursor：使用者要求更新時才跑 `gh skill update`。專案用預設 scope；當初用 `--scope user` 的才會進 `~/.cursor/skills`。
2. Codex 或 ChatGPT 桌面：當初用 `--agent codex` 裝的，更新跑 `gh skill update`。
3. Grok 命令列：當初用 `--agent grok` 裝的，更新跑 `gh skill update`。
4. Grok Bot：依同一網址覆寫私人 skill。不要改走複製到家目錄。
5. Cursor Cloud：在目標專案跑 `gh skill update` 後 commit。沒有 `gh` 才用匯出腳本。
6. ChatGPT 網頁：重新上傳內層 skill 資料夾。grok.com 不能裝。
7. 釘住 `--pin` 或 `@tag` 的 skill 不會被 `gh skill update` 更新。

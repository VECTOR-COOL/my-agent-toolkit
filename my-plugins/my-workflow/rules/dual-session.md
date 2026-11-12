# Claude Code 專屬：本機＋雲端雙 session 開發

使用者要主對話開 session 分工開發時讀。**只在 Claude Code 生效**：沒有 `mcp__ccd_session__start_session` 工具就略過整份（Codex、ChatGPT、網頁、Cowork、Gemini 都沒有），不報錯、不改用別的做法冒充。

## 先判斷有沒有雲端

呼叫 `mcp__ccd_session__list_start_targets`：

```yaml
cloud.available: true        # 否則全部只派本機
環境: fitsRepository 不為 false 且 hosted 為 true   # 對應這個 repo 的環境
```

沒有就只派本機 session，略過下面「雲端」整節，不提示錯誤、不硬開。`available: false, reason: not_on_screen` 是對話不在 app 畫面上：請使用者切回對話再派；通知或自動事件觸發的輪次不能開新 session。

## 分工

主對話開、派、驗收。本機 session 開發、預覽畫面、最後驗收；雲端 session 開發與測試（電腦關機也照跑）。畫面預覽以本機為主。

```yaml
標題: "<repo> 本機開發" / "<repo> 雲端開發"   # 前綴 repo 名，手機版才分得出
name: <repo縮寫>-local / <repo縮寫>-cloud       # [a-z0-9-]、24 字元內，太長就縮短 repo 名
分支: 專案規定的開發分支（看 AGENTS.md／README），沒規定才用 develop；與桌面相同
```

- 同一任務只派一邊；同一時間只讓一邊改檔。push 前 `git pull --rebase`，不 force push。

## 本機 session

- `start_session` 用 fresh、`use_worktree: false`（共用主資料夾）。
- 開一次後用 `SendMessage`（`to` 用 `local_…` id）續派；結束或壞掉才重開，沿用同名，不一直長新的。
- 每輪結束 app 會叫醒主對話並附摘要；全文用 `mcp__ccd_session_mgmt__list_events`。

## 雲端（有環境才做）

雲端 session 的限制：

- 預設 checkout 是 `main`，簡報必須寫明 `git fetch origin && git checkout <開發分支> && git pull --ff-only origin <開發分支>`（`<開發分支>` 同上，沒規定才是 `develop`）。
- 結束不會通知主對話，`list_sessions`、`ListAgents`、`list_events` 都看不到它，無法續派：**每個雲端任務開新 session**，沿用同標題與代號。
- 純驗證、不改檔的任務不會有 commit，沒有完成訊號，改在本機跑。

**完成訊號＝開發分支的 `origin/<開發分支>` 出現新 commit**（簡報要求 commit 訊息附專案驗證指令的結果）。開發分支用專案規定的（看 `AGENTS.md`／`README.md`），沒規定才用 `develop`；下面監看指令與雲端 checkout 指令裡的 `develop` 一併換成它。主對話用背景 Bash（`run_in_background`）監看，一律直接向遠端取值（`ls-remote`），不讀可能過期的本機 `origin/*`，取不到不算完成：

```bash
BR=develop   # 換成專案的開發分支
BASE=$(git ls-remote origin refs/heads/$BR | cut -f1)   # 派發前先記下
[ -n "$BASE" ] || { echo "取不到 origin/$BR"; exit 2; }
for i in $(seq 25); do
  sleep 60
  CUR=$(git ls-remote origin refs/heads/$BR | cut -f1)
  [ -n "$CUR" ] && [ "$CUR" != "$BASE" ] && { echo "CHANGED $CUR"; exit 0; }
done
echo "TIMEOUT"; exit 1   # 約 25 分逾時
```

結束碼：0 有新 commit、1 逾時、2 起始值取不到。背景程序結束會叫醒主對話，再 `git fetch` 驗收。`CronCreate` 只存在於該對話，關掉就沒了，不當完成訊號。

要讀雲端回應全文：commit trailer 的 `Claude-Session: https://claude.ai/code/session_…` 可用 Claude in Chrome 開，但會用到使用者的 claude.ai 登入，**每次先徵得同意**，讀完關分頁。

## 驗收

session 的回報只是回報：主對話自己看 diff（只改了該改的檔）、重跑專案驗證，才說完成。雲端相關的環境與冷啟動細節見 `my-cloud-agent`。

# my-workflow-plugin

私人工作流。不上架。

本機用**資料夾連結**指回這個 repo。之後在這裡加規則或 skill，`git pull` 就會更新，不必重裝。

連結不是複製。不要把 plugin 複製到家目錄。

## 這台電腦的連結

| 環境 | 連結 | 指到 |
| --- | --- | --- |
| Cursor IDE | `C:\Users\Ann G\.cursor\plugins\local\my-workflow-plugin` | `D:\PROJECTS\my-agent-toolkit\plugins\my-workflow-plugin` |
| Codex app | `C:\Users\Ann G\.codex\plugins\my-workflow-plugin` | 同上 |
| Grok Build | `C:\Users\Ann G\.grok\plugins\my-workflow-plugin` | 同上 |

換一台電腦時，家目錄會不同。用下面的 prompt，讓 agent 依那台電腦的家目錄建立連結。

## 安裝 prompt

貼給 agent：

```text
安裝我的私人 plugin，用資料夾連結，不要複製。

Plugin 來源：
D:\PROJECTS\my-agent-toolkit\plugins\my-workflow-plugin
若這個路徑不存在，改找目前 repo 裡的 plugins/my-workflow-plugin。

用 Node.js 建立連結（Windows 用 junction）。家目錄用 os.homedir()，不要寫死使用者名稱。

要建立的連結：
- Cursor：<家目錄>/.cursor/plugins/local/my-workflow-plugin
- Codex：<家目錄>/.codex/plugins/my-workflow-plugin
- Grok Build：<家目錄>/.grok/plugins/my-workflow-plugin

規則：
1. 先建立上一層資料夾。
2. 連結已存在且指到這個 plugin：不要改，回報已安裝。
3. 路徑已存在但不是指向這個 plugin：停下來問我，不要覆蓋。
4. 不要複製檔案，不要把連結放進 plugin 裡面。
5. 不要 commit，不要改 plugin 內容。
6. 完成後用一行回報每條連結指到哪裡。

Cursor Cloud 與 ChatGPT 網頁不能用這個連結，這次不要處理。
```

## 檢查更新與更新

不會在背景自動掃描。要更新時在這個資料夾執行：

```text
node scripts/update-plugin.mjs check
node scripts/update-plugin.mjs update
node scripts/update-plugin.mjs update --apply
```

`check` 只查遠端並看連結還在不在。`update` 先預覽。加上 `--apply` 才會 `git pull --ff-only`，並補上還沒建立的資料夾連結。

有未提交變更、或本機和遠端各有新提交時，指令會停下來，不會自動合併。

### 更新 prompt

貼給 agent：

```text
檢查並更新我的私人 plugin。

到這個目錄：
D:\PROJECTS\my-agent-toolkit\plugins\my-workflow-plugin
若路徑不存在，改找目前 repo 的 plugins/my-workflow-plugin。

先執行：
node scripts/update-plugin.mjs check

我若要求更新，再執行：
node scripts/update-plugin.mjs update
確認預覽後才執行：
node scripts/update-plugin.mjs update --apply

不要複製 plugin，不要覆蓋指到別處的連結，不要 commit，不要強制合併。
ChatGPT 網頁與 grok.com 不能用這個指令更新。
```

## Cursor Cloud 匯出

本機連結進不了 Cloud。要把 skills 與 rules 寫進該專案：

```text
node scripts/export-cursor-skills.mjs <目標專案> --dry-run
node scripts/export-cursor-skills.mjs <目標專案> --force
```

會寫入 `<目標專案>/.cursor/skills/` 與 `<目標專案>/.cursor/rules/`。那些檔由這個 plugin 產生，不要手改。改完後在該專案 commit。

本 toolkit 已匯出一份，給這個 repo 的 Cloud Agent 用。

## 相容

| 環境 | 怎麼用 | 更新 |
| --- | --- | --- |
| Cursor IDE | 資料夾連結 | `git pull` 或 `update-plugin.mjs` |
| Cursor Cloud／Cursor Grok Bot | 匯出到該 repo 的 `.cursor/skills` 與 `.cursor/rules` | 再跑匯出並 commit |
| Grok Build | 資料夾連結 | 同上 |
| grok.com 網頁 | 不能裝 | 無 |
| ChatGPT app／Codex app | 資料夾連結或選這個資料夾 | `update-plugin.mjs` |
| ChatGPT 網頁 | 上傳整個 skill 資料夾。先傳 `my-workflow`，再傳這次用得到的 | 改過的 skill 重新上傳 |

格式正確不是已在該 app 跑過。本機安裝要用 `install-local.mjs --apply`，這份 README 不會自己建連結。

## 規格

- Agent Plugins 1.0.0：`plugin.json` 與 `skills/`
- Cursor adapter：`.cursor-plugin/` 與 `rules/`
- Codex fallback：`.codex-plugin/`
- Grok／Claude layout：`.claude-plugin/`
- 沒有 `mcp.json`。記憶走 `my-memory`（Notion）
- plugin 版本 `0.1.0`，與 toolkit `project.json` 版本分開


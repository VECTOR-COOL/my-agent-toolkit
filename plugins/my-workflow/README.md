# my-workflow

私人工作流。不上架公開市集。plugin 版本 `0.2.1`。

之後開發維護以 [`AGENTS.md`](AGENTS.md) 為準。元件表見 [`skills/my-workflow/references/index.md`](skills/my-workflow/references/index.md)。

Plugin 本體在 `plugins/my-workflow`。追蹤分支 `develop`。

https://github.com/VECTOR-COOL/my-agent-toolkit/tree/develop/plugins/my-workflow

Cursor 匯入上面這個目錄。Codex 的市集來源是倉庫根本身，因為清單在倉庫根；安裝時只選 `my-workflow`。不要複製到家目錄，也不要做家目錄資料夾連結。

```mermaid
graph TD
  GH["GitHub develop"] --> CursorSrc["plugins/my-workflow"]
  GH --> CodexSrc["倉庫根市集清單"]
  CursorSrc --> Cursor["Cursor 團隊市集"]
  Cursor --> Auto["打開 Auto Refresh 就自動更新"]
  CodexSrc --> Codex["Codex 只裝 my-workflow"]
  Codex --> Up["codex plugin marketplace upgrade"]
  Grok["Grok Bot"] --> Hold["沒有安裝步驟"]
```

斜線命令一律 `my-workflow-` 開頭，例如 `/my-workflow-update`、`/my-workflow-docs`。入口 skill 仍是 `my-workflow`。

## 安裝 prompt

貼給 agent：

```text
安裝我的私人 plugin my-workflow。不要複製，不要做家目錄資料夾連結。
你只做自己這個環境。另外兩個寫「略過」，不要嘗試，也不要當成失敗。

你是 Cursor 才做：
1. 不要用 /add-plugin。那個會停在舊 commit。
2. Dashboard → Plugins & MCPs → Team Marketplaces → Add Marketplace → Import from Repo。
3. 貼 https://github.com/VECTOR-COOL/my-agent-toolkit/tree/develop/plugins/my-workflow ，追蹤 develop。
4. Marketplace Settings 打開 Auto Refresh 並存檔。
5. Customize 只安裝 my-workflow。
6. 開不了 Dashboard，或沒有 Teams／Enterprise：停。把 2 到 5 貼給我手動做。不要重試，不要改別的裝法。

你是 Codex 或 ChatGPT 桌面才做：
1. 先跑 codex plugin marketplace --help。
2. 沒有這條子命令：停。只回報 codex --version，請我升級。不要分析 sparse，不要改走複製或家目錄連結。
3. 有的話原樣執行，不要加 --sparse，也不要改路徑：
   codex plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit.git --ref develop
   這個網址是市集來源。清單在倉庫根 .agents/plugins/marketplace.json，只列 my-workflow。不要把整個 repo 裡的其他目錄裝成 plugin。
4. 在 /plugins 只安裝 my-workflow。
5. 指令失敗就貼 stderr 後停。不要自己改參數。

你是 Grok Bot 才做：
沒有安裝步驟。不要尋找 grok 命令列，不要改走別的方法。
回報：Grok Bot 無法從 GitHub 安裝 plugin，略過。

不要處理 Cursor Cloud、ChatGPT 網頁、grok.com。
不要 commit，不要改 plugin 內容。
最後只回報你這個環境。
```

## 更新 prompt

貼給 agent：

```text
更新我的私人 plugin my-workflow。只更新這個目錄，不是整個 repo：
https://github.com/VECTOR-COOL/my-agent-toolkit/tree/develop/plugins/my-workflow

依環境做，不要混用：

1. Cursor 若已用團隊市集且 Auto Refresh 開著：不要 pull、不要重裝。告訴我推上 develop 後重開視窗就會更新。
2. Codex 或 ChatGPT 桌面：執行 codex plugin marketplace upgrade。沒有這條市集就先說，不要改走別的安裝。
3. Grok Bot：沒有更新步驟。不要尋找 grok 命令列。回報略過。
4. Cursor Cloud：在 plugin 目錄執行
   node scripts/export-cursor-skills.mjs <目標專案> --force
   然後只在該目標專案 commit。目標專案沒指定就停下來問。
5. ChatGPT 網頁、grok.com：直接說不能用這條 GitHub 更新。

不要複製 plugin，不要覆蓋別的安裝，不要強制合併，不要改 Git 設定。
```

## 安裝

repo 要先推上 `develop`，而且帳號要能讀這個私有 repo。下面兩種裝法都還沒在這台機器跑過。

### Cursor

要用會自動更新的裝法。需要 Teams 或 Enterprise，以及這個 repo 上的 Cursor GitHub App。

1. Dashboard → Plugins & MCPs → Team Marketplaces → Add Marketplace → Import from Repo。
2. 貼 `https://github.com/VECTOR-COOL/my-agent-toolkit/tree/develop/plugins/my-workflow`。這是 plugin 目錄，不是整個 repo。
3. Marketplace Settings 打開 **Auto Refresh**，存檔。
4. Customize 安裝 `my-workflow`。

推上 `develop` 之後，Cursor 最多約 10 分鐘重新索引一次。重開視窗或視窗回到前景就會換成新版。不要用個人的 `/add-plugin` 貼 GitHub，那個會停在當初的 commit，不會跟著更新。

### Codex 與 ChatGPT 桌面

先跑 `codex plugin marketplace --help`。沒有這條子命令就先升級 Codex，不要改參數重試。

```text
codex plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit.git --ref develop
```

不要加 `--sparse`。這個網址是市集來源，不是把整個 repo 裝成 plugin。清單在倉庫根 [`.agents/plugins/marketplace.json`](../../.agents/plugins/marketplace.json)，只列 `my-workflow`。然後在 `/plugins` 或桌面的 Plugins 只安裝 `my-workflow`。

這個不會自動更新。要更新時執行：

```text
codex plugin marketplace upgrade
```

### Grok Bot

Grok Bot 有記憶規則，在 `skills/my-memory/references/grok-bot.md`。

沒有從 GitHub 安裝 plugin 的步驟。不要尋找 grok 命令列，也不要改走別的方法。

### 不能用這條 GitHub 連結的

| 環境 | 怎麼辦 |
|------|--------|
| Cursor Cloud／Cursor Grok Bot | 匯出到該專案的 `.cursor/skills` 與 `.cursor/rules`，再 commit |
| ChatGPT 網頁 | 上傳 skill 資料夾。先傳 `my-workflow`，再傳這次用得到的。改過就重新上傳 |
| grok.com | 不能裝 |

## 更新

| 環境 | 更新 |
|------|------|
| Cursor 團隊市集，已開 Auto Refresh | 自動。推上 `develop` 後重開視窗 |
| Codex／ChatGPT 桌面 | `codex plugin marketplace upgrade` |
| Grok Bot | 沒有這條安裝與更新。不要尋找 grok 命令列 |
| Cursor Cloud | 再跑下面的匯出並 commit |
| ChatGPT 網頁、grok.com | 不走這條 GitHub 更新 |

斜線命令 `/my-workflow-update` 只在 Codex 還沒升級、或 Cloud 要匯出時用。Cursor 已開 Auto Refresh 就不要再手動拉。

## Cursor Cloud 匯出

```text
node scripts/export-cursor-skills.mjs <目標專案> --dry-run
node scripts/export-cursor-skills.mjs <目標專案> --force
```

會寫入 `<目標專案>/.cursor/skills/` 與 `<目標專案>/.cursor/rules/`。那些檔由這個 plugin 產生，不要手改。改完後在該專案 commit。

本 toolkit 已匯出一份，給這個 repo 的 Cloud Agent 用。

## 元件

| 何時 | skill | Cursor 斜線 |
|------|-------|-------------|
| 新對話、不知用哪個 | `my-workflow` | `/my-workflow-start` |
| 更新本 plugin | `my-plugin-update` | `/my-workflow-update` |
| 記憶 | `my-memory` | `/my-workflow-memory` |
| 文件 | `my-docs` | `/my-workflow-docs` |

完整表見 [元件目錄](skills/my-workflow/references/index.md)。沒有斜線命令的 client 用 skill 名。

## 規格

- 維護準則：[`AGENTS.md`](AGENTS.md)
- Agent Plugins 1.0.0：`plugin.json` 與 `skills/`
- Cursor adapter：`.cursor-plugin/`、`rules/`、`commands/`
- Codex fallback：`.codex-plugin/`
- Grok／Claude layout：`.claude-plugin/`
- 沒有 `mcp.json`。記憶走 `my-memory`（Notion）
- plugin 版本 `0.2.1`，與 toolkit `project.json` 版本分開

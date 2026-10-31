# Claude 外部記憶存取規則

適用 Claude Code（終端機、Desktop 的 Code 分頁、IDE 外掛）、Claude Desktop 與 claude.ai，以及 Claude 雲端 session。主 skill 見 `../SKILL.md`；只限 Claude 時，衝突以本檔為準。

## 內建記憶

- `CLAUDE.md` 與 `~/.claude` 下的本機記憶是這台電腦的檔案，不是 Mem0，不跨裝置，雲端 session 讀不到。不要當成外部記憶來源，也不要手改當正式寫入。
- claude.ai 帳號記憶（若開啟）由平台管理，不是 Mem0，我們沒有保證寫入的開關。
- 使用者說「請記住」：要讓其他客戶端也看得到，就寫外部後端，先說寫去哪。

## 後端

先判斷短、中、永久。所有 Claude 環境的記憶放同一處：

| 後端 | 何時用 | 範圍 |
|------|--------|------|
| Mem0 `私人記憶` | 短期私人事務 | 不帶 user；不設 `agent_id` |
| Mem0 `團隊記憶` | 短期全域 | 不帶 user、不帶 agent。排除不了帶身份的紀錄就先問 |
| Mem0 `團隊記憶` | 短期一般 | 一定帶 `user_id=claude`；所有 session 與環境共用；不設 `agent_id` |
| Agent 記憶庫 | 永久記憶的完整值 | 整理時 `scope=general`、`user_id=claude`、`agent_id` 留空 |
| Mem0（同上兩庫） | 永久記憶的索引 | `tier=long`，一句摘要＋Notion 指向；身份跟該筆原本的範圍 |
| Notion Memory | Notion 個人摘要，不是永久記憶 | `notion-memory-search`；先讀 `notion://docs/memory`。沒有工具就跳過 |

## 連線

- 工具走 plugin 內的 Composio MCP（`/mcp` 登入 `composio`），Notion 走 Notion connector。沒登入或沒接上時，先說哪條連線、什麼狀況，不要假裝查過。
- 雲端 session 要自己接上 Notion／Composio。本機登入狀態與家目錄的設定帶不過去。

## 何時讀

1. 有明確目的：回想、任務依賴對話外的舊偏好，或問到本人、公司、團隊的既有資訊。
2. 先 Mem0 語意搜一次；命中長期索引就到 Agent 記憶庫讀完整值。沒命中再用 Agent 記憶庫結構化過濾。
3. 不要每則訊息都搜尋。

## 何時寫

- 使用者說「請記住」或指定後端才寫。先說寫去哪一個後端。穩定身分事實或「永久記住」，確認後直接寫 Agent 記憶庫並在 Mem0 留索引。
- 寫入 Mem0 用 `infer=true`。這一則對話已有同一事實的 id 就更新，否則直接新增，不要先搜一輪去重。語意去重、加權與遺忘由排程 agent 的 `my-memory-consolidate` 做，對話中不做。使用者指定的改或刪，先顯示並取得同意。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要把 Claude 的記憶寫進 Grok Bot 的 `agent_id`。

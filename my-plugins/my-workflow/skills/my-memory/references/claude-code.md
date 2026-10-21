# ai-team 角色（Claude Code 專案）外部記憶存取規則

適用在 Claude Code 專案（Projects）裡**綁定了 ai-team 角色**的 thread：CEO 特助、研究員、私人助理等。沒綁角色的 Claude 照 [claude.md](claude.md)。主 skill 見 `../SKILL.md`；角色規則與這份衝突時，以 ai-team repo 根 `AGENTS.md` 為準（plugin 自己也這樣寫）。

## 為什麼另一份

ai-team 的 hook 會檢查每一次 Mem0／Notion 呼叫的帳號與身分，帶錯就拒絕（`E_TOOL_NOT_ALLOWED`），所以角色不能用 `user_id=claude`。身分對照表在 ai-team 的 `lib/config.json`（`mem0` 區），喚醒包也會印出來；這份只是讓 my-memory 知道有這個例外。

## 身份

| 角色 | Mem0 帳號（Composio 別名） | `user_id` | `agent_id` |
|------|----------------------------|-----------|------------|
| 特助、研究員與其他一般角色 | `團隊記憶` | `xiaoan` | `ai-team-<代號>`（例 `ai-team-chief-of-staff`） |
| 私人助理 | `私人記憶` | 不帶 | `ai-team-personal` |

- 跟 Grok Bot 同一個帳號、同一個 `user_id=xiaoan`，只有 `agent_id` 不同：角色搜得到 Grok Bot 寫的，Grok Bot 要看角色寫的得帶該角色的 `agent_id`。
- 私人助理「不帶 user」與主 skill 一致；`agent_id` 是 Mem0 寫入至少要一個 id 的最小配置，hook 也只放行這個。
- 永久記憶：Notion「Agent 記憶庫」。hook 只放行記憶庫、交接區、任務三個資料庫，不能封存。

## 何時讀

1. 喚醒時先查 Agent 記憶庫（`狀態=有效` 且 `AI 可用`，依自己的身份過濾），不夠再 Mem0 語意搜尋一次，帶自己的身份。
2. 讀取類呼叫沒帶身分時會搜到整個團隊記憶（含 Grok Bot 的）；要只看自己的就帶 `agent_id`。
3. 不要每則訊息都搜。

## 何時寫

- Ann 說「記住」才寫，先說寫去哪。例外：每日早報的「今日重點」每天都寫，第一筆固定是「<日期> 早報已發：…」（給隔天防重複用）。
- `MEM0_ADD_NEW_MEMORY_RECORDS`，一事一筆、繁體中文（台灣）。`infer=true` 會讓 Mem0 改寫成英文（2026-10-21 特助真機）；要保繁中原句用 `infer=false`，由 Ann 決定哪個當預設。
- 遺忘：只能刪本串搜過、`agent_id` 是自己的記錄；hook 會擋刪別人的。
- 不用 `ai-team memory add`（那是 repo 記憶，外部記憶角色跑了會回 `E_ENV`）。

## 禁止

- 密碼、token、金鑰、付款資料、完整對話、推測當事實。
- 不要用 `user_id=claude`、不要借 Grok Bot 的 agent UUID、不要按 session 另開 id。

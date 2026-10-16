# 記憶資料格式

讀寫 Mem0 或 Agent 記憶庫前先讀這份。欄位名、型別、選項都以此為準。沒列出來的欄位不要自創，選項不要自造。

判斷與去重見 [SKILL.md](../SKILL.md)、[backends.md](backends.md)。整理流程見 [`my-memory-consolidate`](../../my-memory-consolidate/SKILL.md)。

## Mem0 一筆記憶

讀到的物件用這些欄位：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | 文字 | 記憶 id。更新、刪除用這把 |
| `memory` | 文字 | 記憶正文 |
| `user_id` | 文字或沒有 | 沒有就當這筆不帶 user |
| `agent_id` | 文字或沒有 | 沒有就當這筆不帶 agent |
| `created_at` | 時間 | 存放起點。沒有就不做遺忘 |
| `metadata` | 物件 | 沒有或 `{}` 時，`weight` 當 `1`，`tier` 當 `short` |
| `categories` | 文字陣列 | 平台自己加的分類。不是權重，也不當層級 |

`metadata` 只使用這兩個鍵：

| 鍵 | 值 |
|----|----|
| `weight` | 整數。沒有、或舊值 `normal`，當 `1`。舊值 `high` 當 `3` |
| `tier` | `short` 或 `mid`。沒有就當 `short`。長期不留在 Mem0 |

舊的 `read_count` 不要再加。加權與遺忘的閥值見 [`my-memory-consolidate`](../../my-memory-consolidate/SKILL.md)。

新增若工具沒有 `metadata` 欄，先寫正文，再用該筆 `id` 更新 `metadata`。不要為了塞 metadata 另開一筆。

身份怎麼帶：

| 範圍 | `user_id` | `agent_id` |
|------|-----------|------------|
| 私人 | 不帶 | 不帶 |
| 全域 | 不帶 | 不帶 |
| 一般 Grok Bot | `xiaoan` | 該 bot 的 UUID |
| 一般 ChatGPT | `gpt` | 不帶 |
| 一般 Cursor | `cursor` | 不帶 |

工具拒絕空的 `user_id`／`agent_id` 時，停止並說明。不要改填別的 id 來冒充全域或私人。

## Agent 記憶庫（Notion）

- 頁面：<https://app.notion.com/p/74fc3fcecfc04102a62b75c314bcd132>
- Data source：`collection://b32ed069-fadc-4cf3-9c64-4a2e5a8255e7`

`建立時間`、`最後編輯` 由系統寫，不要填。

| 欄位 | 型別 | 寫入 |
|------|------|------|
| `記憶` | 標題 | 短標題 |
| `記憶鍵` | 文字 | 穩定語意鍵，如 `personal.communication` |
| `目前值` | 文字 | 合併後的一句事實 |
| `隔離鍵` | 文字 | 見下方格式 |
| `scope` | 選項 | `private`、`global`、`general`。舊值 `agent`、`conversation` 只用於辨認舊列 |
| `user_id` | 文字 | 與來源 Mem0 相同。私人、全域留空 |
| `agent_id` | 文字 | 與來源 Mem0 相同。沒有就留空 |
| `agent_name` | 文字 | 有 `agent_id` 才填顯示名 |
| `層級` | 選項 | 永久用 `profile`。另有 `log`、`note` |
| `狀態` | 選項 | `有效`、`待確認`、`已過時`、`封存`。新寫入用 `有效` |
| `AI 可用` | 核取方塊 | 允許 Agent 使用時勾選 |
| `來源` | 選項 | `使用者明示`、`使用者確認`、`人工匯入`、`AI 推定` |
| `優先級` | 選項 | `必須遵守`、`偏好`、`參考` |
| `敏感度` | 選項 | `一般`、`私人`、`敏感` |
| `類別` | 選項 | `回應偏好`、`技術偏好`、`設計偏好`、`工作背景`、`工具環境`、`專案偏好`、`決策原則`、`長期目標`、`其他` |
| `標籤` | 多選 | `WordPress`、`內容管理`、`工作流程`、`網站維運`、`工具環境`、`AI 協作`、`記憶管理`、`資料治理`、`Cloudflare`、`相容性`、`遷移`、`故障排除` |
| `關鍵字` | 文字 | 查詢用，可空 |
| `最後確認` | 日期 | 使用者確認當天，可空 |
| `Schema 版本` | 文字 | 沒有新規定就留空 |

隔離鍵用直線 `|` 接起來，空的身份留空段，不要寫成 `null` 或 `-`。

| 範圍 | 格式 | 例子 |
|------|------|------|
| 新列 | `scope\|user_id\|agent_id\|記憶鍵` | 全域 `global\|\|\|personal.communication`；Cursor `general\|cursor\|\|personal.communication`；Grok Bot `general\|xiaoan\|<uuid>\|editor.role` |
| 舊列 | `user_id\|agent_id\|記憶鍵` | 舊全域常見 `xiaoan\|\|personal.communication` |

去重先對新格式，沒有再對舊格式。對到就更新那一頁。

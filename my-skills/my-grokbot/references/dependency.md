# 依賴 my-workflow

依賴只有一個方向：`my-grokbot` → `my-workflow`。不把 `my-grokbot` 登記進 `my-workflow` 的索引、入口或元件表。

## 兩個閘門

| 閘門 | 通過條件 | 不夠的情況 |
|------|----------|------------|
| 安裝 | 私人 skill 庫同時列得出兩個 skill | 只裝其中一個，或用一個的安裝結果推測另一個 |
| Runtime | 同一回合明確引用 `/my-workflow` 與 `/my-grokbot`，而且看得到 `my-rules` | 只引用一個、只在庫裡看見、或 host 無法同時帶入兩邊 |

Runtime 模式名稱是 `explicit-pair`。沒有自動模式。host 即使好像會帶入另一個 skill，仍要使用者在同一回合明確引用兩個。

本 skill 只檢查目前上下文有沒有 `my-workflow` 的規則證據。不查詢 skill 庫，不以程式呼叫另一個 skill，也不因版本號字串自行判斷相容。

## 網址

相容性基準是已核對的 `1.5.0`。不在 frontmatter 自創依賴欄位或版本解析器。

- `my-workflow`：https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-workflow
- `my-grokbot`：https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-grokbot

更新其中一個，不代表另一個已更新。

## 缺少依賴時

停止 Grok Bot 專用流程，回覆：

```text
本回合缺少 my-workflow，已停止 my-grokbot 專用流程。
請先安裝或更新：
https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-workflow
再安裝或更新：
https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-grokbot
然後在同一回合明確引用 /my-workflow 與 /my-grokbot。
只安裝、或只引用 /my-grokbot，都不算已載入。
```

通過閘門後才沿用 `my-rules`。有外部記憶目的時才委派 `my-memory`。版本或能力無法確認時，標成「行為契約，runtime 未確認」，不複製規則來頂替。

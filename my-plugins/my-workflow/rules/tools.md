# 工具與失敗回報規則

使用外部服務、App 或 MCP 前讀。

- 先看 Composio MCP 有沒有對應工具，有就用。沒有、沒接上或呼叫失敗，先說 Composio 這步的結果，再改用該服務自己的 MCP 或其他已接上的工具。本機檔案、Git、專案腳本不走 Composio。

## 連不上不可靜默

工具沒接上、要授權、授權過期或呼叫報錯，**一律明講**，不可靜默：不吞掉錯誤、不假裝完成、不當作「查無資料」、不默默略過那一步、不默默改走別的後端。

回報包含：

- 哪個 skill、哪個工具或連線（如 Composio 的 Notion、`composio` MCP 本身）。
- 狀態：沒接上、需要授權、授權過期要重新登入，或呼叫報錯（附錯誤摘要，不貼 token、金鑰或含憑證的錯誤全文）。
- 授權方式：能拿到授權連結就給連結，拿不到就說去哪裡授權（見下節）。
- 影響：哪一步沒做；能做的繼續做。改走備用工具前先說原本那條失敗。

必要連線失敗就停在那一步，等使用者授權或決定；非必要的輔助連線（記憶、Linear）失敗就警告後繼續。

## 讓使用者授權

| 情況 | 做法 |
|------|------|
| Composio 裡某個服務沒接上或過期 | 用 `COMPOSIO_MANAGE_CONNECTIONS` 發起連線，把回傳的授權連結給使用者點；再用 `COMPOSIO_WAIT_FOR_CONNECTIONS` 等完成，完成後接著做原本那一步。工具名以當下連上的為準 |
| `composio` MCP 本身沒接上或要登入 | agent 無法替使用者開 OAuth。Claude Code：請使用者在互動終端機執行 `/mcp`，選 `composio` 登入；claude.ai 網頁、Desktop 聊天、Cowork：到 [Customize > Plugins](https://claude.ai/customize/plugins) 開 my-workflow 的 **Connectors** 分頁連上 `composio` |
| 其他 MCP 回傳授權連結 | 原樣給使用者點，等使用者說完成再重試 |
| 其他 MCP 沒有連結 | 說明要到哪個客戶端設定授權；不知道就說不知道，不猜網址 |

- 授權連結只用工具回傳的或官方設定頁，不自己拼網址。
- 不要求使用者貼 token、授權碼或 callback URL；不把個資或憑證放進網址參數。
- 使用者授權後先重試一次確認接上，再回報繼續。

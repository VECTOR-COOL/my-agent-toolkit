# my-grokbot

獨立 skill。用來建立、設定與稽核個別 Grok Bot。不在 `my-workflow` 套件裡，也不會自動安裝或更新它。

來源網址：

https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-grokbot

必要依賴：

https://github.com/VECTOR-COOL/my-agent-toolkit/tree/main/my-skills/my-workflow

相容性基準是已核對的 `1.5.0`。官方文件沒有 skill 之間的自動依賴。兩個 skill 都出現在私人 skill 庫，不等於這回合已經串接。沒有實機證據就標成「行為契約，runtime 未確認」。

安裝本 skill 不會替任何 Bot 建立人格、記憶或 Routine。`references/soul.md` 只是設計規則。

## 安裝順序

1. 安裝或更新獨立的 `my-workflow`。
2. 另行安裝或更新獨立的 `my-grokbot`。
3. 確認私人 skill 庫同時列出兩者。
4. 在同一回合明確引用 `/my-workflow` 與 `/my-grokbot`，做安全的唯讀檢查。

已安裝不等於本回合已載入。只引用 `/my-grokbot` 時，專用流程應停止並要求雙引用。

## 個別 Profile

每個 Bot 分開做：

1. 選定該 Bot 的 UUID。顯示名稱不能當隔離鍵。
2. 用 [templates/bot-profile.template.md](templates/bot-profile.template.md) 寫這個 Bot 的人格。
3. 出示 Profile diff。
4. 使用者確認後，才手動更新該 Bot 的 Description。
5. 開這個 Bot 的新 chat，檢查名稱、職責、語氣與邊界。

不套用到其他 Bot。沒有帳號端操作證據就標未驗證。

## 個別記憶

- Native memory 永遠屬於該 Bot。
- External memory 要逐 Bot 啟用，並確認 UUID、scope 與 primary owner。
- 未啟用時不呼叫 Mem0 或 Notion。
- 同一事實只寫一個 owner。不把本地記憶與 Mem0 當成必須一起寫。

## 個別 Routine

先用安全範例完成一次一次性任務，再決定 owner、時區、輸入、輸出、無資料政策與核准邊界。

Routine 測試會做真實工作。使用安全輸入。寄信、發文、刪除與正式環境變更都停在核准前。

沒有資料時報告缺資料，不用舊資料充數。

## 共用電腦

Bot 之間共享同一台電腦與 connector，這不是安全隔離。秘密不放 Profile、skill、memory 或分享模板。

## 匯出到 Cursor

只把這個目錄匯到目標專案的 `.cursor/skills/my-grokbot/`。預設不覆寫。

```text
node my-skills/my-grokbot/scripts/export-cursor-skill.mjs <目標專案> --dry-run
node my-skills/my-grokbot/scripts/export-cursor-skill.mjs <目標專案>
node my-skills/my-grokbot/scripts/export-cursor-skill.mjs <目標專案> --force
```

`--force` 只刪除已再次驗證的那個目的地。不使用 `my-workflow` 的匯出腳本來產生本 skill。

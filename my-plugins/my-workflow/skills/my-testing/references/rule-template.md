# Agent 測試規則模板

放在目標專案 **`.agents/rules/testing.md`**。規則本文只在這裡；`CLAUDE.md` 用 `@` 匯入、`AGENTS.md` 登記，不重複內容。

## 引用方式

`CLAUDE.md`：

```markdown
@AGENTS.md
@.agents/rules/testing.md
```

`AGENTS.md`「目錄架構」與「規範」登記：

```markdown
.agents/rules/    Agent 行為規則（testing.md）；CLAUDE.md 以 @ 匯入
```

多規則目錄並存（例如舊的 `.agent/rules/`）時，兩處都在 `CLAUDE.md` 匯入，並在回報中請使用者決定是否統一。

## 規則本文

```markdown
# 測試規則

給所有 AI agent 的測試行為規則。測試「必須是什麼」在 [`docs/specs/testing-plan-spec.md`](../../docs/specs/testing-plan-spec.md)；這裡只寫 agent 該怎麼做，衝突時以 SPEC 為準。

## 1. 四層，各有位置

| 層 | 位置 | 一句話 |
|----|------|--------|
| Unit | `tests/Unit/` | 純邏輯，不連 DB／HTTP |
| Smoke | `tests/Smoke/` | 唯讀快檢，系統活著嗎 |
| Scenario（整合） | `tests/Scenario/` | 模組＋DB＋HTTP 的資料流程 |
| E2E | `tests/e2e/tests/` | 真實瀏覽器的使用者流程 |

## 2. 工作循環（Must）

1. TDD：先寫失敗的測試，再最小修補到綠。
2. 改完先跑命中的層；動到啟動流程、路由、設定載入 → 再加煙測。
3. 失敗就修到綠；**未測、未綠不得宣稱完成**。
4. 開測前確認伺服器已啟動。

## 3. 寫測試的規則

- 斷言行為，不斷言現狀；疑似 bug 登記 `tests/known-debt.md`，不寫成預期。
- 頁面檢查含「無 Fatal／Parse error／Uncaught」。
- 資料用固定前綴並於 tearDown 清理；Smoke 與 Unit 不寫資料。
- 固定輸入：不依賴現在時間、亂數、執行順序。
- 測試碼不用專案鎖定版本之外的語法。

## 4. 失敗時

| 情況 | 做法 |
|------|------|
| 自己的程式造成 | 修程式，不是改測試 |
| 測試本身寫錯 | 修測試，說明原斷言為何錯 |
| 既有真缺陷 | 保持紅燈，登記「阻斷項」，回報 |
| 缺陷在核心或第三方 | 先停手回報 |
| 缺憑證／缺依賴 | 該層 skip 並明說，不用假資料硬過 |

**禁止**：降低斷言、刪測試、把失敗改 skip、改 DB schema、提交帳密。

## 5. 回報

實跑指令、各層通過／失敗／略過數、失敗原因、沒跑的與原因。
```

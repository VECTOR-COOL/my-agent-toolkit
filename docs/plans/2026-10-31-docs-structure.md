# 定義：docs/ 檔案架構

日期：`2026-10-31` · 狀態：**已採用，`1.16.0` 落地** · 落地位置：[`my-docs`](../../my-plugins/my-workflow/skills/my-docs/SKILL.md) 的「docs/ 結構」一節（plugin 內唯一完整定義）

## 背景

[codebase 結構計畫](2026-10-31-init-codebase-structure.md)定了「根目錄只留入口，文件全放 `docs/`」，但 `docs/` 裡面怎麼放沒有定義：

- `my-codebase-init` 只列了 `NOTE.md`、`adr/`、`plans/`、`RELEASE_SPEC.md`。
- `my-docs` 定義了 Spec、Guide、ADR 的內文結構和 `docs/archived/`，但沒說放哪、怎麼命名。

目標和上一份一樣：**通用、接地氣**，用大家早就在用的名字，任何 agent 或工程師一看就懂。

## 結構

```text
docs/
├─ NOTE.md            交接紀錄（唯一一定有的檔）
├─ README.md          文件索引（超過約 5 份文件才建）
├─ specs/             技術規格、PRD     <主題>.md、prd-<主題>.md
├─ guides/            操作指南、SOP     <主題>.md
├─ adr/               架構決策          NNNN-<主題>.md（0001 起，不改號）
├─ plans/             計畫              YYYY-MM-DD-<主題>.md
├─ diagrams/          獨立圖檔          <主題>.mmd 等
├─ archived/          廢棄文件          保留原檔名
└─ RELEASE_SPEC.md    發佈規格（僅打包部署）
```

## 對照表

| 文件 | 位置 | 檔名 | 誰建 |
|------|------|------|------|
| 交接紀錄 | `docs/NOTE.md` | 固定 | `my-codebase-init` |
| 技術規格（Spec） | `docs/specs/` | `<主題>.md` | `my-docs` |
| 產品需求（PRD） | `docs/specs/` | `prd-<主題>.md` | `my-create-prd` |
| 操作指南、SOP | `docs/guides/` | `<主題>.md` | `my-docs` |
| 架構決策（ADR） | `docs/adr/` | `0001-<主題>.md` | `my-docs` |
| 計畫 | `docs/plans/` | `2026-10-31-<主題>.md` | `my-docs` |
| 獨立圖檔 | `docs/diagrams/` | `<主題>.mmd` | `my-docs` |
| 發佈規格 | `docs/RELEASE_SPEC.md` | 固定 | `my-release-packaging` |
| 介面設計 | 根目錄 `DESIGN.md` | 固定 | `my-ui-ux`（設計工具慣例放根目錄，照放） |

## 誰治理

**`docs/` 整個由 [`my-docs`](../../my-plugins/my-workflow/skills/my-docs/SKILL.md) 治理**：位置、命名、生命週期、索引都以它為準，其他 skill 只能照放，不另訂。

- `my-docs` 自己建：`specs/`、`guides/`、`adr/`、`plans/`、`diagrams/`、`archived/`、`README.md` 索引。
- 內容結構歸別的 skill、位置歸 `my-docs`：`NOTE.md`（`my-codebase-init`）、`specs/prd-*.md`（`my-create-prd`）、`RELEASE_SPEC.md`（`my-release-packaging`）。
- 計畫補了固定結構（日期、狀態、對象 → 背景 → 方案 → 規則 → 待決定），寫在 `my-docs` 的「計畫 (Plan)」。

## 規則

1. **有才建**：子目錄有第一份文件時才建，不建空目錄。
2. **一份文件一個主題**；檔名英文小寫、用 `-` 連接。例外：`NOTE.md`、`README.md`、`RELEASE_SPEC.md`。
3. **內文結構照 `my-docs`**（Spec、Guide、ADR、Plan 各自的段落）；這份只管位置與命名。
4. **圖**：文件內的 mermaid 直接寫在文件裡；只有獨立維護的圖檔才放 `diagrams/`。
5. **生命週期**：
   - 計畫做完把狀態改「已完成」，留在 `plans/`，當作歷史。
   - ADR 不刪、不改號；被取代就把狀態改「已取代」，連到新的那份。
   - 其他過時文件移到 `archived/`，開頭註明歸檔日期與取代者，並修好所有連結。
6. **已有專案**：沿用既有的 `docs/` 子目錄名（例如舊專案的 `docs/design/`），寫進 `AGENTS.md` 的目錄架構即可，不強制搬。
7. 文件不放密碼、token、本機絕對路徑。

## 為什麼這樣定

- `specs/`、`guides/`、`adr/` 是開源專案最常見的名字，不用解釋。
- 計畫用日期開頭，檔案自然照時間排序；ADR 用流水號，因為會被其他文件引用，號碼不能變。
- `RELEASE_SPEC.md` 不搬進 `specs/`：已被 `my-release-packaging` 和既有專案大量引用，搬了只增加轉換成本。

## 待決定

- [x] 確認這份定義（2026-10-31 使用者確認），與 codebase 結構一起在 `1.16.0` 落地，`docs/` 由 `my-docs` 治理。

# <專案名稱> — Agent 指引

給所有 AI 編輯器與 agent 讀的專案入口（Claude Code、Codex、Cursor、Copilot 等通用）。簡短、具體、可驗證；超過約 200 行就拆到 `docs/`。

## 接手三步

1. 讀 [`NOTE.md`](NOTE.md)：目前狀態、進行中、下一步、待確認。
2. 讀 [`README.md`](README.md)：定位、技術棧、快速啟動。
3. 看 [`.agents/skills/`](.agents/skills/)：專案專屬的做法，對上情境才讀。

做完一段工作、或要交接時，**更新 `NOTE.md`**。

## 專案

<一兩句：這個專案做什麼、給誰用>

## 指令

| 用途 | 指令 |
|------|------|
| 安裝依賴 | `<指令>` |
| 啟動開發 | `<指令>` |
| 測試 | `<指令>` |
| Lint | `<指令>` |
| Build | `<指令>` |

改完程式先跑測試與 lint，通過才算完成。

## 目錄架構

```text
<目錄>/   <用途>
```

## 發佈（若有）

<只有「打包部署」的專案保留；否則刪除這節>

- 唯一產出指令：`node scripts/pack-release.mjs`（完整包）、`--since <上次部署 tag>`（更新檔）
- 規格與部署 SOP：`docs/RELEASE_SPEC.md`；`dist/` 不進版控，禁止手動全目錄壓縮
- 每次部署後打 tag，作為下次更新檔的基準

## 規範

- <程式風格、命名、分支與 commit 規則>
- 分支：`main` 穩定、`develop` 日常開發；合併進 `main` 用 `--no-ff`；不 force push 保護分支。
- commit 用 Conventional Commits。

## 禁止事項

- 不提交 secrets（`.env`、金鑰、token）。
- <專案特有禁止事項>

## 各 agent 平台備註

`AGENTS.md` 是唯一來源。各平台入口只引用本檔，不重複內容：Claude Code 用 `CLAUDE.md`（第一行 `@AGENTS.md`）；Cursor 原生讀本檔；只對單一平台有意義的設定才寫在這裡。

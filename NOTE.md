# NOTE — 交接紀錄

給下一位接手的人或 agent。**先讀這份再動手；做完一段工作或交接時更新。** 保持精簡，過時的刪掉，不記密碼、token、金鑰。

最後更新：`2026-10-31` · 版本：`v1.16.0` · 分支：`develop`

## 目前狀態

- plugin `my-workflow` 最新是 `1.16.0`（`develop`）；`main` 目前是 `1.15.3`，`develop` 領先（1.15.4、1.15.8、1.16.0）。
- `1.16.0`：init 採用「B + 生態慣例優先」——根目錄只留入口與生態規定的檔，新專案交接紀錄在 `docs/NOTE.md`、打包設定在 `scripts/release.config.json`（腳本先讀同目錄，其次根目錄）；`my-docs` 新增「docs/ 結構」。
- 結構穩定：`my-plugins/`（plugin）、`my-skills/`（獨立 skill，含 `claude/` 分類）、`skills/`（第三方）。
- 發布流程與更新排除已文件化：`my-plugins/my-workflow/docs/RELEASE.md`，並有 `check-release.mjs` 檢查。

## 進行中

- [ ] [docs 檔案架構定義](docs/plans/2026-10-31-docs-structure.md)：已寫進 `my-docs`，**待使用者確認**。
- [ ] 把 `develop`（到 `1.16.0`）合併到 `main`。

## 下一步

1. 使用者同意後合併 `1.16.0` 到 `main`，跑 `check-release.mjs --remote` 確認。
2. 使用者帳號的 plugin 同步目前停在舊版（`1.12.2`）；需使用者在 claude.ai 外掛頁移除後重新加入，並開 Sync automatically。
3. 使用者本機 Claude Code CLI 太舊（`claude plugin` 沒有 `marketplace`、`update`）；需 `claude update` 或重裝。

## 已決定

- skill 一律平鋪；Claude 專屬的 skill 放 `my-skills/claude/`，不隨 plugin 安裝。
- `my-skills/` 內每個 skill 獨立，不互相連結；`skills/` 只放第三方、不改內容。
- plugin 不做 Cursor 相容層；Claude 是第一個支援的客戶端（記憶 `user_id=claude`）。
- `.agents/skills/` 是跨編輯器的專案 skill 位置；此 repo 目前沒有專屬 skill，所以沒建。
- 版本以 `my-plugins/my-workflow/pack.yaml` 為基準，8 處同號。

## 待確認／阻礙

- docs/ 檔案架構定義（`specs/`、`guides/`、`adr/`、`plans/`、`diagrams/`、`archived/`）是否確認。
- 本 repo 自己的根目錄 `NOTE.md` 還沒照新結構搬到 `docs/`（要搬需同步改 `AGENTS.md`、`CLAUDE.md` 引用），待使用者決定。
- `user_id=claude` 是沿用 `gpt`、`cursor` 的命名自訂的，需使用者確認；舊的 `user_id=cursor` 記憶不會自動轉移。
- 帳號端為何沒自動同步新版：Sync automatically 是否開啟、私有 repo 授權是否有效。
- `my-release-packaging` 沒在使用者的 PHP 專案實跑過；使用者 Windows 的 Git 版本是否支援 `--add-virtual-file` 未確認。
- Windows／Codex／Desktop 聊天 的實機行為多為「未驗證」。

## 怎麼驗證

```bash
node my-plugins/my-workflow/scripts/check-release.mjs --remote
node --test my-plugins/my-workflow/skills/my-release-packaging/scripts/pack-release.test.mjs
```

## 更新紀錄

- `2026-10-31` Claude：`1.16.0` 落地 init codebase 結構（B + 生態慣例優先）與 docs/ 結構定義；實測新專案、舊格式搬家、打包排除三項通過。
- `2026-10-31` Claude：記錄 init codebase 結構討論到 `docs/plans/`。
- `2026-10-30` Claude：補齊根目錄 `AGENTS.md`、`CLAUDE.md`、`NOTE.md`；README 版本移到標題正下方。

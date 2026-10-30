# my-agent-toolkit — Agent 指引

給所有 AI 編輯器與 agent 讀的專案入口（Claude Code、Codex、Cursor、Copilot 等通用）。簡短、具體、可驗證。

## 接手三步

1. 讀 [`NOTE.md`](NOTE.md)：目前狀態、進行中、下一步、待確認。
2. 讀 [`README.md`](README.md)：定位與目錄。
3. 動手前 `git pull`：這個 repo 可能有多個 agent session 同時在改，先同步再改。

做完一段工作、或要交接時，**更新 `NOTE.md`**。

## 專案

VECTOR LTD 的 Agent Skills 套件庫，**不是應用程式**：沒有 runtime、package manager 或 build pipeline。內容是 skill、規則、plugin 與其維護腳本。最主要的產出是 plugin `my-workflow`，使用者從 `main` 分支安裝。

## 目錄分工

| 目錄 | 是什麼 | 規則 |
|------|--------|------|
| [`my-plugins/`](my-plugins/) | 打包成 plugin 的 skill 與規則（Claude Code 與 Codex） | 開發準則見 [`my-plugins/my-workflow/AGENTS.md`](my-plugins/my-workflow/AGENTS.md) |
| [`my-skills/`](my-skills/) | 自建、**各自獨立**的 skill，分類目錄只用來區隔 | 見 [`my-skills/AGENTS.md`](my-skills/AGENTS.md)；skill 之間不互相連結 |
| [`skills/`](skills/) | **第三方** skill，只從上游同步 | **不改內容**，見 [`skills/AGENTS.md`](skills/AGENTS.md) |
| `.claude-plugin/`、`.agents/plugins/` | Claude Code 與 Codex 的 marketplace 定義 | 新增 plugin 要在兩處登記 |
| [`docs/`](docs/) | 圖表等文件 | |
| `project.json` | 專案版本（與 plugin 同號） | 升版見下 |

## 指令

| 用途 | 指令 |
|------|------|
| 發布前檢查（版本一致、被 ignore 的檔、validate） | `node my-plugins/my-workflow/scripts/check-release.mjs` |
| 同上並確認 `main` 版本 | `node my-plugins/my-workflow/scripts/check-release.mjs --remote` |
| 驗證 plugin 與 marketplace | `claude plugin validate ./my-plugins/my-workflow`、`claude plugin validate .` |
| 打包腳本測試 | `node --test my-plugins/my-workflow/skills/my-release-packaging/scripts/pack-release.test.mjs` |

改完先跑檢查，通過才 commit。

## 規範

- **分支**：`develop` 日常開發，`main` 是對外發布版。使用者安裝與更新一律抓 `main`，只推 `develop` 等於沒發布。
- 合併進 `main` 用 `--no-ff`（或 PR 合併提交）。禁止 force push `main`、`develop`、`release/*`。
- commit 用 Conventional Commits：`type(scope): subject`，祈使句、不超過 50 字元。
- **改 plugin 內容一定要升版**，8 處同號（清單與流程見 [`my-plugins/my-workflow/docs/RELEASE.md`](my-plugins/my-workflow/docs/RELEASE.md)），否則各平台判斷不到新版。
- skill 一律平鋪成 `<目錄>/<skill 名>/SKILL.md`，`name` 與資料夾名一致。Claude Code 不認巢狀的 skill 目錄。
- 文件用繁體中文，簡短白話；流程圖用 mermaid 的 `graph TD`／`LR`／`TB`。
- 腳本用 `.mjs`，要有 `--help`、非零失敗碼，預設不覆寫既有檔；不新寫 PowerShell 或 Python。

## 發布

照 [`my-plugins/my-workflow/docs/RELEASE.md`](my-plugins/my-workflow/docs/RELEASE.md)：升版 → `check-release.mjs` 通過 → push `develop` → 合併 `main` → `--remote` 確認 → 乾淨環境實裝驗證。使用者說看不到新版、更新按鈕反灰、`unknown command` 時，照該文件的「無法更新怎麼排除」。

## 禁止事項

- 不改 `skills/`（第三方）的內容。
- 不提交 secrets（`.env`、金鑰、token）。
- 不新增被 `.gitignore` 擋住的檔案卻沒加 `!` 例外（本機正常、使用者卻缺檔）；`AGENTS.md` 一律會被忽略，新的要加例外。
- 沒實測就不要說「已驗證」；沒在實際平台跑過的功能要標「未驗證」。

## 各 agent 平台備註

- **Claude Code**：`CLAUDE.md` 引用本檔。此 repo 的 plugin 本身也是給 Claude 用的，改規則或 skill 時以 Claude 能理解為第一優先。
- **雲端 session**：不載入 plugin 與 marketplace；規則以本檔與 `CLAUDE.md` 為準。

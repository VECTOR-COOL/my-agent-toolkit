# my-agent-toolkit — 目錄導覽

這個 repo 是 Agent Skills 與 plugin 的**集合**，不是單一專案：**每個 plugin 是自己的專案**，入口、規範、交接紀錄都在它自己的目錄裡。根目錄只放索引與 marketplace 定義，沒有 runtime、package manager 或 build。

進到哪個目錄做事，就讀那個目錄的 `AGENTS.md`；根目錄這份只告訴你去哪裡。

## 目錄用途

| 目錄 | 是什麼 | 入口 |
|------|--------|------|
| [`my-plugins/`](my-plugins/) | 打包成 plugin 的 skill 與規則（Claude Code、Codex）。每個子目錄一個 plugin，各自是獨立專案 | 各 plugin 自己的 `AGENTS.md`，例如 [`my-plugins/my-workflow/AGENTS.md`](my-plugins/my-workflow/AGENTS.md) |
| [`my-skills/`](my-skills/) | 自建、**各自獨立**的 skill；分類子目錄只用來區隔，不是 skill | [`my-skills/AGENTS.md`](my-skills/AGENTS.md) |
| [`skills/`](skills/) | **第三方** skill，只從上游同步，**不改內容** | [`skills/AGENTS.md`](skills/AGENTS.md) |
| `.claude-plugin/` | Claude Code 的 marketplace 定義 | 新增 plugin 要在這裡登記 |
| `.agents/plugins/` | Codex 的 marketplace 定義 | 同上，兩處都要 |
| `project.json` | 整庫版本，與 `my-workflow` plugin 同號 | 升版流程見 [`my-plugins/my-workflow/docs/RELEASE.md`](my-plugins/my-workflow/docs/RELEASE.md) |
| [`README.md`](README.md) | 給人看的整庫索引與**安裝說明** | — |

## 安裝（給使用者）

詳細步驟在 [`README.md`](README.md) 的「安裝」；agent 代為安裝時載入 plugin 的 skill `my-plugin-install`，它依平台選方法。

| 平台 | 方式 |
|------|------|
| Claude Code／Desktop／IDE | `/plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit`，再 `/plugin install my-workflow@my-agent-toolkit` |
| claude.ai 網頁／Desktop 聊天／Cowork／雲端 session | [Customize > Plugins](https://claude.ai/customize/plugins) 加入 marketplace，開 **Sync automatically** |
| Codex | `.codex/config.toml` 啟用 `my-workflow@my-agent-toolkit`（未驗證） |
| Gemini CLI | clone 後 `gemini extensions install ./my-plugins/my-workflow`（未驗證） |
| ChatGPT／Gemini 網頁 | 貼 `global.md`、上傳 skill（未驗證） |

## 跨平台原則

- **一份內容、多份薄定義檔**：內容只在 `my-plugins/<plugin>/` 維護；Claude（`.claude-plugin/`）、Codex（`.agents/plugins/`）、Gemini（plugin 內 `gemini-extension.json`）只指到它，不複製。
- **雲端不依賴本機腳本**：網頁、Cowork、雲端 session、ChatGPT、Gemini 網頁不執行 hook。規則與 skill 必須放在 skill 資料夾內，讀得到就能用；hook／腳本只能是有 hook 平台的加強，不能是唯一管道。
- **market 自動更新**：manifest 不寫 `version`（Claude 以 commit 當版本），`main` 更新即被偵測；使用者在 marketplace 開自動更新。
- 沒實機跑過的平台一律標「未驗證」。

## 共通約定

- 根目錄不新增專案檔（`NOTE.md`、`docs/`、`scripts/`、設定檔）；要加就加在對應 plugin 或 skill 目錄內。
- 這個 repo 常有多個 session 同時改：動手前 `git pull`，commit 前 `git status` 確認沒覆蓋別人的變更。
- `develop` 日常開發，`main` 對外發布，使用者的安裝與自動更新都抓 `main`；合併進 `main` 用 `--no-ff`，禁止 force push。
- commit 用 Conventional Commits：`type(scope): subject`，scope 寫 plugin 或 skill 名。
- 不提交 secrets；不改 `skills/`。

# my-skills — 開發準則

自建的**獨立 skill** 庫。給開發與維護這些 skill 的人與 Agent 看。

## 定位

| 目錄 | 是什麼 | 怎麼用 |
|------|--------|--------|
| `my-skills/`（本目錄） | 自建、**每個都獨立**的 skill | 單獨挑選、複製或安裝 |
| [`../skills/`](../skills/) | **第三方** skill，只從上游同步 | 不改內容；組織專屬內容放這裡，不放那裡 |
| [`../my-plugins/`](../my-plugins/) | 打包成 plugin 的 skill 與規則 | 隨 plugin 一起安裝，彼此可互相引用 |

## 結構

```text
my-skills/<分類>/<skill 名>/
  SKILL.md        必要，入口
  references/     選用，按需讀的參考
  templates/      選用，範本
  scripts/        選用，腳本
  agents/         選用，Codex 等平台的介面描述（openai.yaml）
```

- **分類目錄只用來區隔類型、功能或平台**，本身不是 skill，不放 `SKILL.md`。
- 每個 skill 自成一體：只引用自己資料夾內的檔案。不連到其他 skill、`my-plugins/` 或 `skills/` 的路徑；需要提到別的 skill 就寫名稱，不寫相對連結。
- 資料夾名與 `SKILL.md` 的 `name` 一致。

## 分類

| 分類 | 用途 | Skills |
|------|------|--------|
| `backend/` | 後端與 API | `wordpress-rest-api-admin-development`、`wordpress-rest-api-development` |
| `claude/` | Claude 平台專屬 | `my-claude-codebase-convert`、`my-codebase-init-claude` |
| `develop/` | 外掛、主題等開發 | `wordpress-plugin-theme-development` |
| `frontend/` | 前端 | `frontend-development`、`frontend-wordpress-headless-project`、`headpress-frontend-dev` |
| `lovable/` | Lovable 平台專屬 | `lovable-legacy-to-ssr-migration` |
| `workflow/` | 通用工作流工具 | `my-agent-plugin-creator`、`my-clean-windows-storage` |

新分類只在現有分類都不合適時才建，名稱用小寫英文。

## 新增或修改 skill

1. 選分類，建立 `<分類>/<skill 名>/SKILL.md`。
2. `description` 寫清楚做什麼、**何時用**（使用者會說的詞），這是 agent 判斷要不要載入的依據。
3. `SKILL.md` 保持精簡，細節放 `references/`，在 `SKILL.md` 寫明何時讀。
4. 不寫死個人路徑、帳號 ID、金鑰；需要的設定用環境變數或請使用者提供。
5. 文件用繁體中文；流程圖用 mermaid 的 `graph TD`／`LR`／`TB`。
6. 更新本檔的分類表與根 [`README.md`](../README.md)。

## 安裝（以 Claude Code 為例）

把整個 skill 資料夾複製到：

- 專案：`.claude/skills/<skill 名>/`（隨 repo commit，雲端 session 也帶得到）
- 個人：`~/.claude/skills/<skill 名>/`（本機所有專案可用）

其他平台放到該平台的 skill 目錄。只複製單一 skill 資料夾，不複製分類目錄。

## 驗證

- 每個 `SKILL.md` 的 `name` 與資料夾名一致。
- `SKILL.md` 與 `references/` 內的相對連結都存在，而且不跑出該 skill 資料夾。
- 單獨複製到乾淨環境也能用，不依賴其他 skill 或 plugin。

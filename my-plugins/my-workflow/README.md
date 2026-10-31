# my-workflow

VECTOR LTD 私人工作流 plugin：常駐規則 + 14 個按需載入的 skills + Composio MCP。版本 `1.16.0`（[`pack.yaml`](pack.yaml)）。不上架公開市集。開發見 [`AGENTS.md`](AGENTS.md)。

**名詞**：本目錄是 **plugin 本體**；`my-agent-toolkit` 是放它的私有 repo，也是 marketplace 名稱。安裝 id：`my-workflow@my-agent-toolkit`。

## 支援

一份內容，各平台一份薄定義檔指到它。**規則不靠本機腳本**：入口 skill 自帶 [`global.md`](skills/my-workflow/references/global.md)，有 hook 的平台開對話注入，沒有的載入入口 skill 時自己讀。

| 環境 | 做法 | 規則 | 狀態 |
|------|------|------|------|
| Claude Code／Desktop Code 分頁／IDE | plugin（marketplace） | hook 注入 | 雲端 Claude Code 已實測（加入、安裝、validate、注入）；Desktop 操作、Composio OAuth **未驗證** |
| 雲端 Claude session | plugin（帳號同步） | hook 注入 | 同上 |
| claude.ai 網頁／Desktop 聊天／Cowork | plugin（Customize → Plugins） | 入口 skill 讀 `global.md` | skills、MCP 有；規則路徑**未驗證** |
| Codex | plugin（`.agents/plugins/marketplace.json`） | hook 注入 | **未驗證**（載入、hook 信任、`dcr` 登入、hook 輸出格式） |
| Gemini CLI | extension（`gemini-extension.json`、`GEMINI.md`） | `GEMINI.md` 指到 `global.md` | **未驗證** |
| ChatGPT／Gemini 網頁 | 手動貼 `global.md`、上傳 skill | 貼在指示 | 無 plugin、無 MCP；**未驗證** |

## 安裝

來源：[VECTOR-COOL/my-agent-toolkit](https://github.com/VECTOR-COOL/my-agent-toolkit)（私有，`main`）。要能讀該 repo（本機 `gh auth login` 或 SSH；網頁版連結 GitHub 並授權 Claude GitHub App）。也可對 agent 說「安裝 my-workflow」，會載入 [`my-plugin-install`](skills/my-plugin-install/SKILL.md)。

**Claude Code／Desktop Code 分頁**

```text
/plugin marketplace add https://github.com/VECTOR-COOL/my-agent-toolkit
/plugin install my-workflow@my-agent-toolkit
```

重開後 `/mcp` 登入 `composio`。`/plugin` → Marketplaces → `my-agent-toolkit` 開 **auto-update**。

**claude.ai 網頁／Desktop 聊天／Cowork**（不需終端機）

1. [Customize > Plugins](https://claude.ai/customize/plugins) → **Add → Add marketplace**，輸入 `VECTOR-COOL/my-agent-toolkit`。
2. 出現 **Connect GitHub**／**Install the Claude GitHub App** 就授權它讀這個 repo。
3. **Discover** 找 `my-workflow` → **Add**；開 **Sync automatically**。
4. plugin 的 **Connectors** 登入 `composio`。

規則沒生效就把 [`global.md`](skills/my-workflow/references/global.md) 貼到個人偏好。

**Codex**：專案 `.codex/config.toml` 加 `[plugins."my-workflow@my-agent-toolkit"]` `enabled = true`；marketplace 在 [`.agents/plugins/marketplace.json`](../../.agents/plugins/marketplace.json)。會要求信任 hooks。**未驗證**。

**Gemini CLI**：clone 後 `gemini extensions install ./my-plugins/my-workflow`。repo 根是多 plugin marketplace，不支援 URL 直裝。更新：`git pull` 後重新 install。**未驗證**。

**ChatGPT／Gemini 網頁**：把 `global.md` 貼到 Custom GPT／專案指示或 Gem 指示；需要的 skill 資料夾上傳（先 `my-workflow`）。更新就重貼、重傳。**未驗證**。

## 更新

manifest **不寫 `version`**，Claude 以 commit 當版本，`main` 每次更新都偵測得到。

| 環境 | 做法 |
|------|------|
| Claude Code | 開 **auto-update**；手動 `claude plugin marketplace update my-agent-toolkit` → `claude plugin update my-workflow@my-agent-toolkit` → 重開 |
| claude.ai／Cowork／雲端 session | 開 **Sync automatically**；手動 **Check for updates**，開新對話生效 |
| Codex | 更新 repo 後重新啟用，hooks 有變要重新信任 |
| Gemini CLI | `git pull` 後重新 install |
| ChatGPT／Gemini 網頁 | 重貼、重傳 |

更新不到：[`docs/RELEASE.md`](docs/RELEASE.md)「無法更新怎麼排除」。

## 內容

**規則**：[`global.md`](skills/my-workflow/references/global.md) 常駐（Claude Code、Codex 由 hook 連同入口 skill 與 `index.yaml` 一併注入）。其餘碰到情境才讀：[`git`](rules/git.md)、[`code-review`](rules/code-review.md)、[`wrap-up`](rules/wrap-up.md)、[`files-and-scripts`](rules/files-and-scripts.md)、[`install`](rules/install.md)、[`tools`](rules/tools.md)、[`memory`](skills/my-memory/rules/memory.md)（載入記憶 skill 時）。

**Skills**：入口 `my-workflow` 依 [`index.yaml`](skills/my-workflow/references/index.yaml) 載入一個。

| 類別 | Skill |
|------|-------|
| 路由入口 | `my-workflow` |
| 記憶 | `my-memory`（整理由獨立 skill `my-memory-consolidate` 排程執行，見 `my-skills/memory/`） |
| 知識庫 | `my-notion` |
| 文件 | `my-docs` |
| 需求 | `my-create-prd` |
| 介面 | `my-ui-ux` |
| 審查 | `my-review` |
| 程式庫 | `my-codebase-clear`、`my-codebase-init`（Claude 可搭配 `my-skills/claude/` 的 `my-codebase-init-claude`） |
| 提交 | `my-commit-all-and-push` |
| 發佈打包 | `my-release-packaging` |
| 雲端代理 | `my-cloud-agent` |
| 多線協同 | `my-subagent` |
| 安裝更新 | `my-plugin-install` |

**Composio MCP**：[`.mcp.json`](.mcp.json)（Claude）、[`mcp.json`](mcp.json)（Codex），端點 `https://connect.composio.dev/mcp`，OAuth，repo 不含金鑰。改用個人 MCP URL 與 API key 見 [Composio 文件](https://docs.composio.dev/docs/mcp-overview)。

# Claude 生態：安裝與更新

方法見 [SKILL.md](../SKILL.md)。2026-10-31 核對官方文件（見文末「依據」）；網頁介面按鈕以當下畫面為準，對不上就重查文件，不猜。

## 先選安裝目標

claude.ai 帳號與 Claude Code 是兩個來源，裝在一處不一定出現在另一處：

| 平台 | plugin 從哪來 | 載入的元件 |
|------|------|------|
| claude.ai 網頁、Desktop 聊天、手機 | claude.ai 帳號（[Customize > Plugins](https://claude.ai/customize/plugins)） | skills、commands（當 skill 用）、遠端 MCP；**不跑 hook、agents** |
| Cowork | claude.ai 帳號，任務開始時下載 | skills、commands、agents、hooks、MCP |
| Claude Code（終端機、Desktop Code 分頁、IDE） | 本機安裝（`~/.claude`，三者共用）＋帳號同步來的 `<name>@synced` | 全部 |
| Claude 雲端 session（claude.ai/code、`claude --cloud`） | 不載入本機安裝，也不載入 repo `.claude/settings.json` 宣告的 marketplace／plugin；帳號上啟用的 skills 會載入。帳號 plugin 是否整包（含 hook）同步：**需確認** | 見「雲端 session」 |

**同步方向只有一條**：帳號 → Cowork、Claude Code（`my-workflow@synced`）。本機 `/plugin`、`claude plugin install` 裝的**不會**回到帳號，網頁也看不到。

| 使用者要的 | 走哪節 |
|------|------|
| 在對話內裝，網頁／Cowork／Claude Code 都能用（**預設建議**） | 「對話內：安裝到帳號 marketplace」 |
| 只要本機 Claude Code | 「Claude Code 本機 marketplace」 |
| 目前在雲端 session | 「雲端 session」 |

兩邊都裝時，Claude Code 會載入本機那份、**略過 synced 那份**（同名衝突，本機優先），兩份版本可能不同步。建議只留帳號那份；要移除本機那份先問使用者。

## 檢查更新（只讀）

使用者只說「檢查」時到回報為止：不按 Add、Check for updates、Update now，不跑 `install`、`update`、`marketplace update`。

1. **來源最新**：用已登入的 `gh` 讀來源 `main`（私有 repo，讀不到就報「無法確認」，不拿本地 `origin/main` 當最新）：

   ```bash
   gh api repos/VECTOR-COOL/my-agent-toolkit/commits/main --jq .sha
   gh api "repos/VECTOR-COOL/my-agent-toolkit/commits?sha=main&path=my-plugins/my-workflow&per_page=1" --jq ".[0].sha, .[0].commit.message"
   ```

   第二行是**最後一次動到本 plugin 的 commit**；repo 其他目錄有新 commit 不算本 plugin 有更新。版本標籤看 `main` 的 `my-plugins/my-workflow/pack.yaml`。

2. **已安裝版本**：
   - Claude Code：先確認 CLI 夠新（見下節），再 `claude plugin list`，看 `my-workflow@my-agent-toolkit`（本機）與 `my-workflow@synced`（帳號同步）各自的 `Version`。本機版本是 12 碼 commit SHA（manifest 不寫 `version` 的緣故）。
   - 帳號端（網頁／Cowork）：打開 [Customize > Plugins](https://claude.ai/customize/plugins) 的 `my-workflow` 讀畫面上的版本或更新時間（實際欄位**需確認**）；在 Claude Code 也可讀 `~/.claude/plugins/synced/` 下的 my-workflow。沒有對話內工具能讀帳號就照實說，請使用者截圖或念給你。

3. **判定**：已安裝 SHA 等於第 1 步任一 SHA，或兩者間 `my-plugins/my-workflow/` 無差異 →「已是最新」；確認有差異 →「有更新」並摘要差異；讀不到任一側 →「無法確認」；只有目標環境明確顯示沒裝才報「尚未安裝」。

4. **回報**：檢查時間、目標（帳號／本機）、兩側版本或 SHA、差異摘要、下一步。沒取得的欄位寫「未取得」。

## 對話內：安裝到帳號 marketplace

帳號端沒有 CLI 或 API 可寫，只有 claude.ai 的 Plugins 頁面。依目前工具選做法：

| 目前可用 | 做法 |
|------|------|
| 瀏覽器工具（Claude in Chrome 有使用者登入；或內建瀏覽器已登入 claude.ai） | 代操作下列步驟，每步截圖確認 |
| 沒有瀏覽器工具（網頁聊天、Cowork、無瀏覽器的 CLI） | 照下列步驟**一步一步引導**，每步給連結與按鈕名，等使用者回報再走下一步 |

代操作規則：不輸入密碼、不代登入；使用者要求安裝即可按 **Add**、**Sync automatically**；**GitHub 授權（OAuth、安裝 Claude GitHub App）一律先停下來，請使用者自己按**；遇到登入頁就交給使用者。

### 首次安裝

1. 打開 👉 [Customize > Plugins](https://claude.ai/customize/plugins)（網頁或 Desktop 都一樣），確認登入的是目標帳號／組織（plugin 綁在「目前組織」）。
2. 先看 **Your plugins** 有沒有 `my-workflow`；有就跳到「更新」，不重複加。
3. 點 **Add → Add marketplace**，輸入 `VECTOR-COOL/my-agent-toolkit`（或完整 URL `https://github.com/VECTOR-COOL/my-agent-toolkit`）。
4. 私有 repo：對話框出現 **Connect GitHub** 就連結 GitHub；出現 **Install the Claude GitHub App** 就到 👉 [Claude GitHub App](https://github.com/apps/claude/installations/select_target) 授權讀取 `VECTOR-COOL/my-agent-toolkit`，回來重試。
5. 到 **Discover** 找 `my-workflow`（marketplace 也列了 `example-plugin`，不要裝），點 **Add**。
6. 在 marketplace 打開 **Sync automatically**（從 github.com 加入的才有）：之後 `main` 有新版自動同步，不用再按接受。
7. 開 plugin 的 **Connectors** 分頁：`composio` 顯示 **Not connected** 就連線登入，**Not added** 就加入再連線；Team／Enterprise 不能自己加時請 Owner 加。

### 更新

已開 **Sync automatically** 通常不用做；要立即拿新版：

1. 先做「檢查更新」，確定有新版。
2. [Customize > Plugins](https://claude.ai/customize/plugins) 的 `my-agent-toolkit` marketplace 點 **Check for updates**。
3. 網頁開**新對話**、Cowork 開**下一個任務**才用到新版；Claude Code 見下方驗證。

### 驗證

- 網頁：新對話輸入 `/`，看得到 `my-workflow` 的 skill；實際跑一個 skill 任務（例：「用 my-workflow 列出可用 skill」），確認入口有讀 `references/global.md`。
- Claude Code：開新 session 或跑 `/reload-plugins`，`claude plugin list` 出現 `my-workflow@synced` 且已啟用。需要 Claude Code v2.1.273 以上、用 claude.ai 帳號登入（用 API key、`ANTHROPIC_AUTH_TOKEN`、`--bare`、`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 時不同步）。
- 分開回報「已加入 marketplace」「已 Add plugin」「Sync automatically 已開」「composio 已連線」「網頁已實測」「Claude Code synced 已載入」，沒做到的照實標。

### 引導完要提醒

- 網頁與 Desktop 聊天**不跑 hook**，全域規則不會自動注入；入口 skill `my-workflow` 會自己讀 `references/global.md`。仍沒生效就請使用者把該檔貼到個人偏好或專案指示。
- 停用：plugin 頁 **Disable plugin** 開關；移除：plugin 選單 **Remove**。Claude Code 端要單獨關 synced 那份用 `claude plugin disable my-workflow@synced`。
- plugin 不能有頂層 `bin/`，否則網頁與 Cowork 會拒裝（目前 my-workflow 沒有）。

## Claude Code 本機 marketplace

只在使用者明確只要本機時用；結果不會出現在網頁。

**先確認 CLI**：`claude --version` 與 `claude plugin --help`。PATH 上的 `claude` 可能比 Desktop 內建的舊；`plugin` 底下只有 `validate`、或出現 `unknown command` 就先 `claude update`（不行見 [`docs/RELEASE.md`](../../../docs/RELEASE.md)「無法更新怎麼排除」），開新終端機再查。

安裝（終端機）：

```bash
claude plugin marketplace add VECTOR-COOL/my-agent-toolkit
claude plugin install my-workflow@my-agent-toolkit
claude plugin list
```

- 對話中用 `/plugin marketplace add VECTOR-COOL/my-agent-toolkit`、`/plugin install my-workflow@my-agent-toolkit`（會開面板讓你選 scope，預設選 user）。
- Desktop Code 分頁：prompt 旁 **+ → Add plugins**（或 **Plugins → Browse plugins**）。三個入口共用設定，裝一次即可。
- 私有 repo 用本機 git 憑證，不會跳登入：先 `gh auth login` 或設好 SSH key。
- **打開自動更新**：第三方 marketplace 預設**關閉**。`/plugin` → **Marketplaces** → 選 `my-agent-toolkit` → **Enable auto-update**。

更新：

```bash
claude plugin marketplace update my-agent-toolkit
claude plugin update my-workflow@my-agent-toolkit
```

- 第一行只刷新清單，第二行才更新 plugin；或 `/plugin` → **Installed** → `my-workflow` → **Update now**。
- 出現 `already at the latest version` 但來源確實有新 commit：檢查 manifest 是不是被加回 `version`。
- 新版載入：跑 `/reload-plugins` 或開新 session；執行中的 session 會維持舊版。
- 其他：`claude plugin disable|enable|uninstall my-workflow@my-agent-toolkit`。

## 雲端 session

- 本機安裝與 repo `.claude/settings.json` 的 `extraKnownMarketplaces`／`enabledPlugins` 都**不會**載入；session 內沒有 plugin 面板，**不能在 session 內安裝或更新**。
- 能帶進去的是 claude.ai 帳號端：帳號上啟用的 skills 會自動載入；整個 plugin（含 hook）是否同步**需確認**——在 session 內看有沒有 `~/.claude/plugins/synced/` 下的 my-workflow，或 `/` 選單有沒有 my-workflow 的 skill。
- 版本落後或沒載入：依「對話內：安裝到帳號 marketplace」的「更新」在帳號端處理，再**開新的雲端 session**。

## 失敗或環境不適用：引導下一步

先依 [SKILL.md](../SKILL.md) 回報失敗階段與實際錯誤（不含憑證），再給下一步。

| 情境 | 引導 |
|------|------|
| 要裝到網頁，但目前只有 CLI、沒有瀏覽器工具 | 不改成本機安裝；改用「首次安裝」逐步引導，或請使用者開 Claude in Chrome 後再讓你代操作 |
| 在網頁聊天／Cowork 被要求跑 `claude plugin …` | 說明這裡沒有 shell；目標是網頁就走帳號流程，目標是本機就請使用者到終端機或 Desktop Code 分頁 |
| **Connect GitHub**／**Install the Claude GitHub App** | 請使用者授權 [Claude GitHub App](https://github.com/apps/claude/installations/select_target) 讀 `VECTOR-COOL/my-agent-toolkit`；沒有該組織權限就請組織擁有者授權 |
| Discover 找不到 `my-workflow` | 確認 marketplace 已加入、帳號／組織正確；Team／Enterprise 可能被 Owner 限制自行加 marketplace，請 Owner 開放或代為發布 |
| marketplace 數量達上限（每帳號每組織 25 個） | 請使用者移除不用的 marketplace 再加 |
| 網頁更新反灰、停在舊版 | **Check for updates**；仍不行就 plugin 選單 **Remove** 再重新 **Add**（Composio 登入不受影響） |
| 終端機 `unknown command 'marketplace'`／`'install'`／`'update'` | CLI 太舊，`claude update` 後開新終端機重查；見 `docs/RELEASE.md` |
| CLI 加 marketplace 時 clone 失敗 | 本機 git 讀不到私有 repo：`gh auth login` 或設定 SSH；不要求使用者貼 token |
| Claude Code 看不到 `my-workflow@synced` | 確認 v2.1.273 以上、用 claude.ai 帳號登入（非 API key）、沒設 `syncClaudeAiPlugins: false`；跑 `/reload-plugins` 或重開 |
| `my-workflow@synced` 顯示未載入 | 本機也裝了同名 plugin，本機優先；問過使用者後 `claude plugin uninstall my-workflow@my-agent-toolkit` |
| 已更新但規則沒生效 | 網頁、Desktop 聊天不跑 hook；請使用者開新對話，或把 `references/global.md` 貼到個人偏好 |
| 雲端 session 是舊版 | session 開始時就固定；帳號端更新後開新 session |

需要換環境（例如從網頁聊天到 Claude Code、或請使用者自己操作）時，給一段可貼的交接提示，只填實際取得的值：

```text
請檢查並接續 my-workflow 的安裝／更新，目標是 claude.ai 帳號端 marketplace（網頁、Cowork、Claude Code 都能用）。
帳號／組織：<已確認；未知標未知>
來源：https://github.com/VECTOR-COOL/my-agent-toolkit，main，plugin my-workflow
來源 commit：<main 與本 plugin 最後 commit；未取得標未取得>
目前狀態：<marketplace 是否已加入、plugin 是否已 Add、Sync automatically、composio 連線>
已完成／卡住的步驟與錯誤：<照實填，不含憑證>
本次授權：<只檢查／已授權安裝或更新>
請先重新確認狀態再動作；完成後在新對話實測一個 skill。
```

## 依據

- [Plugins（claude.ai、Desktop、Cowork）](https://claude.com/docs/plugins/overview)
- [Plugin feature support across platforms](https://claude.com/docs/plugins/platform-support)
- [Install and manage plugins（Claude Code）](https://code.claude.com/docs/en/plugins/install)
- [Plugin loading reference：synced、版本、自動更新](https://code.claude.com/docs/en/plugins/loading)
- [Cloud environments：What carries over](https://code.claude.com/docs/en/cloud-environments)

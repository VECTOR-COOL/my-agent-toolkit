---
name: wordpress-rest-api-admin-development
version: "1.0.0"
description: WordPress REST API 管理端與後端配置開發 Skill。當 Codex 需要用自然語言說明 WordPress REST 管理端如何配置連線授權，或透過 Application Passwords 與 authenticated HTTP REST API 配置、稽核或維護 WordPress 後端時使用，包含 settings、posts/pages、taxonomies、media、users、menus/navigation、custom post types、meta exposure、custom endpoints、permission_callback、capability checks、安全檢查、server-only secrets、dry-run configuration manifests，以及 WordPress admin REST operations 的 Node.js validation/probe scripts。
---

# WordPress REST API 管理端開發

[![version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Website](https://img.shields.io/badge/Website-vector.cool-blue)](https://vector.cool)

本 skill 用於透過 HTTP REST API 管理 WordPress 後端配置資料。它不是 Docker、WAMP 或本機 WordPress 安裝器；「環境」在此指 WordPress 後端設定、內容 seed、權限、custom endpoint 與 API 可用性。

若任務是前端/headless schema、mock fixtures、TypeScript view model 或 service layer，優先搭配或改用 `wordpress-rest-api-development`。若任務需要寫入 WordPress、配置管理端資料、驗證 authenticated REST 能力或設計 custom endpoint，使用本 skill。

## 載入順序

採用 progressive disclosure，不要一次載入所有 references 與 examples。

1. 先判斷任務是認證、後端配置、custom endpoint、資料 seed、API 探測、套用 manifest 或安全 review。
2. 只讀下表對應檔案。
3. 若要檢查 WordPress REST 管理端可用性，執行 `node scripts/probe-wp-admin-rest-api.mjs`。
4. 若要檢查配置 manifest，執行 `node scripts/validate-admin-config-manifest.mjs --file <manifest.json>`。
5. 若要套用配置，先執行 `node scripts/apply-wp-admin-config.mjs --file <manifest.json> --dry-run`；只有在測試站或使用者明確授權時才加 `--apply`。
6. 若 API 行為、端點權限或 WordPress 版本差異會影響決策，重新查官方文件。

## Reference Index

| 需求 | 載入 |
| --- | --- |
| 自然語言詢問如何配置連線授權或安全檢查 | `references/auth-permissions-security.md`、必要時 `references/http-api-runbook.md` |
| 管理端 REST 配置流程、settings/content/users/menus/CPT/meta | `references/admin-rest-configuration.md` |
| Application Passwords、capabilities、secret boundary、安全 review | `references/auth-permissions-security.md` |
| custom endpoints、`permission_callback`、schema、`WP_Error` | `references/custom-endpoints-and-schemas.md` |
| HTTP API runbook、discovery、OPTIONS、pagination、media upload、dry-run | `references/http-api-runbook.md` |
| Node.js authenticated REST client 範例 | `examples/wp-admin-rest-client.example.mjs` |
| 後端配置 manifest 範例 | `examples/admin-config-manifest.example.json` |
| minimal custom endpoint plugin 範例 | `examples/custom-endpoint-plugin.example.php` |

## 核心規則

- 預設認證策略為 Application Passwords，且只能放在 server-only env 或本機受控腳本環境。
- 不要把 `WP_REST_USERNAME`、`WP_REST_APPLICATION_PASSWORD`、cookie nonce、JWT 或 OAuth secret 放進 browser bundle、public env、前端 serialized data、Git 或範例真值。
- 所有 mutating 操作預設 dry-run；正式寫入前列出 method、URL、payload 摘要、目標站台與預期影響。
- 先用 read-only probe 驗證 base URL、auth、目前使用者 capability 與端點存在，再設計寫入流程。
- 不要假設 authenticated user 是 administrator；以 endpoint response、OPTIONS schema、HTTP 401/403 與 WordPress error body 判斷權限。
- Custom endpoint 必須有明確 `permission_callback`，不得用 `__return_true` 暴露敏感資料或寫入操作。
- 寫入 content/config 時要偏向 idempotent upsert：能用 slug/name/key 查既有資料時不要盲目新增。
- Production API error 不可被吞掉或轉成成功；保留 WordPress error body `{ code, message, data.status }` 供呼叫端判斷。
- Media upload、user 建立、settings 更新、plugin/theme 操作都屬高風險；需要明確環境確認與最小權限。

## 自然語言配置詢問

使用者若以自然語言詢問「如何配置」、「怎麼連 WordPress」、「怎麼授權」、「後台 REST API 要怎麼設定」或「安全檢查怎麼做」，先回答配置方式，不要直接要求使用者在聊天中貼出 secret，也不要直接執行 probe/apply。

回覆必須包含：

1. 連線 base URL：`WP_REST_BASE_URL=https://example.com/wp-json`，不要填到 `/wp-json/wp/v2`。
2. 授權方式：預設使用 WordPress core Application Passwords，放在 `WP_REST_USERNAME` 與 `WP_REST_APPLICATION_PASSWORD`，由 server-side script 轉成 `Authorization: Basic base64(username:applicationPassword)`。
3. Secret boundary：不得使用 `VITE_`、`NEXT_PUBLIC_` 或其他 public env prefix；不得放入 browser bundle、manifest、Git、console log 或前端 serialized data。
4. 權限檢查：先用 read-only probe 驗證 `/wp/v2/users/me?context=edit`、`/wp/v2/settings` 與目標 endpoint 的 OPTIONS；不要假設登入者是 administrator。
5. 安全檢查：確認 HTTPS、staging/production、最小權限帳號、Application Password 可撤銷、401/403 error body 保留、寫入前 dry-run。
6. 寫入 guardrail：所有 create/update/delete 預設 dry-run；production、高風險操作或 `--apply` 必須等使用者明確授權。

建議回覆格式：

```text
連線設定：
- WP_REST_BASE_URL=...
- WP_REST_USERNAME=...
- WP_REST_APPLICATION_PASSWORD=...

授權方式：
- 使用 Application Passwords + Basic Auth，只在 server-only/local script 使用。

安全檢查：
- ...

驗證順序：
- Discovery -> users/me -> OPTIONS -> dry-run -> 明確授權後 apply。
```

## 環境變數

```bash
WP_REST_BASE_URL=https://example.com/wp-json
WP_REST_USERNAME=admin@example.com
WP_REST_APPLICATION_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

- `WP_REST_BASE_URL` 指向 `/wp-json`，scripts 會自行組 `/wp/v2/...`。
- Application Passwords 內含空格時要保留原值；腳本會用 Basic Auth header 傳送。
- 若目標專案已有不同 env 命名，先在 server-only config 正規化，不要把 secret 改成 public prefix。

## 配置 Manifest Contract

Manifest v1 是腳本與 agent 共同使用的最小資料契約：

```json
{
  "version": 1,
  "site": {
    "baseUrl": "https://example.com/wp-json",
    "environment": "staging"
  },
  "settings": {},
  "taxonomies": [],
  "pages": [],
  "posts": [],
  "media": [],
  "users": [],
  "menus": [],
  "customEndpointChecks": []
}
```

允許省略未使用的 section；出現時必須符合 `references/admin-rest-configuration.md` 與 validator 的基本 shape。Manifest 不得包含密碼、Application Passwords 或外部 API secrets。

## 常見任務

### 探測管理端 REST 能力

1. 確認 `WP_REST_BASE_URL`、`WP_REST_USERNAME`、`WP_REST_APPLICATION_PASSWORD` 只在安全環境。
2. 執行 `node scripts/probe-wp-admin-rest-api.mjs`。
3. 檢查 discovery、`/wp/v2/users/me?context=edit`、`/wp/v2/settings` 與 OPTIONS 結果。
4. 回報目前 user name、roles/capabilities 摘要、可用端點、缺失權限與下一步。

### 規劃後端配置

1. 讀 `references/admin-rest-configuration.md`。
2. 用 API discovery 或 OPTIONS 確認端點存在與欄位可寫。
3. 建立或修改 manifest，先跑 validator。
4. 執行 apply 腳本 dry-run，確認操作順序與 upsert key。
5. 只有在非 production 或使用者明確授權時執行 `--apply`。

### 設計 custom endpoint

1. 讀 `references/custom-endpoints-and-schemas.md`。
2. 定義 route namespace、method、request args、response shape、capability 與錯誤碼。
3. 用 `permission_callback` 做最小權限檢查。
4. 用 OPTIONS 與 authenticated probe 驗證 schema/permission。
5. 不把 plugin-specific private options、user email、secret 或 edit URL 暴露給 public endpoint。

## Scripts

在 skill 目錄內執行，需 Node.js 20+：

```bash
node scripts/probe-wp-admin-rest-api.mjs
node scripts/validate-admin-config-manifest.mjs --file examples/admin-config-manifest.example.json
node scripts/apply-wp-admin-config.mjs --file examples/admin-config-manifest.example.json --dry-run
node scripts/apply-wp-admin-config.mjs --file path/to/manifest.json --apply
```

所有 scripts 僅使用 Node.js 內建能力與原生 `fetch`，不需要 npm install。

## Review Checklist

- 是否把「後端環境」解讀為 WordPress 配置資料，而非本機安裝工具。
- 是否使用 Application Passwords 或專案批准的 server-side auth，且 secret 沒有進入前端/public env/Git。
- 是否在寫入前完成 read-only probe、OPTIONS/schema/capability 檢查。
- 是否預設 dry-run，且 apply 明確顯示目標站台與操作摘要。
- 是否用 upsert key 避免重複新增 page/post/taxonomy/menu。
- Custom endpoint 是否有 `permission_callback`、sanitize/validate args、`WP_Error` 與最小 response。
- User/settings/plugin/theme/media 操作是否被標為高風險並要求環境確認。
- 錯誤是否保留 WordPress error body，而不是被轉成空資料或成功狀態。

完成後回報讀取的 reference、使用的 env/manifest、dry-run 或 apply 結果、權限缺口，以及是否仍需要 WordPress 後台人工設定。

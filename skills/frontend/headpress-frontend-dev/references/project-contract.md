# Project Contract — HeadPress Frontend Dev

本文件為每個使用 HeadPress 主題的專案建立基本契約。使用時填入實際值。

> 範例使用 `example.com`；實際使用時替換為部署的真實網域。

## Identity

| Item | 填入方式 | 範例值 |
| --- | --- | --- |
| Product | 填入產品或網站名稱 | My Site |
| Public site | `VITE_SITE_URL` | `https://example.com` |
| CMS（HeadPress） | `VITE_WP_API_URL` 的 host | `https://example.com` |
| REST API base（Composition） | `https://{CMS_HOST}/wp-json/headpress/api/v1` | `https://example.com/wp-json/headpress/api/v1` |
| REST namespace | `headpress/api/v1` | `headpress/api/v1` |
| HeadPress minimum version | `GET /health` 或 `manifest` 的 `version` ≥ skill 要求（目前 **0.6.0**） | `0.6.0` |
| Frontend platform | 填入實際平台 | Lovable / v0 / Replit / 自架 Vite/Next/TanStack |
| Rendering target | 保留 active SSR/SSG/pre-render/CSR mode | 視平台而定 |
| Backend model | WordPress Headless CMS（HeadPress Theme）| 優先 REST via `headpress/api/v1`；必要時 service-layer `/wp/v2/` |

## Source Of Truth

- **WordPress（HeadPress CMS）owns content**：titles、slugs、body、excerpts、media、categories、tags、custom post type records 與 SEO plugin fields。
- **Frontend owns presentation**：layout、components、route composition、loading states、error states 與 accessible markup。
- **Platform tooling owns platform operations**：visual editing、preview URLs、publish/deploy controls、custom-domain binding、platform env settings 與 platform SEO review tooling。
- **Git owns durable code and project documentation**。
- **`openapi.json` owns API surface**：所有前端消費的 HeadPress endpoint 與欄位形狀以此為準。

## Environment Names

使用以下命名（框架改名時在 config/service layer 正規化，不要盲目 rename）：

```bash
VITE_SITE_URL=https://example.com
VITE_WP_API_URL=https://example.com/wp-json/headpress/api/v1
VITE_DATA_SOURCE=mock|api
```

後端（HeadPress CMS repo）使用固定變數名：

```bash
WP_API_BASE
WP_API_USER
WP_API_APP_PASSWORD
```

Server-only secrets 不得使用 `VITE_` prefix（或 Next.js 的 `NEXT_PUBLIC_` 等 browser-exposed prefix）。

## Guardrails

- 不要把開發/staging URL hardcode 進 production SEO 欄位。
- 不要把 Lovable internal storage 或其他 builder storage 當成 CMS；WordPress + HeadPress 是唯一 backend contract。
- 不要為了滿足 UI component 而改 CMS 欄位名稱；透過 mapper/service 處理，或提交 HeadPress 後端 schema change。
- 不要宣稱 domain 已 bind、已部署或已發布，除非平台/部署工具已實際確認。
- 前端操作任何 `headpress/api/v1` endpoint 前，先確認該 endpoint 已在 `openapi.json` 中定義。
- `/wp/v2/` 僅作 service-layer 備援，不可取代 HeadPress 作為預設資料路徑。

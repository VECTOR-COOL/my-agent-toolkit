# WordPress 主題開發檢查表

使用此 checklist 處理 Classic Themes、Block Themes、child themes、template hierarchy、`theme.json`、patterns、template parts 與 theme/plugin responsibility boundaries。

## 職責邊界

- 可攜式 business logic 放在 plugins，不放在 themes。
- Themes 負責 presentation、layout、templates、style tokens、template parts、block patterns 與 frontend interaction。
- Plugins 負責 CPTs、taxonomies、business rules、integrations、admin workflows、persistent custom data 與 reusable APIs。
- 只有使用者明確要求時，才允許 theme-bound business logic。

## 預設主題策略

- 新 theme work 預設使用 Block Theme / Full Site Editing。
- 只有既有專案、compatibility target 或使用者需求需要時，才使用 Classic Theme。
- 修改既有 codebase 時保留既有 theme architecture。

## Block Theme

- 使用 `theme.json` 管理 global settings、styles、typography、spacing、color、layout 與 block-level defaults。
- `theme.json` 保持 minimal 且 intentional；避免過度限制 editor controls。
- 使用 `templates/` 放 page templates，使用 `parts/` 放 template parts。
- 使用 `patterns/` 放 reusable block compositions。
- 只有專案需要 style variations 時才使用 `styles/`。
- 確認 templates 使用 valid block markup，且能在 Site Editor 編輯。
- templates 與 patterns 避免 hardcoded absolute URLs。

## Classic Theme

- 包含 required files，例如 `style.css`、`functions.php`，以及符合 Template Hierarchy 的 templates。
- 使用 `get_header()`、`get_footer()`、`get_template_part()` 與 WordPress template tags。
- `functions.php` 只用於 theme setup、enqueue 與 presentation-level hooks。
- 使用 `add_theme_support()` 設定 supported features。
- translation functions 與 text domain 保持一致。

## Child Theme

- child theme paths 使用 `get_stylesheet_directory()` 與 `get_stylesheet_directory_uri()`。
- 只有明確引用 parent theme 時，才使用 `get_template_directory()` 與 `get_template_directory_uri()`。
- 不可 hardcode parent theme paths。
- 依 parent theme documented pattern enqueue parent 與 child styles。

## Template Hierarchy

- archives、singles、pages、search、404 與 custom post types 遵守 WordPress Template Hierarchy。
- 除非專案明確需要 custom routing layer，不要繞過 WordPress query behavior。
- 謹慎使用 `pre_get_posts`，且只修改 main query；檢查 `is_admin()` 與 `is_main_query()`。

## 輸出安全

- templates 中所有 dynamic output 必須 escape：
  - 文字使用 `esc_html()`。
  - attributes 使用 `esc_attr()`。
  - URLs 使用 `esc_url()`。
  - trusted HTML 使用 `wp_kses_post()` 或更嚴格 allowlist。
- 只有 output behavior 適合時才使用 `the_title()` 等 template tags；否則使用 get/escape patterns。
- theme mods 與 Customizer/settings inputs 必須 sanitize。

## 資產載入

- CSS 與 JS 透過 WordPress APIs enqueue。
- 實務可行時，依 template、block 或 feature 條件式載入 assets。
- local assets 不可 hardcode script tags。
- 避免來源不明 remote scripts。若必須使用 third-party assets，說明 source、integrity strategy、privacy impact 與 fallback。

## 效能

- templates 中避免 heavy queries。
- production templates 不使用 `posts_per_page => -1`。
- expensive computed navigation、remote data 或 reusable layout data 必須 cache。
- 避免無限制渲染 large menus 或 related-content queries。

## Accessibility 與 i18n

- 使用 semantic HTML 與 accessible navigation landmarks。
- 提供有意義的 alt text handling。
- 保留 menus 與 interactive components 的 keyboard navigation。
- 使用 translation-ready strings，並 escape output。

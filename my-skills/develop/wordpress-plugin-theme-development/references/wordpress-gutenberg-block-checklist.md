# WordPress Gutenberg Block 檢查表

使用此 checklist 處理 custom blocks、block plugins、Block Theme integrations、dynamic blocks、editor UI 與 frontend rendering。

## Block Metadata 設定

- 在 `block.json` 定義 block metadata。
- 由 PHP 使用 `register_block_type()` 註冊。
- block name 必須 namespaced，例如 `my-plugin/featured-card`。
- attributes 必須明確定義 types 與 defaults。
- block supports 必須 intentional；避免啟用不支援的 editor controls。

## 資產載入

- 可行時使用 `editorScript`、`script`、`viewScript`、`editorStyle` 與 `style` 等 metadata fields。
- editor-only 與 frontend assets 分開。
- 只 enqueue block 需要的 assets。
- 使用 dependency arrays 與 versioning。
- 除非必要，避免全域載入 block assets。

## Modern React 與 WordPress Packages

- build process 可接受時，使用 `@wordpress/scripts` 作為標準 build flow。
- 使用 WordPress package imports，例如 `@wordpress/blocks`、`@wordpress/block-editor`、`@wordpress/components`、`@wordpress/i18n` 與 `@wordpress/data`。
- 優先使用 Gutenberg standard components，再考慮 custom UI controls。
- editor UI 必須 accessible 且 keyboard-friendly。

## No-Build 替代方案

當 hosting constraints 或簡單 scope 不適合 build process 時：

- 可行時提供簡單 PHP-rendered dynamic block。
- editor interactivity 很少時，可使用透過 WordPress APIs 註冊的 plain JavaScript。
- 除非使用者確認環境支援，不可讓 Composer 或 npm 成為唯一方案。

## Dynamic Blocks

- server-rendered dynamic output 使用 `render_callback`。
- query 前 sanitize 與 validate attributes。
- callback output 全部 escape。
- 適用時 cache expensive query 或 remote data。
- 避免 `posts_per_page => -1`；使用 bounded limits。

## Static Blocks

- 確認 saved markup 穩定且 valid。
- 適用時使用 `RichText`、`InspectorControls` 與 standard block editor components。
- 如果 saved content 會經過 server-side rendering，PHP render 時必須 escape frontend output。

## Block Theme 與 theme.json

- 使用 `theme.json` 管理 global 與 block-level design tokens。
- 避免在 block code 與 `theme.json` 重複定義 style decisions。
- custom CSS 保持 minimal 且 scoped。
- 相關時確認 blocks 可在 Site Editor templates 與 template parts 中運作。

## 安全

- 不信任 block attributes。
- 儲存或查詢前 sanitize attributes。
- render output late escape。
- 不可在 block attributes、serialized comments、REST responses 或 frontend scripts 暴露 private data。
- editor-only API calls 必須以 capability checks 與 REST permissions 保護。

## 效能

- static content 避免 frontend hydration。
- 可行時，只在 block 存在的頁面載入 frontend scripts。
- Cache expensive dynamic block output 或底層 data。
- 避免在 repeated block rendering 中執行 nested heavy queries。

## 測試

- 測試 editor insert、edit、save、reload、frontend render、invalid attributes、missing data 與 permission-denied states。
- 同時提供 build 與 no-build paths 時，兩者都要測試。

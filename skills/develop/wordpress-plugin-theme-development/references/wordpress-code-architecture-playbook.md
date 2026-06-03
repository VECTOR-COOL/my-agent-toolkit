# WordPress 程式碼架構 Playbook

使用此 playbook 規劃外掛與主題的檔案結構、責任分層、autoload/no-Composer 路徑與可維護交付方式。

## 外掛架構預設

- 主檔只負責 plugin header、常數、autoload/require、啟動主 class。
- 實作放在 `includes/` 或 `src/`，以 service class 拆分責任。
- 每個 service 提供 `register_hooks()`，集中註冊 actions/filters。
- Admin、REST、AJAX、Assets、Settings、Cron、Repository、Migration 分開。
- 可攜式 business logic 留在 plugin，不放到 theme。

## 建議外掛結構

```txt
my-plugin/
├── my-plugin.php
├── includes/
│   ├── Plugin.php
│   ├── Admin_Settings.php
│   ├── Assets.php
│   ├── Rest_Controller.php
│   ├── Ajax_Controller.php
│   └── Migration.php
└── uninstall.php
```

## 主題架構預設

- 新主題優先 Block Theme：`theme.json`、`templates/`、`parts/`、`patterns/`。
- `functions.php` 只做 theme setup、enqueue、presentation-level hooks。
- CPT、taxonomies、settings、business rules、API integration 放到 plugin。

## 建議 Block Theme 結構

```txt
my-theme/
├── style.css
├── functions.php
├── theme.json
├── templates/
├── parts/
└── patterns/
```

## OOP 與 Procedural 取捨

- 外掛正式功能預設 OOP + namespace。
- procedural 只適合 minimal bootstrap、theme templates、極小型 shortcode 範例。
- 若使用 Composer，仍要說明 no-Composer 替代：手動 `require_once`、提交 build artifact 或縮小 dependency。

## 架構審查問題

- 主檔是否過胖，或在 file load time 執行 business logic？
- hooks 是否集中註冊，且 lifecycle 正確？
- admin、REST、AJAX、assets、settings 是否混在同一 callback？
- 主題是否放入應該屬於外掛的資料模型或商業邏輯？
- 是否有 activation 執行 heavy work？

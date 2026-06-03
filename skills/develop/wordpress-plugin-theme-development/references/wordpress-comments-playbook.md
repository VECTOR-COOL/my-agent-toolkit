# WordPress 註解 Playbook

使用此 playbook 撰寫繁體中文註解、DocBlocks、hook callback 說明與安全/效能決策註解。

## 註解語言

- 說明與 PHP 註解使用繁體中文。
- code identifiers、WordPress APIs、class、namespace、package 名稱保持英文。

## 何時需要註解

- hook priority 不是預設值時。
- nonce/capability 選擇不是顯而易見時。
- cache key、TTL、invalidation strategy 需要維護者理解時。
- direct SQL 不可避免時。
- theme/plugin boundary 有專案特例時。

## DocBlock

- public class/method 可加簡短 DocBlock。
- callback DocBlock 說明 hook、輸入、回傳與安全邊界。
- 不要寫只重述函式名稱的空泛註解。

## 範例

```php
/**
 * 註冊外掛後台設定頁。
 *
 * 這個 callback 只負責建立 menu entry；實際表單輸出由 render_settings_page() 處理。
 */
public function register_menu(): void {
    add_options_page(
        __( 'My Plugin Settings', 'my-plugin' ),
        __( 'My Plugin', 'my-plugin' ),
        'manage_options',
        'my-plugin',
        [ $this, 'render_settings_page' ]
    );
}
```

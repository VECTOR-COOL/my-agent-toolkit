# WordPress 官方來源

優先使用官方來源，而不是第三方教學。若行為可能因 WordPress 版本不同而改變，必須依目前官方文件或 source 重新確認。

## 主要來源

- WordPress Developer Resources: https://developer.wordpress.org/
- WordPress Code Reference: https://developer.wordpress.org/reference/
- WordPress Plugin Developer Handbook: https://developer.wordpress.org/plugins/
- WordPress Theme Developer Handbook: https://developer.wordpress.org/themes/
- WordPress REST API Handbook: https://developer.wordpress.org/rest-api/
- WordPress Block Editor Handbook: https://developer.wordpress.org/block-editor/
- WordPress Coding Standards: https://developer.wordpress.org/coding-standards/wordpress-coding-standards/
- WordPress Core development repository: https://github.com/WordPress/wordpress-develop
- Gutenberg repository: https://github.com/WordPress/gutenberg
- WordPress VIP Documentation: https://docs.wpvip.com/
- WordPress VIP PHPCS errors and code analysis guidance: https://docs.wpvip.com/php_codesniffer/errors/
- ACF Documentation: https://developers.wpengine.com/docs/advanced-custom-fields/
- Elementor Developers: https://developers.elementor.com/docs/
- WPML Coding API: https://wpml.org/documentation/support/wpml-coding-api/
- WPML Hooks Reference: https://wpml.org/documentation/support/wpml-coding-api/wpml-hooks-reference/

## 來源優先順序

1. WordPress Core source 與官方 Code Reference，用於確認 function behavior。
2. 官方 Plugin、Theme、REST API 與 Block Editor handbooks，用於 implementation patterns。
3. WordPress Coding Standards 與 VIP guidance，用於 enterprise review、security、performance 與 platform compatibility。
4. ACF、Elementor、WPML 官方 developer docs，用於第三方外掛 integration hooks 與 lifecycle。
5. 不牴觸官方安全或平台要求時，遵守 project codebase conventions。

## 驗證規則

- 使用者詢問 latest behavior、current WordPress version compatibility、VIP-specific policy、block editor package behavior 或 REST API permission details 時，重新查官方文件。
- 不要將官方文件長篇複製到回覆或 skill files；應摘要並附連結。
- community examples 不是 authoritative；除非已由官方 docs 或 WordPress Core source 確認，否則不可當成依據。

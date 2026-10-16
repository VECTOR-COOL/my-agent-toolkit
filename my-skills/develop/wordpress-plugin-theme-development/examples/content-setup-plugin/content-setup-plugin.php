<?php
/**
 * Plugin Name: WP Skill Content Setup
 * Description: 建立文章、主選單、分類與標籤的安全範例。
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: wp-skill-content-setup
 */

declare(strict_types=1);

namespace WpSkill\ContentSetup;

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/Content_Setup.php';

register_activation_hook(__FILE__, static function (): void {
    (new Content_Setup())->install();
});

<?php
/**
 * Plugin Name: WP Skill OOP Basic
 * Description: 企業級 OOP 外掛架構範例。
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Author: Example
 * Text Domain: wp-skill-oop-basic
 */

declare(strict_types=1);

namespace WpSkill\OopBasic;

if (! defined('ABSPATH')) {
    exit;
}

const VERSION = '1.0.0';
const OPTION_NAME = 'wp_skill_oop_basic_options';

require_once __DIR__ . '/includes/Plugin.php';
require_once __DIR__ . '/includes/Admin_Settings.php';

register_activation_hook(__FILE__, static function (): void {
    // 啟用時只建立必要預設值，避免重型任務拖慢或中斷啟用流程。
    if (false === get_option(OPTION_NAME, false)) {
        add_option(OPTION_NAME, ['message' => 'Hello WordPress']);
    }
});

register_deactivation_hook(__FILE__, static function (): void {
    // Deactivation 不刪除使用者資料；資料刪除應放在 uninstall 流程。
});

(new Plugin(new Admin_Settings()))->register_hooks();

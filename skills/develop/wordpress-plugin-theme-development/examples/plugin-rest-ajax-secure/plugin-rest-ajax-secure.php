<?php
/**
 * Plugin Name: WP Skill REST AJAX Secure
 * Description: REST API 與 AJAX 安全處理範例。
 * Version: 1.0.0
 * Requires at least: 6.5
 * Requires PHP: 8.1
 * Text Domain: wp-skill-rest-ajax-secure
 */

declare(strict_types=1);

namespace WpSkill\RestAjaxSecure;

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/Rest_Controller.php';
require_once __DIR__ . '/includes/Ajax_Controller.php';

add_action('rest_api_init', static function (): void {
    (new Rest_Controller())->register_routes();
});

add_action('init', static function (): void {
    (new Ajax_Controller())->register_hooks();
});

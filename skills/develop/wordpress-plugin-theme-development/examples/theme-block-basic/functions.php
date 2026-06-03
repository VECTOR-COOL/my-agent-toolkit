<?php
/**
 * Block Theme setup.
 */

declare(strict_types=1);

if (! defined('ABSPATH')) {
    exit;
}

add_action('after_setup_theme', 'wp_skill_block_basic_setup');
function wp_skill_block_basic_setup(): void
{
    // 主題只啟用 presentation-level features；內容模型交給外掛。
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
}

add_action('wp_enqueue_scripts', 'wp_skill_block_basic_enqueue_assets');
function wp_skill_block_basic_enqueue_assets(): void
{
    wp_enqueue_style(
        'wp-skill-block-basic',
        get_stylesheet_uri(),
        [],
        wp_get_theme()->get('Version')
    );
}

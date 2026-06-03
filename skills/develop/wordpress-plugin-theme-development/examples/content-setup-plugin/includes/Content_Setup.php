<?php
/**
 * 建立初始內容的範例服務。
 */

declare(strict_types=1);

namespace WpSkill\ContentSetup;

use WP_Error;

final class Content_Setup
{
    /**
     * Activation 只建立少量必要內容，且每一步都保持 idempotent。
     */
    public function install(): void
    {
        $category_id = $this->ensure_term('最新消息', 'news', 'category');
        $tag_id = $this->ensure_term('精選', 'featured', 'post_tag');
        $post_id = $this->ensure_post('歡迎使用 WordPress', 'welcome-to-wordpress', $category_id, $tag_id);
        $this->ensure_primary_menu($post_id);
    }

    private function ensure_term(string $name, string $slug, string $taxonomy): int
    {
        $existing = term_exists($slug, $taxonomy);
        if (is_array($existing) && isset($existing['term_id'])) {
            return absint($existing['term_id']);
        }

        $created = wp_insert_term(
            sanitize_text_field($name),
            $taxonomy,
            [
                'slug' => sanitize_title($slug),
            ]
        );

        if ($created instanceof WP_Error || ! is_array($created)) {
            return 0;
        }

        return absint($created['term_id'] ?? 0);
    }

    private function ensure_post(string $title, string $slug, int $category_id, int $tag_id): int
    {
        $existing = get_page_by_path(sanitize_title($slug), OBJECT, 'post');
        if ($existing instanceof \WP_Post) {
            return absint($existing->ID);
        }

        $post_id = wp_insert_post(
            [
                'post_title'   => sanitize_text_field($title),
                'post_name'    => sanitize_title($slug),
                'post_status'  => 'publish',
                'post_type'    => 'post',
                'post_content' => wp_kses_post('<p>這是一篇由內容初始化流程建立的範例文章。</p>'),
            ],
            true
        );

        if ($post_id instanceof WP_Error) {
            return 0;
        }

        if ($category_id > 0) {
            wp_set_post_terms($post_id, [$category_id], 'category', false);
        }

        if ($tag_id > 0) {
            wp_set_post_terms($post_id, [$tag_id], 'post_tag', false);
        }

        return absint($post_id);
    }

    private function ensure_primary_menu(int $post_id): void
    {
        $menu_name = '主選單';
        $menu = wp_get_nav_menu_object($menu_name);
        $menu_id = $menu ? absint($menu->term_id) : 0;

        if (0 === $menu_id) {
            $created = wp_create_nav_menu($menu_name);
            if ($created instanceof WP_Error) {
                return;
            }
            $menu_id = absint($created);
        }

        if ($post_id > 0) {
            $menu_item_id = $this->find_menu_item_id($menu_id, $post_id);
            if (0 === $menu_item_id) {
                wp_update_nav_menu_item(
                    $menu_id,
                    0,
                    [
                        'menu-item-title'     => sanitize_text_field('最新消息'),
                        'menu-item-object-id' => $post_id,
                        'menu-item-object'    => 'post',
                        'menu-item-type'      => 'post_type',
                        'menu-item-status'    => 'publish',
                    ]
                );
            }
        }

        $locations = get_theme_mod('nav_menu_locations', []);
        if (is_array($locations) && array_key_exists('primary', $locations)) {
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }

    private function find_menu_item_id(int $menu_id, int $post_id): int
    {
        $items = wp_get_nav_menu_items($menu_id);
        if (! is_array($items)) {
            return 0;
        }

        foreach ($items as $item) {
            if ('post_type' === $item->type && 'post' === $item->object && absint($item->object_id) === $post_id) {
                return absint($item->ID);
            }
        }

        return 0;
    }
}

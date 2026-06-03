<?php
/**
 * AJAX handler 範例。
 */

declare(strict_types=1);

namespace WpSkill\RestAjaxSecure;

final class Ajax_Controller
{
    public function register_hooks(): void
    {
        add_action('wp_ajax_wp_skill_save_message', [$this, 'save_message']);
    }

    public function save_message(): void
    {
        check_ajax_referer('wp_skill_save_message', 'nonce');

        if (! current_user_can('manage_options')) {
            wp_send_json_error(['message' => esc_html__('權限不足。', 'wp-skill-rest-ajax-secure')], 403);
        }

        $message = sanitize_text_field(wp_unslash($_POST['message'] ?? ''));
        update_option('wp_skill_rest_ajax_message', $message);

        wp_send_json_success(['message' => $message]);
    }
}

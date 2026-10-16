<?php
/**
 * REST endpoint 範例。
 */

declare(strict_types=1);

namespace WpSkill\RestAjaxSecure;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

final class Rest_Controller
{
    public function register_routes(): void
    {
        register_rest_route(
            'wp-skill/v1',
            '/message',
            [
                [
                    'methods'             => 'GET',
                    'callback'            => [$this, 'get_message'],
                    'permission_callback' => static fn (): bool => current_user_can('read'),
                ],
                [
                    'methods'             => 'POST',
                    'callback'            => [$this, 'update_message'],
                    'permission_callback' => [$this, 'can_update_message'],
                    'args'                => [
                        'message' => [
                            'required'          => true,
                            'sanitize_callback' => 'sanitize_text_field',
                            'validate_callback' => static fn ($value): bool => is_string($value) && '' !== trim($value),
                        ],
                    ],
                ],
            ]
        );
    }

    public function get_message(): WP_REST_Response
    {
        $message = get_option('wp_skill_rest_ajax_message', 'Hello REST');

        return new WP_REST_Response(
            [
                'message' => (string) $message,
            ],
            200
        );
    }

    public function update_message(WP_REST_Request $request): WP_REST_Response|WP_Error
    {
        if (! current_user_can('manage_options')) {
            return new WP_Error('wp_skill_forbidden', __('權限不足。', 'wp-skill-rest-ajax-secure'), ['status' => 403]);
        }

        $message = sanitize_text_field((string) $request->get_param('message'));
        update_option('wp_skill_rest_ajax_message', $message);

        return new WP_REST_Response(['message' => $message], 200);
    }

    public function can_update_message(WP_REST_Request $request): bool
    {
        $nonce = (string) $request->get_header('x_wp_nonce');
        $has_intent = '' !== $nonce && false !== wp_verify_nonce($nonce, 'wp_rest');

        return $has_intent && current_user_can('manage_options');
    }
}

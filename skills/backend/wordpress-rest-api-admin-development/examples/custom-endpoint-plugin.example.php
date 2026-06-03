<?php
/**
 * Plugin Name: Vector REST Admin Endpoint Example
 * Description: WordPress 管理端 REST API custom endpoint 最小範例。
 * Version: 1.0.0
 */

add_action('rest_api_init', function () {
    register_rest_route('vector/v1', '/admin-readiness', [
        'methods' => WP_REST_Server::READABLE,
        'callback' => 'vector_rest_admin_readiness',
        'permission_callback' => function () {
            return current_user_can('manage_options');
        },
        'args' => [
            'include_options' => [
                'type' => 'boolean',
                'required' => false,
                'default' => false,
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
        ],
    ]);
});

function vector_rest_admin_readiness(WP_REST_Request $request) {
    if (!current_user_can('manage_options')) {
        return new WP_Error(
            'vector_rest_forbidden',
            '目前使用者沒有管理此站台的權限。',
            ['status' => 403]
        );
    }

    $data = [
        'ok' => true,
        'site' => [
            'name' => get_bloginfo('name'),
            'url' => home_url('/'),
        ],
        'features' => [
            'application_passwords' => class_exists('WP_Application_Passwords'),
            'rest_api' => true,
        ],
    ];

    if ($request->get_param('include_options')) {
        $data['options'] = [
            'timezone_string' => get_option('timezone_string'),
            'posts_per_page' => (int) get_option('posts_per_page'),
        ];
    }

    return rest_ensure_response($data);
}

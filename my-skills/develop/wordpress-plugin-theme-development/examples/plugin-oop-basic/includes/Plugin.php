<?php
/**
 * 外掛主協調器。
 */

declare(strict_types=1);

namespace WpSkill\OopBasic;

final class Plugin
{
    public function __construct(private readonly Admin_Settings $admin_settings)
    {
    }

    public function register_hooks(): void
    {
        add_action('admin_menu', [$this->admin_settings, 'register_menu']);
        add_action('admin_init', [$this->admin_settings, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function enqueue_admin_assets(string $hook_suffix): void
    {
        if ('settings_page_wp-skill-oop-basic' !== $hook_suffix) {
            return;
        }

        wp_enqueue_style(
            'wp-skill-oop-basic-admin',
            plugins_url('admin.css', dirname(__DIR__) . '/plugin-oop-basic.php'),
            [],
            VERSION
        );
    }
}

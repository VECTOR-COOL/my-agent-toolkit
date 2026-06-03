<?php
/**
 * 後台設定頁範例。
 */

declare(strict_types=1);

namespace WpSkill\OopBasic;

final class Admin_Settings
{
    public function register_menu(): void
    {
        add_options_page(
            __('WP Skill OOP Basic', 'wp-skill-oop-basic'),
            __('WP Skill OOP', 'wp-skill-oop-basic'),
            'manage_options',
            'wp-skill-oop-basic',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings(): void
    {
        register_setting(
            'wp_skill_oop_basic',
            OPTION_NAME,
            [
                'type'              => 'array',
                'sanitize_callback' => [$this, 'sanitize_options'],
                'default'           => ['message' => 'Hello WordPress'],
            ]
        );
    }

    /**
     * Sanitize settings payload before saving.
     *
     * @param mixed $value Raw option value.
     * @return array{message:string}
     */
    public function sanitize_options(mixed $value): array
    {
        $value = is_array($value) ? $value : [];

        return [
            'message' => sanitize_text_field($value['message'] ?? ''),
        ];
    }

    public function render_settings_page(): void
    {
        if (! current_user_can('manage_options')) {
            wp_die(esc_html__('權限不足。', 'wp-skill-oop-basic'));
        }

        $options = get_option(OPTION_NAME, ['message' => '']);
        $message = is_array($options) ? (string) ($options['message'] ?? '') : '';
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('WP Skill OOP Basic', 'wp-skill-oop-basic'); ?></h1>
            <form method="post" action="options.php">
                <?php settings_fields('wp_skill_oop_basic'); ?>
                <?php wp_nonce_field('wp_skill_oop_basic-options'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="wp-skill-oop-message"><?php echo esc_html__('訊息', 'wp-skill-oop-basic'); ?></label>
                        </th>
                        <td>
                            <input id="wp-skill-oop-message" class="regular-text" type="text" name="<?php echo esc_attr(OPTION_NAME); ?>[message]" value="<?php echo esc_attr($message); ?>" />
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

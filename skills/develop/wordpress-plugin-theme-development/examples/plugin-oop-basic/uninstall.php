<?php
/**
 * Uninstall cleanup.
 */

declare(strict_types=1);

namespace WpSkill\OopBasic;

if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('wp_skill_oop_basic_options');

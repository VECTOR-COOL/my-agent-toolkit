<?php
/**
 * Dynamic block render callback.
 *
 * @var array<string,mixed> $attributes Block attributes.
 */

if (! defined('ABSPATH')) {
    exit;
}

$count = isset($attributes['count']) ? absint($attributes['count']) : 3;
$count = max(1, min(6, $count));

$query = new WP_Query(
    [
        'post_type'           => 'post',
        'post_status'         => 'publish',
        'posts_per_page'      => $count,
        'ignore_sticky_posts' => true,
        'no_found_rows'       => true,
    ]
);

if ($query->have_posts()) {
    echo '<ul class="wp-skill-latest-posts">';
    while ($query->have_posts()) {
        $query->the_post();
        echo '<li><a href="' . esc_url(get_permalink()) . '">' . esc_html(get_the_title()) . '</a></li>';
    }
    echo '</ul>';
} else {
    echo '<p>' . esc_html__('目前沒有文章。', 'wp-skill-block-dynamic-basic') . '</p>';
}

wp_reset_postdata();

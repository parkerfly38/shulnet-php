<?php
/**
 * Plugin Name: ShulNet Banner Feed
 * Plugin URI: https://github.com/yourusername/shulnet-banner-feed
 * Description: Displays banner messages from ShulNet API on your WordPress site
 * Version: 1.0.0
 * Author: ShulNet
 * Author URI: https://shulnet.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: shulnet-banner-feed
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SHULNET_BANNER_VERSION', '1.0.0');
define('SHULNET_BANNER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SHULNET_BANNER_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include plugin files
require_once SHULNET_BANNER_PLUGIN_DIR . 'includes/class-shulnet-banner-api.php';
require_once SHULNET_BANNER_PLUGIN_DIR . 'includes/class-shulnet-banner-widget.php';
require_once SHULNET_BANNER_PLUGIN_DIR . 'includes/class-shulnet-banner-shortcode.php';
require_once SHULNET_BANNER_PLUGIN_DIR . 'admin/class-shulnet-banner-admin.php';

/**
 * Initialize the plugin
 */
function shulnet_banner_init() {
    // Initialize admin page
    if (is_admin()) {
        new ShulNet_Banner_Admin();
    }
    
    // Register widget
    register_widget('ShulNet_Banner_Widget');
    
    // Initialize shortcode
    new ShulNet_Banner_Shortcode();
}
add_action('plugins_loaded', 'shulnet_banner_init');

/**
 * Activation hook
 */
function shulnet_banner_activate() {
    // Set default options
    $default_options = array(
        'api_url' => '',
        'api_key' => '',
        'audience' => 'all',
        'cache_duration' => 300, // 5 minutes
        'auto_display' => false,
        'display_position' => 'top',
    );
    
    if (!get_option('shulnet_banner_settings')) {
        add_option('shulnet_banner_settings', $default_options);
    }
}
register_activation_hook(__FILE__, 'shulnet_banner_activate');

/**
 * Deactivation hook
 */
function shulnet_banner_deactivate() {
    // Clean up transients
    delete_transient('shulnet_banners_cache');
}
register_deactivation_hook(__FILE__, 'shulnet_banner_deactivate');

/**
 * Enqueue plugin styles and scripts
 */
function shulnet_banner_enqueue_assets() {
    wp_enqueue_style(
        'shulnet-banner-styles',
        SHULNET_BANNER_PLUGIN_URL . 'assets/css/banners.css',
        array(),
        SHULNET_BANNER_VERSION
    );
    
    wp_enqueue_script(
        'shulnet-banner-script',
        SHULNET_BANNER_PLUGIN_URL . 'assets/js/banners.js',
        array('jquery'),
        SHULNET_BANNER_VERSION,
        true
    );
}
add_action('wp_enqueue_scripts', 'shulnet_banner_enqueue_assets');

/**
 * Auto-display banners if enabled
 */
function shulnet_banner_auto_display() {
    $options = get_option('shulnet_banner_settings');
    
    if (isset($options['auto_display']) && $options['auto_display']) {
        $position = isset($options['display_position']) ? $options['display_position'] : 'top';
        
        if ($position === 'top') {
            echo do_shortcode('[shulnet_banners]');
        }
    }
}
add_action('wp_body_open', 'shulnet_banner_auto_display');

/**
 * Display banners at bottom if configured
 */
function shulnet_banner_auto_display_bottom() {
    $options = get_option('shulnet_banner_settings');
    
    if (isset($options['auto_display']) && $options['auto_display']) {
        $position = isset($options['display_position']) ? $options['display_position'] : 'top';
        
        if ($position === 'bottom') {
            echo do_shortcode('[shulnet_banners]');
        }
    }
}
add_action('wp_footer', 'shulnet_banner_auto_display_bottom');

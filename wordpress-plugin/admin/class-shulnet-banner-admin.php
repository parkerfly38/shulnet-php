<?php
/**
 * ShulNet Banner Admin Settings Class
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class ShulNet_Banner_Admin {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_post_shulnet_test_connection', array($this, 'test_connection'));
        add_action('admin_post_shulnet_clear_cache', array($this, 'clear_cache'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_options_page(
            __('ShulNet Banner Settings', 'shulnet-banner-feed'),
            __('ShulNet Banners', 'shulnet-banner-feed'),
            'manage_options',
            'shulnet-banner-settings',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting('shulnet_banner_settings_group', 'shulnet_banner_settings', array(
            'sanitize_callback' => array($this, 'sanitize_settings'),
        ));
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        $sanitized['api_url'] = isset($input['api_url']) ? esc_url_raw(trim($input['api_url'])) : '';
        $sanitized['api_key'] = isset($input['api_key']) ? sanitize_text_field($input['api_key']) : '';
        $sanitized['audience'] = isset($input['audience']) ? sanitize_text_field($input['audience']) : 'all';
        $sanitized['cache_duration'] = isset($input['cache_duration']) ? absint($input['cache_duration']) : 300;
        $sanitized['auto_display'] = isset($input['auto_display']) ? (bool) $input['auto_display'] : false;
        $sanitized['display_position'] = isset($input['display_position']) ? sanitize_text_field($input['display_position']) : 'top';
        
        // Clear cache when settings are updated
        ShulNet_Banner_API::clear_cache();
        
        return $sanitized;
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        $options = get_option('shulnet_banner_settings');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <?php settings_errors('shulnet_banner_messages'); ?>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('shulnet_banner_settings_group');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="api_url"><?php esc_html_e('API URL', 'shulnet-banner-feed'); ?></label>
                        </th>
                        <td>
                            <input type="url" 
                                   id="api_url" 
                                   name="shulnet_banner_settings[api_url]" 
                                   value="<?php echo esc_attr($options['api_url'] ?? ''); ?>" 
                                   class="regular-text"
                                   placeholder="https://your-shulnet-instance.com">
                            <p class="description">
                                <?php esc_html_e('Enter the base URL of your ShulNet installation (without trailing slash)', 'shulnet-banner-feed'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="api_key"><?php esc_html_e('API Key', 'shulnet-banner-feed'); ?></label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="api_key" 
                                   name="shulnet_banner_settings[api_key]" 
                                   value="<?php echo esc_attr($options['api_key'] ?? ''); ?>" 
                                   class="regular-text">
                            <p class="description">
                                <?php esc_html_e('Enter your ShulNet API key for banner access', 'shulnet-banner-feed'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="audience"><?php esc_html_e('Target Audience', 'shulnet-banner-feed'); ?></label>
                        </th>
                        <td>
                            <select id="audience" name="shulnet_banner_settings[audience]">
                                <option value="all" <?php selected($options['audience'] ?? 'all', 'all'); ?>>
                                    <?php esc_html_e('All', 'shulnet-banner-feed'); ?>
                                </option>
                                <option value="members" <?php selected($options['audience'] ?? 'all', 'members'); ?>>
                                    <?php esc_html_e('Members', 'shulnet-banner-feed'); ?>
                                </option>
                                <option value="students" <?php selected($options['audience'] ?? 'all', 'students'); ?>>
                                    <?php esc_html_e('Students', 'shulnet-banner-feed'); ?>
                                </option>
                                <option value="parents" <?php selected($options['audience'] ?? 'all', 'parents'); ?>>
                                    <?php esc_html_e('Parents', 'shulnet-banner-feed'); ?>
                                </option>
                            </select>
                            <p class="description">
                                <?php esc_html_e('Select which audience banners should be displayed for', 'shulnet-banner-feed'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="cache_duration"><?php esc_html_e('Cache Duration (seconds)', 'shulnet-banner-feed'); ?></label>
                        </th>
                        <td>
                            <input type="number" 
                                   id="cache_duration" 
                                   name="shulnet_banner_settings[cache_duration]" 
                                   value="<?php echo esc_attr($options['cache_duration'] ?? 300); ?>" 
                                   min="0"
                                   class="small-text">
                            <p class="description">
                                <?php esc_html_e('How long to cache banner data (0 to disable caching)', 'shulnet-banner-feed'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <?php esc_html_e('Auto Display', 'shulnet-banner-feed'); ?>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" 
                                       id="auto_display" 
                                       name="shulnet_banner_settings[auto_display]" 
                                       value="1"
                                       <?php checked($options['auto_display'] ?? false, true); ?>>
                                <?php esc_html_e('Automatically display banners on all pages', 'shulnet-banner-feed'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="display_position"><?php esc_html_e('Display Position', 'shulnet-banner-feed'); ?></label>
                        </th>
                        <td>
                            <select id="display_position" name="shulnet_banner_settings[display_position]">
                                <option value="top" <?php selected($options['display_position'] ?? 'top', 'top'); ?>>
                                    <?php esc_html_e('Top of page', 'shulnet-banner-feed'); ?>
                                </option>
                                <option value="bottom" <?php selected($options['display_position'] ?? 'top', 'bottom'); ?>>
                                    <?php esc_html_e('Bottom of page', 'shulnet-banner-feed'); ?>
                                </option>
                            </select>
                            <p class="description">
                                <?php esc_html_e('Where to display banners when auto-display is enabled', 'shulnet-banner-feed'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(__('Save Settings', 'shulnet-banner-feed')); ?>
            </form>
            
            <hr>
            
            <h2><?php esc_html_e('Actions', 'shulnet-banner-feed'); ?></h2>
            
            <p>
                <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display: inline;">
                    <input type="hidden" name="action" value="shulnet_test_connection">
                    <?php wp_nonce_field('shulnet_test_connection'); ?>
                    <?php submit_button(__('Test API Connection', 'shulnet-banner-feed'), 'secondary', 'submit', false); ?>
                </form>
                
                <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display: inline; margin-left: 10px;">
                    <input type="hidden" name="action" value="shulnet_clear_cache">
                    <?php wp_nonce_field('shulnet_clear_cache'); ?>
                    <?php submit_button(__('Clear Cache', 'shulnet-banner-feed'), 'secondary', 'submit', false); ?>
                </form>
            </p>
            
            <hr>
            
            <h2><?php esc_html_e('Usage', 'shulnet-banner-feed'); ?></h2>
            <p><?php esc_html_e('You can display banners in several ways:', 'shulnet-banner-feed'); ?></p>
            <ul>
                <li><strong><?php esc_html_e('Auto Display:', 'shulnet-banner-feed'); ?></strong> <?php esc_html_e('Enable above to automatically show banners on all pages', 'shulnet-banner-feed'); ?></li>
                <li><strong><?php esc_html_e('Shortcode:', 'shulnet-banner-feed'); ?></strong> <code>[shulnet_banners]</code></li>
                <li><strong><?php esc_html_e('Widget:', 'shulnet-banner-feed'); ?></strong> <?php esc_html_e('Use the ShulNet Banners widget from Appearance > Widgets', 'shulnet-banner-feed'); ?></li>
                <li><strong><?php esc_html_e('PHP:', 'shulnet-banner-feed'); ?></strong> <code>&lt;?php echo do_shortcode('[shulnet_banners]'); ?&gt;</code></li>
            </ul>
            
            <p><?php esc_html_e('Shortcode attributes:', 'shulnet-banner-feed'); ?></p>
            <ul>
                <li><code>limit</code> - <?php esc_html_e('Limit the number of banners displayed', 'shulnet-banner-feed'); ?></li>
                <li><code>type</code> - <?php esc_html_e('Filter by banner type (info, warning, success, error)', 'shulnet-banner-feed'); ?></li>
            </ul>
            <p><?php esc_html_e('Example:', 'shulnet-banner-feed'); ?> <code>[shulnet_banners limit="3" type="info"]</code></p>
        </div>
        <?php
    }
    
    /**
     * Test API connection
     */
    public function test_connection() {
        check_admin_referer('shulnet_test_connection');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'shulnet-banner-feed'));
        }
        
        $options = get_option('shulnet_banner_settings');
        $result = ShulNet_Banner_API::test_connection($options['api_url'], $options['api_key']);
        
        if (is_wp_error($result)) {
            add_settings_error(
                'shulnet_banner_messages',
                'connection_failed',
                __('Connection failed: ', 'shulnet-banner-feed') . $result->get_error_message(),
                'error'
            );
        } else {
            add_settings_error(
                'shulnet_banner_messages',
                'connection_success',
                __('Connection successful!', 'shulnet-banner-feed'),
                'success'
            );
        }
        
        set_transient('settings_errors', get_settings_errors(), 30);
        
        wp_safe_redirect(add_query_arg('page', 'shulnet-banner-settings', admin_url('options-general.php')));
        exit;
    }
    
    /**
     * Clear cache
     */
    public function clear_cache() {
        check_admin_referer('shulnet_clear_cache');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'shulnet-banner-feed'));
        }
        
        ShulNet_Banner_API::clear_cache();
        
        add_settings_error(
            'shulnet_banner_messages',
            'cache_cleared',
            __('Cache cleared successfully!', 'shulnet-banner-feed'),
            'success'
        );
        
        set_transient('settings_errors', get_settings_errors(), 30);
        
        wp_safe_redirect(add_query_arg('page', 'shulnet-banner-settings', admin_url('options-general.php')));
        exit;
    }
}

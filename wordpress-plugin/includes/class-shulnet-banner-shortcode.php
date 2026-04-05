<?php
/**
 * ShulNet Banner Shortcode Class
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class ShulNet_Banner_Shortcode {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_shortcode('shulnet_banners', array($this, 'render_banners'));
    }
    
    /**
     * Render banners shortcode
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public function render_banners($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'limit' => 0,
            'type' => '', // Filter by type (info, warning, success, error)
        ), $atts);
        
        // Get banners from API
        $banners = ShulNet_Banner_API::get_banners();
        
        // Check for errors
        if (is_wp_error($banners)) {
            if (current_user_can('manage_options')) {
                return '<div class="shulnet-banner-error">' . 
                       '<strong>ShulNet Banner Error:</strong> ' . 
                       esc_html($banners->get_error_message()) . 
                       '</div>';
            }
            return '';
        }
        
        // No banners
        if (empty($banners)) {
            return '';
        }
        
        // Filter by type if specified
        if (!empty($atts['type'])) {
            $banners = array_filter($banners, function($banner) use ($atts) {
                return isset($banner['type']) && $banner['type'] === $atts['type'];
            });
        }
        
        // Limit banners if specified
        if ($atts['limit'] > 0) {
            $banners = array_slice($banners, 0, intval($atts['limit']));
        }
        
        // Generate HTML
        ob_start();
        ?>
        <div class="shulnet-banners-container">
            <?php foreach ($banners as $banner): ?>
                <?php echo $this->render_single_banner($banner); ?>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render a single banner
     *
     * @param array $banner
     * @return string
     */
    private function render_single_banner($banner) {
        $type = isset($banner['type']) ? esc_attr($banner['type']) : 'info';
        $title = isset($banner['title']) ? esc_html($banner['title']) : '';
        $message = isset($banner['message']) ? wp_kses_post($banner['message']) : '';
        $is_dismissible = isset($banner['is_dismissible']) && $banner['is_dismissible'];
        $action_url = isset($banner['action_url']) ? esc_url($banner['action_url']) : '';
        $action_text = isset($banner['action_text']) ? esc_html($banner['action_text']) : '';
        $banner_id = isset($banner['id']) ? intval($banner['id']) : 0;
        
        ob_start();
        ?>
        <div class="shulnet-banner shulnet-banner-<?php echo $type; ?>" 
             data-banner-id="<?php echo $banner_id; ?>"
             data-dismissible="<?php echo $is_dismissible ? 'true' : 'false'; ?>">
            
            <div class="shulnet-banner-content">
                <?php if ($title): ?>
                    <div class="shulnet-banner-title">
                        <?php echo $title; ?>
                    </div>
                <?php endif; ?>
                
                <div class="shulnet-banner-message">
                    <?php echo $message; ?>
                </div>
                
                <?php if ($action_url && $action_text): ?>
                    <div class="shulnet-banner-action">
                        <a href="<?php echo $action_url; ?>" class="shulnet-banner-button" target="_blank">
                            <?php echo $action_text; ?>
                        </a>
                    </div>
                <?php endif; ?>
            </div>
            
            <?php if ($is_dismissible): ?>
                <button class="shulnet-banner-dismiss" aria-label="<?php esc_attr_e('Dismiss banner', 'shulnet-banner-feed'); ?>">
                    <span aria-hidden="true">&times;</span>
                </button>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }
}

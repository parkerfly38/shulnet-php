<?php
/**
 * ShulNet Banner API Class
 * Handles API communication with ShulNet backend
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class ShulNet_Banner_API {
    
    /**
     * Fetch banners from the API
     *
     * @return array|WP_Error
     */
    public static function get_banners() {
        $options = get_option('shulnet_banner_settings');
        
        // Check if API URL and key are set
        if (empty($options['api_url']) || empty($options['api_key'])) {
            return new WP_Error('missing_config', __('API URL or API Key not configured', 'shulnet-banner-feed'));
        }
        
        $cache_duration = isset($options['cache_duration']) ? intval($options['cache_duration']) : 300;
        $cache_key = 'shulnet_banners_cache';
        
        // Try to get cached data
        $cached_data = get_transient($cache_key);
        if ($cached_data !== false) {
            return $cached_data;
        }
        
        // Build API URL
        $api_url = trailingslashit($options['api_url']) . 'api/public/banners';
        $audience = isset($options['audience']) ? $options['audience'] : 'all';
        
        // Add query parameters
        $api_url = add_query_arg('audience', $audience, $api_url);
        
        // Make API request
        $response = wp_remote_get($api_url, array(
            'headers' => array(
                'X-API-Key' => $options['api_key'],
                'Accept' => 'application/json',
            ),
            'timeout' => 15,
        ));
        
        // Check for errors
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        
        if ($response_code !== 200) {
            return new WP_Error(
                'api_error',
                sprintf(__('API returned error code: %d', 'shulnet-banner-feed'), $response_code)
            );
        }
        
        // Parse response
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('parse_error', __('Failed to parse API response', 'shulnet-banner-feed'));
        }
        
        if (!isset($data['banners'])) {
            return new WP_Error('invalid_response', __('Invalid API response format', 'shulnet-banner-feed'));
        }
        
        $banners = $data['banners'];
        
        // Cache the results
        if ($cache_duration > 0) {
            set_transient($cache_key, $banners, $cache_duration);
        }
        
        return $banners;
    }
    
    /**
     * Clear the banner cache
     */
    public static function clear_cache() {
        delete_transient('shulnet_banners_cache');
    }
    
    /**
     * Test API connection
     *
     * @param string $api_url
     * @param string $api_key
     * @return bool|WP_Error
     */
    public static function test_connection($api_url, $api_key) {
        $api_url = trailingslashit($api_url) . 'api/public/banners';
        
        $response = wp_remote_get($api_url, array(
            'headers' => array(
                'X-API-Key' => $api_key,
                'Accept' => 'application/json',
            ),
            'timeout' => 10,
        ));
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        
        if ($response_code !== 200) {
            return new WP_Error(
                'connection_failed',
                sprintf(__('Connection failed with status code: %d', 'shulnet-banner-feed'), $response_code)
            );
        }
        
        return true;
    }
}

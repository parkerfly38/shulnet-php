/**
 * ShulNet Banner Feed JavaScript
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        initBanners();
    });
    
    /**
     * Initialize banner functionality
     */
    function initBanners() {
        // Handle dismiss button clicks
        $('.shulnet-banner-dismiss').on('click', function() {
            dismissBanner($(this).closest('.shulnet-banner'));
        });
        
        // Auto-dismiss banners with duration
        $('.shulnet-banner').each(function() {
            var $banner = $(this);
            var duration = $banner.data('duration');
            
            if (duration && duration > 0) {
                setTimeout(function() {
                    if ($banner.data('dismissible') === true) {
                        dismissBanner($banner);
                    }
                }, duration * 1000);
            }
        });
        
        // Track banner views (if you want to implement tracking)
        trackBannerViews();
    }
    
    /**
     * Dismiss a banner
     */
    function dismissBanner($banner) {
        var bannerId = $banner.data('banner-id');
        
        // Add dismissing class for animation
        $banner.addClass('dismissing');
        
        // Store dismissed banner in localStorage
        if (bannerId) {
            var dismissedBanners = getDismissedBanners();
            if (!dismissedBanners.includes(bannerId)) {
                dismissedBanners.push(bannerId);
                localStorage.setItem('shulnet_dismissed_banners', JSON.stringify(dismissedBanners));
            }
        }
        
        // Remove banner after animation
        setTimeout(function() {
            $banner.remove();
            
            // If no more banners, remove container
            if ($('.shulnet-banner').length === 0) {
                $('.shulnet-banners-container').remove();
            }
        }, 300);
    }
    
    /**
     * Get dismissed banners from localStorage
     */
    function getDismissedBanners() {
        var dismissed = localStorage.getItem('shulnet_dismissed_banners');
        return dismissed ? JSON.parse(dismissed) : [];
    }
    
    /**
     * Track banner views
     */
    function trackBannerViews() {
        var dismissedBanners = getDismissedBanners();
        
        $('.shulnet-banner').each(function() {
            var bannerId = $(this).data('banner-id');
            
            // Hide if already dismissed
            if (bannerId && dismissedBanners.includes(bannerId)) {
                $(this).remove();
            }
        });
        
        // Remove container if no banners left
        if ($('.shulnet-banner').length === 0) {
            $('.shulnet-banners-container').remove();
        }
    }
    
    /**
     * Clear dismissed banners (utility function for debugging)
     */
    window.clearDismissedBanners = function() {
        localStorage.removeItem('shulnet_dismissed_banners');
        console.log('Dismissed banners cleared');
    };
    
})(jQuery);

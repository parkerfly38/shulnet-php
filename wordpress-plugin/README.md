# ShulNet Banner Feed WordPress Plugin

A WordPress plugin that displays banner messages from your ShulNet installation on your WordPress site.

## Features

- 🎨 Display customizable banner messages from ShulNet
- 📱 Responsive design with support for different banner types (info, warning, success, error)
- ⚡ Smart caching to reduce API calls
- 🎯 Target specific audiences (members, students, parents, or all)
- 🔧 Multiple display options: auto-display, shortcode, or widget
- 👋 Dismissible banners with localStorage persistence
- 🔐 Secure API key authentication

## Installation

### Method 1: Manual Installation

1. Download or clone this repository
2. Upload the `shulnet-banner-feed` folder to your WordPress `wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to Settings > ShulNet Banners to configure

### Method 2: ZIP Installation

1. Zip the `shulnet-banner-feed` folder
2. Go to WordPress Admin > Plugins > Add New
3. Click "Upload Plugin" and select the ZIP file
4. Click "Install Now" and then "Activate"

## Configuration

1. Navigate to **Settings > ShulNet Banners** in your WordPress admin
2. Enter your ShulNet configuration:
   - **API URL**: Your ShulNet installation URL (e.g., `https://your-site.com`)
   - **API Key**: Your ShulNet API key (generate this in your ShulNet admin panel)
   - **Target Audience**: Choose which audience to display banners for
   - **Cache Duration**: How long to cache banner data (in seconds)
   - **Auto Display**: Optionally display banners automatically on all pages
   - **Display Position**: Choose where to display banners (top or bottom)

3. Click "Test API Connection" to verify your settings
4. Save your settings

## Setting Up API Key in ShulNet

To use this plugin, you need to configure an API key in your ShulNet installation:

1. In your ShulNet Laravel application, add the following to your `.env` file:
   ```
   BANNER_API_KEY=your-secure-random-key-here
   ```

2. Alternatively, you can add this to `config/services.php`:
   ```php
   'banner_api_key' => env('BANNER_API_KEY'),
   ```

3. Generate a secure random key using:
   ```bash
   php -r "echo bin2hex(random_bytes(32));"
   ```

## Usage

### Auto Display

Enable "Auto Display" in settings to automatically show banners on all pages at your chosen position (top or bottom).

### Shortcode

Use the `[shulnet_banners]` shortcode anywhere in your content:

```
[shulnet_banners]
```

**Shortcode Attributes:**

- `limit` - Limit the number of banners displayed
- `type` - Filter by banner type (info, warning, success, error)

**Examples:**

```
[shulnet_banners limit="3"]
[shulnet_banners type="warning"]
[shulnet_banners limit="2" type="info"]
```

### Widget

1. Go to **Appearance > Widgets**
2. Find the "ShulNet Banners" widget
3. Drag it to your desired widget area
4. Configure the title (optional)
5. Save

### PHP Template

Add to your theme template files:

```php
<?php echo do_shortcode('[shulnet_banners]'); ?>
```

## Banner Types

The plugin supports four banner types with distinct styling:

- **Info** (blue) - General information
- **Success** (green) - Success messages or positive updates
- **Warning** (yellow) - Important warnings or notices
- **Error** (red) - Critical alerts or error messages

## Caching

The plugin caches banner data to reduce API calls and improve performance:

- Default cache duration: 300 seconds (5 minutes)
- You can adjust this in plugin settings
- Set to 0 to disable caching
- Use the "Clear Cache" button to manually clear the cache

## Dismissed Banners

When users dismiss banners:

- The dismissal is stored in the browser's localStorage
- Dismissed banners won't appear again on that browser
- Users can clear dismissed banners by clearing browser data
- Developers can clear via console: `clearDismissedBanners()`

## Customization

### Custom Styling

You can override the default styles by adding CSS to your theme:

```css
/* Example: Change info banner color */
.shulnet-banner-info {
    background-color: #your-color;
    border-left-color: #your-border-color;
    color: #your-text-color;
}
```

### Available CSS Classes

- `.shulnet-banners-container` - Container for all banners
- `.shulnet-banner` - Individual banner
- `.shulnet-banner-info` - Info type banner
- `.shulnet-banner-success` - Success type banner
- `.shulnet-banner-warning` - Warning type banner
- `.shulnet-banner-error` - Error type banner
- `.shulnet-banner-title` - Banner title
- `.shulnet-banner-message` - Banner message content
- `.shulnet-banner-action` - Action button container
- `.shulnet-banner-button` - Action button
- `.shulnet-banner-dismiss` - Dismiss button

## Troubleshooting

### Banners Not Showing

1. Check API URL and API Key in settings
2. Click "Test API Connection" to verify connectivity
3. Clear the cache using the "Clear Cache" button
4. Check browser console for JavaScript errors
5. Verify banners exist and are active in ShulNet admin

### API Connection Failed

1. Ensure ShulNet is accessible from your WordPress server
2. Verify the API key matches your ShulNet configuration
3. Check for firewall or security rules blocking the connection
4. Ensure SSL certificates are valid if using HTTPS

### Caching Issues

- Click "Clear Cache" in plugin settings
- Reduce cache duration for testing
- Check if your hosting provider has additional caching layers

## Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher
- Active ShulNet installation with banner feature
- Valid ShulNet API key

## Support

For issues related to:
- **Plugin functionality**: Check plugin settings and browser console
- **ShulNet API**: Consult ShulNet documentation
- **Banner creation**: Use ShulNet admin panel

## Changelog

### 1.0.0
- Initial release
- Banner display via shortcode, widget, and auto-display
- Multiple banner types support
- Caching functionality
- Dismissible banners with localStorage
- Admin settings page
- API connection testing

## License

GPL v2 or later

## Credits

Developed for ShulNet - Synagogue Management System

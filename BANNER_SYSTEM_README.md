# ShulNet Banner Message System

A comprehensive banner message system for ShulNet that allows administrators to create and manage banner messages that display to members when they log in or visit their dashboard.

## Features

### Core Features
- ✅ **Banner Management**: Create, edit, update, and delete banner messages through the admin interface
- ✅ **Multiple Banner Types**: Info, Warning, Success, and Error banners with distinct styling
- ✅ **Target Audiences**: Display banners to specific groups (members, students, parents, or all)
- ✅ **Scheduled Display**: Set start and end dates for banner visibility
- ✅ **Dismissible Banners**: Users can dismiss banners they've seen
- ✅ **Auto-Duration**: Banners automatically hide after a specified time
- ✅ **Action Buttons**: Add call-to-action buttons with custom URLs
- ✅ **Statistics Tracking**: Track views, clicks, and dismissals

### API Features
- ✅ **Authenticated API**: Mobile apps can fetch and interact with banners
- ✅ **Public API**: WordPress plugin integration via API key
- ✅ **Push Notifications**: Optional push notification support for mobile apps
- ✅ **RESTful Endpoints**: Full CRUD operations via API

### WordPress Integration
- ✅ **WordPress Plugin**: Ready-to-use plugin for displaying banners on WordPress sites
- ✅ **Multiple Display Options**: Shortcode, widget, or auto-display
- ✅ **Smart Caching**: Configurable caching to reduce API calls
- ✅ **Responsive Design**: Mobile-friendly banner display

## Installation & Setup

### 1. Run Database Migration

```bash
php artisan migrate
```

This will create:
- `banners` table - stores banner messages
- `banner_user` table - tracks user interactions with banners

### 2. Configure API Key for WordPress Plugin

Add to your `.env` file:

```env
BANNER_API_KEY=your-secure-random-key-here
```

Generate a secure key:

```bash
php -r "echo bin2hex(random_bytes(32));"
```

Or add to `config/services.php`:

```php
'banner_api_key' => env('BANNER_API_KEY'),
```

### 3. Set Up Routes (Already included)

The following routes are automatically registered:

**Admin Web Routes:**
- `GET /admin/banners` - List all banners
- `GET /admin/banners/create` - Create banner form
- `POST /admin/banners` - Store new banner
- `GET /admin/banners/{banner}/edit` - Edit banner form
- `PUT /admin/banners/{banner}` - Update banner
- `DELETE /admin/banners/{banner}` - Delete banner
- `POST /admin/banners/{banner}/toggle-active` - Toggle banner active status

**User API Routes (Authenticated):**
- `GET /api/member/banners` - Get active banners for logged-in user
- `POST /api/member/banners/{banner}/viewed` - Mark banner as viewed
- `POST /api/member/banners/{banner}/dismissed` - Dismiss a banner
- `POST /api/member/banners/{banner}/clicked` - Track banner click

**Admin API Routes (Admin Only):**
- `GET /api/banners/push-notifications` - Get banners pending push notification
- `POST /api/banners/{banner}/push-notification-sent` - Mark push notification as sent
- `GET /api/banners/{banner}/statistics` - Get banner statistics

**Public API Route (API Key Required):**
- `GET /api/public/banners` - Get active banners (for WordPress plugin)

## Usage

### Creating Banners (Admin)

1. Navigate to **Admin Dashboard > Banners**
2. Click **Create New Banner**
3. Fill in banner details:
   - **Title**: Short headline for the banner
   - **Message**: Main banner content (HTML supported)
   - **Type**: Choose info, warning, success, or error
   - **Target Audience**: Select who should see the banner
   - **Start Date**: When the banner should start displaying
   - **End Date**: (Optional) When the banner should stop displaying
   - **Display Duration**: How long (in seconds) the banner shows
   - **Options**: 
     - Is Active
     - Is Dismissible
     - Show on Login
     - Show on Dashboard
     - Send as Push Notification
   - **Action Button**: (Optional) Add a call-to-action button
4. Click **Save**

### Viewing Banners (Members)

Banners automatically display:
- On the member dashboard (if enabled)
- On login (if enabled)
- In mobile apps via API

Users can:
- View banner messages
- Dismiss dismissible banners
- Click action buttons (tracked for statistics)

### Banner Types

#### Info Banner (Blue)
General information or announcements
```php
'type' => 'info'
```

#### Success Banner (Green)
Positive updates or confirmations
```php
'type' => 'success'
```

#### Warning Banner (Yellow)
Important notices or warnings
```php
'type' => 'warning'
```

#### Error Banner (Red)
Critical alerts or urgent messages
```php
'type' => 'error'
```

### Target Audiences

- **Members**: Display to congregation members
- **Students**: Display to students (school feature)
- **Parents**: Display to parents (school feature)
- **All**: Display to everyone

### Banner Statistics

View banner performance:
- **View Count**: How many times the banner was viewed
- **Click Count**: How many times the action button was clicked
- **Dismiss Count**: How many times users dismissed the banner
- **Click-Through Rate**: Percentage of views that resulted in clicks
- **Dismiss Rate**: Percentage of views that were dismissed

Access via API:
```bash
GET /api/banners/{banner}/statistics
Authorization: Bearer {your_token}
```

## API Documentation

### Get Active Banners for User

```http
GET /api/member/banners?context=dashboard
Authorization: Bearer {your_token}
```

**Query Parameters:**
- `context` - Optional: `login`, `dashboard`, or `all`

**Response:**
```json
{
  "banners": [
    {
      "id": 1,
      "title": "Welcome!",
      "message": "Welcome to our community.",
      "type": "info",
      "display_duration_seconds": 10,
      "is_dismissible": true,
      "action_url": "https://example.com",
      "action_text": "Learn More",
      "start_date": "2026-03-17T00:00:00Z",
      "end_date": null
    }
  ],
  "count": 1
}
```

### Mark Banner as Viewed

```http
POST /api/member/banners/{bannerId}/viewed
Authorization: Bearer {your_token}
```

### Mark Banner as Dismissed

```http
POST /api/member/banners/{bannerId}/dismissed
Authorization: Bearer {your_token}
```

### Mark Banner as Clicked

```http
POST /api/member/banners/{bannerId}/clicked
Authorization: Bearer {your_token}
```

### Public API (WordPress)

```http
GET /api/public/banners?audience=all
X-API-Key: {your_api_key}
```

**Query Parameters:**
- `audience` - Optional: `members`, `students`, `parents`, or `all`

## WordPress Plugin Integration

### Installation

1. Copy the `wordpress-plugin` folder to your WordPress plugins directory
2. Rename it to `shulnet-banner-feed`
3. Activate the plugin in WordPress admin
4. Configure in **Settings > ShulNet Banners**

### Configuration

- **API URL**: Your ShulNet installation URL
- **API Key**: The BANNER_API_KEY from your `.env`
- **Target Audience**: Which audience to display
- **Cache Duration**: How long to cache (seconds)
- **Auto Display**: Automatically show on all pages
- **Display Position**: Top or bottom of page

### Display Options

**Shortcode:**
```
[shulnet_banners]
[shulnet_banners limit="3"]
[shulnet_banners type="warning"]
```

**Widget:**
Use "ShulNet Banners" widget in Appearance > Widgets

**PHP Template:**
```php
<?php echo do_shortcode('[shulnet_banners]'); ?>
```

See `wordpress-plugin/README.md` for full documentation.

## Mobile App Integration

### React Native Example

```javascript
import axios from 'axios';

// Get banners
const getBanners = async (token) => {
  const response = await axios.get(
    'https://your-site.com/api/member/banners',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      params: {
        context: 'dashboard'
      }
    }
  );
  return response.data.banners;
};

// Mark as viewed
const markViewed = async (token, bannerId) => {
  await axios.post(
    `https://your-site.com/api/member/banners/${bannerId}/viewed`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
};

// Mark as dismissed
const dismissBanner = async (token, bannerId) => {
  await axios.post(
    `https://your-site.com/api/member/banners/${bannerId}/dismissed`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
};
```

## Push Notifications

Banners can optionally be sent as push notifications to mobile apps.

### Setup

1. Enable "Send as Push Notification" when creating a banner
2. Implement a scheduled job to check for pending push notifications:

```php
// In app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        // Get pending push notification banners
        $banners = Banner::active()
            ->where('send_as_push_notification', true)
            ->whereNull('push_notification_sent_at')
            ->where('start_date', '<=', now())
            ->get();
        
        foreach ($banners as $banner) {
            // Send push notification using your preferred service
            // (Firebase, OneSignal, etc.)
            
            // Mark as sent
            $banner->update([
                'push_notification_sent_at' => now()
            ]);
        }
    })->everyMinute();
}
```

### API Endpoints

```http
GET /api/banners/push-notifications
Authorization: Bearer {admin_token}
```

```http
POST /api/banners/{banner}/push-notification-sent
Authorization: Bearer {admin_token}
```

## Model Usage Examples

### Get Active Banners for a User

```php
use App\Models\Banner;

// Get banners for user on dashboard
$banners = Banner::getForUser($user, 'dashboard');

// Get banners for user on login
$banners = Banner::getForUser($user, 'login');
```

### Query Scopes

```php
// Active banners only
$banners = Banner::active()->get();

// For specific audience
$banners = Banner::forAudience('members')->get();

// Show on login
$banners = Banner::showOnLogin()->get();

// Show on dashboard
$banners = Banner::showOnDashboard()->get();

// Not seen by user
$banners = Banner::notSeenBy($user)->get();

// Not dismissed by user
$banners = Banner::notDismissedBy($user)->get();
```

### Track Interactions

```php
$banner = Banner::find(1);
$user = auth()->user();

// Mark as viewed
$banner->markAsViewedBy($user);

// Mark as dismissed
$banner->markAsDismissedBy($user);

// Mark as clicked
$banner->markAsClickedBy($user);
```

### Check if Active

```php
$banner = Banner::find(1);

if ($banner->isCurrentlyActive()) {
    // Banner is active and should be displayed
}
```

## Database Schema

### banners Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| title | string | Banner title |
| message | text | Banner message content |
| type | string | Banner type (info, warning, success, error) |
| target_audience | string | Target audience (members, students, parents, all) |
| start_date | datetime | When banner becomes active |
| end_date | datetime | When banner expires (nullable) |
| display_duration_seconds | integer | How long to show (default: 10) |
| is_active | boolean | Is banner active |
| is_dismissible | boolean | Can users dismiss it |
| show_on_login | boolean | Show on login |
| show_on_dashboard | boolean | Show on dashboard |
| send_as_push_notification | boolean | Send as push notification |
| push_notification_sent_at | datetime | When push was sent |
| push_notification_data | json | Additional push data |
| action_url | string | Action button URL |
| action_text | string | Action button text |
| view_count | integer | Number of views |
| click_count | integer | Number of clicks |
| dismiss_count | integer | Number of dismissals |
| created_by | bigint | User who created banner |

### banner_user Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| banner_id | bigint | Banner reference |
| user_id | bigint | User reference |
| viewed | boolean | Has user viewed |
| dismissed | boolean | Has user dismissed |
| clicked | boolean | Has user clicked |
| viewed_at | timestamp | When viewed |
| dismissed_at | timestamp | When dismissed |
| clicked_at | timestamp | When clicked |

## Security Considerations

1. **API Key Security**: Keep your BANNER_API_KEY secure and don't commit it to version control
2. **Input Validation**: All banner creation/updates are validated
3. **Authorization**: Admin-only access for banner management
4. **XSS Protection**: Message content is sanitized in the frontend
5. **Rate Limiting**: Consider adding rate limiting for API endpoints

## Troubleshooting

### Banners Not Showing

1. Check if banner is active: `is_active = true`
2. Verify start/end dates are correct
3. Ensure target audience matches user
4. Check if user has dismissed the banner
5. Verify `show_on_dashboard` or `show_on_login` is enabled

### WordPress Plugin Issues

1. Verify API URL and API key in settings
2. Test API connection in plugin settings
3. Clear cache if banners aren't updating
4. Check browser console for JavaScript errors

### API Authentication

1. Ensure valid Bearer token or API key
2. Check token hasn't expired
3. Verify user has appropriate permissions

## Future Enhancements

Potential features for future development:

- Banner templates library
- A/B testing for banners
- Geographic targeting
- Device-specific banners (mobile vs desktop)
- Banner categories/tags
- Rich media support (images, videos)
- Multi-language support
- Banner scheduling wizard
- Advanced analytics dashboard
- Email integration (send banner as email)

## Support

For questions or issues:
- Check the WordPress plugin README
- Review API documentation above
- Test API connections using provided endpoints
- Check Laravel logs for errors

## License

This banner system is part of ShulNet and follows the same license as the main project.

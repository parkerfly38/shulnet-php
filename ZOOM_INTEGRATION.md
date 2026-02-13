# Zoom Integration for ShulNet

## Overview

Zoom integration has been successfully implemented for ShulNet to automatically create and manage Zoom meetings for online events and board/committee meetings.

## Features Implemented

### 1. **Automatic Zoom Meeting Creation**
   - **Events**: When an event is marked as `online`, a Zoom meeting is automatically created
   - **Board/Committee Meetings**: When a meeting is created without a meeting link (or with a non-Zoom link), a Zoom meeting is automatically created if Zoom is enabled
   - Meeting details (title, date, duration, agenda) are synced with Zoom

### 2. **Automatic RSVP Registration**
   - When someone RSVPs to an online event with Zoom integration enabled, they are automatically registered in the Zoom meeting
   - Attendees receive Zoom registration confirmation emails directly from Zoom

### 3. **Automatic Updates & Deletion**
   - When event/meeting details change (title, date, description), the Zoom meeting is automatically updated
   - When an event/meeting is deleted, the associated Zoom meeting is also deleted
   - When an event changes from online to offline, the Zoom meeting is removed

## Configuration

### Step 1: Create a Zoom Server-to-Server OAuth App

1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/)
2. Click **Develop** → **Build App**
3. Choose **Server-to-Server OAuth**
4. Fill in the required information:
   - App Name: "ShulNet Integration"
   - Company Name: Your organization name
   - Developer Contact: Your email
5. On the **App Credentials** page, note down:
   - Account ID
   - Client ID
   - Client Secret

### Step 2: Configure Zoom Scopes

Ensure your Zoom app has the following scopes:
- `meeting:write:admin` - Create and manage meetings
- `meeting:write:meeting` - Update meetings
- `user:read:admin` - Read user information

### Step 3: Environment Configuration

Add the following to your `.env` file:

```env
ZOOM_ACCOUNT_ID=your-account-id
ZOOM_CLIENT_ID=your-client-id
ZOOM_CLIENT_SECRET=your-client-secret
ZOOM_USER_ID=me
```

### Step 4: Enable Zoom Integration in Settings

The Zoom settings are now available in your application's settings table. You can enable/disable Zoom integration through the admin interface by setting:

- `zoom_enabled` = `true`
- `zoom_account_id` = Your Zoom Account ID
- `zoom_client_id` = Your Zoom Client ID  
- `zoom_client_secret` = Your Zoom Client Secret
- `zoom_user_id` = `me` (or specific Zoom user ID)

## Database Changes

### New Fields in `event` Table:
- `zoom_meeting_id` - Zoom meeting ID
- `zoom_join_url` - Public join URL for attendees
- `zoom_start_url` - Host start URL
- `zoom_password` - Meeting password
- `zoom_registration_url` - Registration URL (if registration is enabled)

### New Fields in `meetings` Table:
- `zoom_meeting_id` - Zoom meeting ID
- `zoom_join_url` - Public join URL for attendees
- `zoom_start_url` - Host start URL
- `zoom_password` - Meeting password

### New Settings:
- `zoom_enabled` - Enable/disable Zoom integration
- `zoom_account_id` - Zoom Account ID
- `zoom_client_id` - Zoom Client ID
- `zoom_client_secret` - Zoom Client Secret
- `zoom_user_id` - Zoom User ID

## New Files Created

1. **`app/Services/ZoomService.php`**
   - Core service for Zoom API integration
   - Handles meeting creation, updates, deletion
   - Manages RSVP/registrant addition
   - OAuth token management

2. **`app/Observers/EventObserver.php`**
   - Automatically creates Zoom meetings when events are marked as online
   - Updates Zoom meetings when event details change
   - Deletes Zoom meetings when events are deleted or changed to offline

3. **`app/Observers/MeetingObserver.php`**
   - Automatically creates Zoom meetings for board/committee meetings
   - Updates Zoom meetings when meeting details change
   - Deletes Zoom meetings when meetings are deleted

4. **Migrations:**
   - `2026_02_13_121402_add_zoom_fields_to_event_table.php`
   - `2026_02_13_121404_add_zoom_fields_to_meetings_table.php`
   - `2026_02_13_121720_add_zoom_settings_to_settings_table.php`

## Modified Files

1. **`config/services.php`**
   - Added Zoom configuration section

2. **`app/Models/Event.php`**
   - Added Zoom fields to fillable array

3. **`app/Models/Meeting.php`**
   - Added Zoom fields to fillable array

4. **`app/Http/Controllers/EventRSVPController.php`**
   - Implemented automatic Zoom registration when RSVPs are created
   - Added index and show methods for API access

5. **`app/Providers/AppServiceProvider.php`**
   - Registered Event and Meeting observers

## How It Works

### For Events:

1. **Creating an Online Event:**
   - Set `online` = `true` when creating an event
   - If Zoom is enabled, a Zoom meeting is automatically created
   - The `zoom_meeting_id` and related URLs are stored in the event record
   - The `online_url` field is automatically populated with the Zoom join URL

2. **Event RSVPs:**
   - When someone RSVPs to an online event
   - If the event has a Zoom meeting, the attendee is automatically registered
   - They receive Zoom registration confirmation directly from Zoom

3. **Updating Events:**
   - Changes to event name, dates, or description automatically sync to Zoom
   - Changing event from online to offline deletes the Zoom meeting
   - Changing event from offline to online creates a new Zoom meeting

### For Board/Committee Meetings:

1. **Creating Meetings:**
   - When a meeting is created, if Zoom is enabled
   - A Zoom meeting is automatically created
   - The `meeting_link` is populated with the Zoom join URL

2. **Updating Meetings:**
   - Changes to meeting title, date, or agenda sync to Zoom

## API Integration Points

The Zoom integration uses the following Zoom API endpoints:

- **OAuth Token:** `POST /oauth/token`
- **Create Meeting:** `POST /users/{userId}/meetings`
- **Update Meeting:** `PATCH /meetings/{meetingId}`
- **Delete Meeting:** `DELETE /meetings/{meetingId}`
- **Add Registrant:** `POST /meetings/{meetingId}/registrants`

## Error Handling

- All Zoom API errors are logged to the Laravel log
- Failed Zoom operations don't prevent event/meeting creation
- The system gracefully handles Zoom being disabled or misconfigured

## Testing

To test the Zoom integration:

1. Enable Zoom in settings
2. Create an event and mark it as `online`
3. Check that `zoom_meeting_id` and URLs are populated
4. Create an RSVP for the event
5. Check Zoom dashboard to verify attendee was registered
6. Update the event and verify changes sync to Zoom
7. Delete the event and verify the Zoom meeting is removed

## Security Notes

- Zoom credentials are stored in environment variables
- Access tokens are generated on-demand and not persisted
- Server-to-Server OAuth doesn't require user intervention
- All API calls are logged for audit purposes

## Future Enhancements

Potential improvements that could be added:

- Store `zoom_registrant_id` in RSVP records for tracking
- Add Zoom recording management
- Implement webhook handlers for Zoom events
- Add meeting analytics from Zoom
- Support for Zoom webinars (different from meetings)
- Custom meeting settings per event type

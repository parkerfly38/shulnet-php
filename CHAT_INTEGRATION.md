# Chat Integration

This application supports embedding an external chat application using an iframe, with two display modes: popup widget or full-page view.

## Configuration

Add the following environment variables to your `.env` file:

```env
# Enable or disable the chat feature
CHAT_ENABLED=true

# URL of the chat application to embed
CHAT_URL=http://localhost:5001

# Display mode: 'popup' or 'fullpage'
# - popup: Floating widget in bottom-right corner (AdminChatWidget component)
# - fullpage: Dedicated page at /chat route
CHAT_MODE=fullpage

# Title shown in the chat interface
CHAT_TITLE="Support Chat"
```

See `.env.chat.example` for additional documentation and examples.

## Display Modes

### Full-Page Mode (Recommended)

When `CHAT_MODE=fullpage`:
- Chat is available at `/chat` route
- Replaces the main content area in the application layout
- Maintains sidebar and header navigation
- Better for longer conversations and complex interactions
- Automatically adapts to dark/light theme

**Usage:**
1. Set `CHAT_MODE=fullpage` in `.env`
2. Navigate to `/chat` in your application
3. Or add a navigation link to the chat page

### Popup Mode

When `CHAT_MODE=popup`:
- Floating chat widget appears in the bottom-right corner
- Click the message icon to expand the chat window
- Appears as an overlay on top of current page
- Good for quick messages without navigation away from current page

**Usage:**
1. Set `CHAT_MODE=popup` in `.env`
2. Add `<AdminChatWidget />` to your layout (if not already present)
3. Widget will automatically appear when chat is enabled

## Implementation Details

### Backend

**Configuration:**
- `config/services.php` - Chat configuration with defaults
- Environment variables override defaults

**Controller:**
- `app/Http/Controllers/ChatController.php` - Handles the `/chat` route
- Passes chat configuration to the frontend

**Middleware:**
- `app/Http/Middleware/HandleInertiaRequests.php` - Shares chat config globally
- Makes `chatConfig` available to all Inertia pages via `usePage().props`

**Routes:**
- `routes/web.php` - Defines the `/chat` route (authenticated users only)

### Frontend

**Components:**
- `resources/js/components/chat-frame.tsx` - Reusable iframe component with theme detection
- `resources/js/components/admin-chat-widget.tsx` - Popup widget (shown when mode is 'popup')
- `resources/js/pages/chat.tsx` - Full-page chat view (shown at `/chat` route)

**Types:**
- `resources/js/types/index.d.ts` - TypeScript definitions for `ChatConfig`
- Available in `SharedData` interface

**Features:**
- Automatic dark/light theme detection and synchronization
- Theme passed to iframe via URL parameter: `?theme=dark` or `?theme=light`
- Responsive layout
- Graceful handling when chat is disabled

## Theme Synchronization

The chat iframe automatically receives the current theme as a URL parameter:
- Light mode: `http://localhost:5001?theme=light`
- Dark mode: `http://localhost:5001?theme=dark`

Your chat application can read this parameter and adjust its styling accordingly.

## Adding Navigation Link

To add a chat link to your navigation, use the route helper:

```tsx
import { router } from '@inertiajs/react';

// Navigate to chat
router.visit('/chat');

// Or use Link component
<Link href="/chat">Chat</Link>
```

The navigation should conditionally render based on chat being enabled:

```tsx
import { usePage } from '@inertiajs/react';
import { type ChatConfig } from '@/types';

const { chatConfig } = usePage().props as { chatConfig: ChatConfig };

{chatConfig?.enabled && chatConfig.mode === 'fullpage' && (
    <NavItem href="/chat" icon={MessageCircle}>
        {chatConfig.title}
    </NavItem>
)}
```

## Security Considerations

1. **CORS:** Ensure your chat application allows embedding from your application's domain
2. **Authentication:** The `/chat` route requires authentication (`auth`, `verified` middleware)
3. **Content Security Policy:** Update CSP headers to allow iframe embedding from `CHAT_URL`
4. **HTTPS:** Use HTTPS for production chat URLs

## Troubleshooting

### Chat not appearing

1. Check `CHAT_ENABLED=true` in `.env`
2. Verify `CHAT_URL` is accessible
3. Check browser console for errors
4. Verify your chat application allows iframe embedding

### Theme not syncing

1. Ensure your chat application reads the `theme` URL parameter
2. Check that theme observer is working (browser console)
3. Verify no CSP blocking iframe communication

### Layout issues in full-page mode

1. Adjust height in `chat.tsx` if needed: `h-[calc(100vh-4rem)]`
2. Check for conflicting CSS classes
3. Ensure parent containers allow flex layout

## Example Chat Application

Your chat application should:
1. Accept and read the `theme` query parameter
2. Allow iframe embedding (set appropriate CSP headers)
3. Implement message handling and display
4. Return valid HTML

Minimal example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat</title>
    <script>
        // Read theme from URL
        const params = new URLSearchParams(window.location.search);
        const theme = params.get('theme') || 'light';
        document.documentElement.classList.add(`theme-${theme}`);
    </script>
    <style>
        .theme-dark { background: #1a1a1a; color: #fff; }
        .theme-light { background: #fff; color: #000; }
    </style>
</head>
<body>
    <!-- Your chat interface here -->
</body>
</html>
```

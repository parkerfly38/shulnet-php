# Firebase Push Notifications Implementation Guide

This guide walks you through implementing Firebase Cloud Messaging (FCM) for push notifications in the ShulNet banner system.

## Overview

Firebase push notifications will allow banners to be sent as push notifications to mobile apps when the `send_as_push_notification` flag is enabled.

## Prerequisites

1. A Firebase project (create at https://console.firebase.google.com)
2. Firebase Admin SDK service account credentials
3. Mobile app with Firebase SDK integrated

## Step 1: Firebase Project Setup

### Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" or select existing project
3. Enable Cloud Messaging in your project
4. Add your iOS and Android apps to the project

### Get Service Account Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Save it securely (e.g., `storage/firebase/firebase-credentials.json`)
6. **Never commit this file to version control!**

## Step 2: Configure Laravel

### Add to `.env`

```env
FIREBASE_CREDENTIALS=/full/path/to/storage/firebase/firebase-credentials.json
# Or use base64 encoded credentials:
# FIREBASE_CREDENTIALS_BASE64=your_base64_encoded_json

# Alternative: Individual keys
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```


## Step 3: Mobile App Integration

### React Native / Expo Example

Install Firebase:

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

Request permission and register token:

```javascript
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

// Request permission
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
}

// Get FCM token and register with backend
async function registerDeviceToken(userToken) {
  try {
    const fcmToken = await messaging().getToken();
    
    await axios.post(
      'https://your-site.com/api/device-tokens/register',
      {
        token: fcmToken,
        device_type: Platform.OS === 'ios' ? 'ios' : 'android',
        device_name: await DeviceInfo.getDeviceName(),
        app_version: DeviceInfo.getVersion(),
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('Device token registered successfully');
  } catch (error) {
    console.error('Failed to register device token:', error);
  }
}

// Handle foreground notifications
messaging().onMessage(async remoteMessage => {
  console.log('Foreground notification:', remoteMessage);
  // Display notification to user
});

// Handle background/quit notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});

// Handle notification opened
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification opened:', remoteMessage);
  // Navigate to appropriate screen based on remoteMessage.data
});

// Check if app was opened from a notification
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from notification:', remoteMessage);
    }
  });

// Initialize on app start
export async function initializePushNotifications(userToken) {
  const hasPermission = await requestUserPermission();
  
  if (hasPermission) {
    await registerDeviceToken(userToken);
  }
}
```

## Step 4: Testing

### Test Command Line

```bash
# Send pending push notifications
php artisan banners:send-push-notifications

# Test with tinker
php artisan tinker
```

In tinker:

```php
// Create a test banner
$banner = \App\Models\Banner::create([
    'title' => 'Test Push',
    'message' => 'This is a test push notification',
    'type' => 'info',
    'target_audience' => 'all',
    'start_date' => now(),
    'send_as_push_notification' => true,
    'created_by' => 1,
]);

// Send immediately
$firebase = app(\App\Services\FirebaseService::class);
$users = \App\Models\User::whereHas('activeDeviceTokens')->get();
$results = $firebase->sendBannerNotification($banner, $users);
dd($results);
```

## Security Best Practices

1. **Never commit Firebase credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Validate device tokens** before storing
4. **Rate limit** device token registration endpoints
5. **Clean up inactive tokens** regularly
6. **Encrypt tokens** in database if storing sensitive data
7. **Monitor for abuse** (too many tokens per user)

## Troubleshooting

### Common Issues

1. **Invalid credentials**: Check Firebase credentials file path
2. **Token not registered**: Ensure mobile app is calling register endpoint
3. **Notifications not received**: Check device permissions and Firebase console
4. **Invalid token errors**: Tokens expire, implement refresh logic
5. **Quota exceeded**: Monitor Firebase usage in console

### Debug Commands

```bash
# Check device tokens
php artisan tinker
\App\Models\DeviceToken::count();
\App\Models\DeviceToken::active()->count();

# Check logs
\App\Models\PushNotificationLog::latest()->take(10)->get();

# Test Firebase connection
$firebase = app(\App\Services\FirebaseService::class);
$firebase->validateToken('test-token');
```

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Service account credentials secured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Command scheduled in production
- [ ] Mobile apps integrated with Firebase SDK
- [ ] Device token registration tested
- [ ] Push notifications sending successfully
- [ ] Monitoring and alerts configured
- [ ] Error handling tested
- [ ] Invalid token cleanup scheduled

## Additional Resources

- Firebase Admin SDK PHP: https://firebase-php.readthedocs.io/
- Firebase Console: https://console.firebase.google.com
- React Native Firebase: https://rnfirebase.io/
- FCM Documentation: https://firebase.google.com/docs/cloud-messaging

---

You now have a complete Firebase push notification system integrated with your banner system!

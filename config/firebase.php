<?php

return [
    'credentials' => env('FIREBASE_CREDENTIALS_BASE64')
        ? json_decode(base64_decode(env('FIREBASE_CREDENTIALS_BASE64')), true)
        : env('FIREBASE_CREDENTIALS'),
        'database_url' => env('FIREBASE_DATABASE_URL'),
        'project_id' => env('FIREBASE_PROJECT_ID'),
];
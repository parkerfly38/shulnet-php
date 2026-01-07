<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirm Your Subscription</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #6b46c1;">Confirm Your Subscription</h2>
    </div>

    <div style="background-color: #ffffff; padding: 20px;">
        @if($campaign->confirmation_content)
            {!! str_replace(['{member_name}', '{confirmation_url}'], [
                $member->first_name . ' ' . $member->last_name,
                '<a href="' . $confirmUrl . '" style="display: inline-block; background-color: #6b46c1; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Confirm Subscription</a>'
            ], $campaign->confirmation_content) !!}
        @else
            <p>Hello {{ $member->first_name }} {{ $member->last_name }},</p>
            
            <p>Thank you for subscribing to <strong>{{ $campaign->name }}</strong>!</p>
            
            <p>To complete your subscription and start receiving our emails, please confirm your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $confirmUrl }}" style="display: inline-block; background-color: #6b46c1; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                    Confirm Subscription
                </a>
            </div>
            
            <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b46c1;">{{ $confirmUrl }}</p>
            
            <p>If you didn't request this subscription, you can safely ignore this email.</p>
        @endif
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; text-align: center;">
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>

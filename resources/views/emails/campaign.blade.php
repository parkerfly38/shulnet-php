<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $campaignEmail->subject }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #6b46c1;">{{ $campaignEmail->subject }}</h2>
    </div>

    <div style="background-color: #ffffff; padding: 20px;">
        {!! str_replace('{member_name}', $member->first_name . ' ' . $member->last_name, $campaignEmail->content) !!}
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; text-align: center;">
        <p>You are receiving this email because you subscribed to {{ $campaign->name }}.</p>
        <p>
            <a href="{{ $unsubscribeUrl }}" style="color: #6b46c1; text-decoration: none;">
                Unsubscribe from this campaign
            </a>
        </p>
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>

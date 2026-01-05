<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Temporary Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Welcome to Our System</h2>
        <p>Hello {{ $user->name }},</p>
        <p>An administrator has created an account for you. Below are your login credentials:</p>
        
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #3490dc; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $user->email }}</p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e3e8ef; padding: 2px 6px; border-radius: 3px; font-size: 14px;">{{ $temporaryPassword }}</code></p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Important:</strong> For security reasons, please change this password immediately after your first login.</p>
        </div>

        <p>You can log in at: <a href="{{ url('/login') }}" style="color: #3490dc;">{{ url('/login') }}</a></p>

        <p style="color: #6c757d; font-size: 12px; margin-top: 30px;">
            If you did not expect this email or have any questions, please contact your administrator.
        </p>
    </div>

    <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>

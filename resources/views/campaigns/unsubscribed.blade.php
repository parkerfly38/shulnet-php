<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unsubscribed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
        }
        .info-icon {
            width: 60px;
            height: 60px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .info-icon svg {
            width: 30px;
            height: 30px;
            fill: white;
        }
        h1 {
            color: #1f2937;
            margin-bottom: 10px;
        }
        p {
            color: #6b7280;
            line-height: 1.6;
        }
        .campaign-name {
            font-weight: bold;
            color: #6b46c1;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="info-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
        </div>
        <h1>Successfully Unsubscribed</h1>
        <p>You have been unsubscribed from <span class="campaign-name">{{ $campaign->name }}</span>.</p>
        <p>You will no longer receive emails from this campaign.</p>
        <p style="margin-top: 30px; font-size: 14px;">If this was a mistake, please contact us to resubscribe.</p>
    </div>
</body>
</html>

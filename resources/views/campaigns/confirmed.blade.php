<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Subscription Confirmed</title>
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
        .success-icon {
            width: 60px;
            height: 60px;
            background-color: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .success-icon svg {
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
        <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
        </div>
        <h1>Subscription Confirmed!</h1>
        <p>Thank you for confirming your subscription to <span class="campaign-name">{{ $campaign->name }}</span>.</p>
        <p>You will now receive emails from this campaign.</p>
    </div>
</body>
</html>

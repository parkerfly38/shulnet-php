<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #1e40af;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .meeting-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #1e40af;
        }
        .detail-row {
            margin: 12px 0;
        }
        .label {
            font-weight: 600;
            color: #4b5563;
            display: inline-block;
            min-width: 120px;
        }
        .value {
            color: #1f2937;
        }
        .agenda {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .agenda-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .meeting-link {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">Meeting Invitation</h1>
    </div>
    
    <div class="content">
        <p>Dear {{ $member->first_name }} {{ $member->last_name }},</p>
        
        <p>You are invited to attend the following {{ class_basename($meeting->meetable_type) }} meeting:</p>
        
        <div class="meeting-details">
            <h2 style="margin-top: 0; color: #1e40af;">{{ $meeting->title }}</h2>
            
            <div class="detail-row">
                <span class="label">{{ class_basename($meeting->meetable_type) }}:</span>
                <span class="value">{{ $meeting->meetable->name }}</span>
            </div>
            
            <div class="detail-row">
                <span class="label">Date & Time:</span>
                <span class="value">{{ $meeting->meeting_date->format('l, F j, Y') }} at {{ $meeting->meeting_date->format('g:i A') }}</span>
            </div>
            
            @if($meeting->meeting_link)
            <div class="detail-row">
                <span class="label">Meeting Link:</span>
                <span class="value">
                    <a href="{{ $meeting->meeting_link }}" style="color: #1e40af;">Join Meeting</a>
                </span>
            </div>
            @endif
        </div>
        
        @if($meeting->agenda)
        <div class="agenda">
            <div class="agenda-title">Agenda:</div>
            <div style="white-space: pre-line; color: #374151;">{{ $meeting->agenda }}</div>
        </div>
        @endif
        
        @if($meeting->meeting_link)
        <div style="text-align: center;">
            <a href="{{ $meeting->meeting_link }}" class="meeting-link">Join Meeting</a>
        </div>
        @endif
        
        <p style="margin-top: 30px;">We look forward to your participation.</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>

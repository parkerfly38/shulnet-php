<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yahrzeit Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-top: 0;">Yahrzeit Reminder</h2>
        <p>Dear {{ $recipientName }},</p>
        
        <p>We want to remind you of the upcoming yahrzeit of your loved one:</p>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 5px; border-left: 4px solid #6b46c1; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #6b46c1;">{{ $yahrzeit->name }}</h3>
            @if($yahrzeit->hebrew_name)
                <p style="margin: 5px 0; font-style: italic; color: #666;">{{ $yahrzeit->hebrew_name }}</p>
            @endif
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 5px 0;"><strong>Hebrew Date:</strong> {{ $yahrzeit->hebrew_day_of_death }} {{ ['', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'][$yahrzeit->hebrew_month_of_death] ?? 'Unknown' }}</p>
                <p style="margin: 5px 0;"><strong>This Year (Gregorian):</strong> {{ $gregorianDate }}</p>
                <p style="margin: 5px 0;"><strong>Date of Passing:</strong> {{ $yahrzeit->date_of_death->format('F j, Y') }}</p>
            </div>

            @if($yahrzeit->observance_type)
                <div style="margin-top: 15px;">
                    <p style="margin: 5px 0;"><strong>Observance Type:</strong> 
                        <span style="background-color: #e3e8ef; padding: 3px 8px; border-radius: 3px; font-size: 13px;">
                            {{ ucfirst(str_replace('_', ' ', $yahrzeit->observance_type)) }}
                        </span>
                    </p>
                </div>
            @endif

            @if($yahrzeit->notes)
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 5px 0;"><strong>Notes:</strong></p>
                    <p style="margin: 5px 0; color: #666;">{{ $yahrzeit->notes }}</p>
                </div>
            @endif
        </div>

        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>Memorial Observance</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
                May their memory be a blessing. If you would like to arrange for memorial prayers or light a memorial candle, 
                please contact our office.
            </p>
        </div>

        <p style="margin-top: 30px;">With warm regards,</p>
        <p style="margin: 5px 0;">{{ config('app.name') }}</p>
    </div>

    <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 20px;">
        <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
</body>
</html>

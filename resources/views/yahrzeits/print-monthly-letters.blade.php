<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Yahrzeit Letters - {{ $hebrewMonth }}</title>
    <style>
        @page {
            margin: 1in;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
        }
        .letterhead {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .letterhead h1 {
            margin: 0;
            font-size: 24pt;
            color: #333;
        }
        .date {
            text-align: right;
            margin-bottom: 30px;
        }
        .recipient {
            margin-bottom: 30px;
        }
        .content {
            margin-bottom: 20px;
        }
        .yahrzeit-details {
            background-color: #f5f5f5;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #6b46c1;
        }
        .yahrzeit-details h3 {
            margin-top: 0;
            color: #6b46c1;
        }
        .yahrzeit-details p {
            margin: 8px 0;
        }
        .signature {
            margin-top: 50px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9pt;
            color: #666;
            padding: 10px;
            border-top: 1px solid #ccc;
        }
        .page-break {
            page-break-after: always;
        }
        .relationship-note {
            font-style: italic;
            color: #666;
            font-size: 11pt;
            margin-top: 5px;
        }
        .no-print {
            padding: 20px;
            background-color: #f0f0f0;
            margin-bottom: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .no-print button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
        }
        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <h2>Monthly Yahrzeit Letters - {{ $hebrewMonth }}</h2>
        <p>This document contains {{ count($lettersData) }} letter(s) for the current Hebrew month.</p>
        <button onclick="window.print()">Print All Letters</button>
        <button onclick="window.close()">Close</button>
    </div>

    @foreach($lettersData as $index => $letter)
    <div class="{{ $loop->last ? '' : 'page-break' }}">
        <div class="letterhead">
            <h1>{{ config('app.name') }}</h1>
            <p>Memorial Observance Reminder</p>
        </div>

        <div class="date">
            {{ now()->format('F j, Y') }}
        </div>

        <div class="recipient">
            <p>Dear {{ $letter['member']->first_name }} {{ $letter['member']->last_name }},</p>
            <p class="relationship-note">In memory of your {{ strtolower($letter['member']->pivot->relationship) }}</p>
        </div>

        <div class="content">
            <p>We want to remind you of the upcoming yahrzeit (anniversary of passing) of your beloved:</p>

            <div class="yahrzeit-details">
                <h3>{{ $letter['yahrzeit']->name }}</h3>
                @if($letter['yahrzeit']->hebrew_name)
                    <p><em>{{ $letter['yahrzeit']->hebrew_name }}</em></p>
                @endif
                
                <p><strong>Hebrew Date:</strong> {{ $letter['yahrzeit']->hebrew_day_of_death }} {{ ['', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'][$letter['yahrzeit']->hebrew_month_of_death] ?? 'Unknown' }}</p>
                
                <p><strong>This Year (Gregorian Calendar):</strong> {{ $letter['gregorianDate'] }}</p>
                
                <p><strong>Date of Passing:</strong> {{ $letter['yahrzeit']->date_of_death->format('F j, Y') }}</p>

                @if($letter['yahrzeit']->observance_type)
                    <p><strong>Observance Type:</strong> {{ ucfirst(str_replace('_', ' ', $letter['yahrzeit']->observance_type)) }}</p>
                @endif

                @if($letter['yahrzeit']->notes)
                    <p><strong>Notes:</strong><br>{{ $letter['yahrzeit']->notes }}</p>
                @endif
            </div>

            <p>We encourage you to remember your loved one during this special time. Please consider:</p>
            <ul>
                <li>Lighting a yahrzeit candle</li>
                <li>Attending services to recite Kaddish</li>
                <li>Making a charitable donation in their memory</li>
                <li>Studying Torah or performing acts of kindness in their honor</li>
            </ul>

            <p>May their memory continue to be a blessing to you and your family.</p>
        </div>

        <div class="signature">
            <p>With deepest sympathy,</p>
            <p><strong>{{ config('app.name') }}</strong></p>
        </div>
    </div>
    @endforeach

    <div class="footer">
        {{ config('app.name') }} | {{ config('app.address', '') }} | {{ config('app.phone', '') }}
    </div>
</body>
</html>

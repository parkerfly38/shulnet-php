<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Yahrzeit Reminder - {{ $yahrzeit->name }}</title>
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
        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    @foreach($members as $index => $member)
    <div class="{{ $loop->last ? '' : 'page-break' }}">
        <div class="letterhead">
            <h1>{{ config('app.name') }}</h1>
            <p>Memorial Observance Reminder</p>
        </div>

        <div class="date">
            {{ now()->format('F j, Y') }}
        </div>

        <div class="recipient">
            <p>Dear {{ $member->first_name }} {{ $member->last_name }},</p>
            <p class="relationship-note">In memory of your {{ strtolower($member->pivot->relationship) }}</p>
        </div>

        <div class="content">
            <p>We want to remind you of the upcoming yahrzeit (anniversary of passing) of your beloved:</p>

            <div class="yahrzeit-details">
                <h3>{{ $yahrzeit->name }}</h3>
                @if($yahrzeit->hebrew_name)
                    <p><em>{{ $yahrzeit->hebrew_name }}</em></p>
                @endif
                
                <p><strong>Hebrew Date:</strong> {{ $yahrzeit->hebrew_day_of_death }} {{ ['', 'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'][$yahrzeit->hebrew_month_of_death] ?? 'Unknown' }}</p>
                
                <p><strong>This Year (Gregorian Calendar):</strong> {{ $gregorianDate }}</p>
                
                <p><strong>Date of Passing:</strong> {{ $yahrzeit->date_of_death->format('F j, Y') }}</p>

                @if($yahrzeit->observance_type)
                    <p><strong>Observance Type:</strong> {{ ucfirst(str_replace('_', ' ', $yahrzeit->observance_type)) }}</p>
                @endif

                @if($yahrzeit->notes)
                    <p><strong>Notes:</strong><br>{{ $yahrzeit->notes }}</p>
                @endif
            </div>

            <p>May their memory be a blessing. We invite you to join us in remembering and honoring your loved one on this special day.</p>

            <p>If you would like to arrange for memorial prayers (Kaddish), light a memorial candle, or make a donation in their memory, please contact our office.</p>
        </div>

        <div class="signature">
            <p>With warm regards,</p>
            <p style="margin-top: 50px;">_______________________</p>
            <p>{{ config('app.name') }}</p>
        </div>

        <!--<div class="footer no-print">
            <p>{{ config('app.name') }} &copy; {{ date('Y') }} - Page {{ $loop->iteration }} of {{ $members->count() }}</p>
        </div>-->
    </div>
    @endforeach

    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt; cursor: pointer; background-color: #6b46c1; color: white; border: none; border-radius: 5px;">
            Print {{ $members->count() }} {{ $members->count() === 1 ? 'Letter' : 'Letters' }}
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14pt; cursor: pointer; background-color: #666; color: white; border: none; border-radius: 5px; margin-left: 10px;">
            Close
        </button>
    </div>
</body>
</html>

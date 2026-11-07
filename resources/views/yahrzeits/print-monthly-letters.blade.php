<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Yahrzeit Letters - {{ $hebrewMonth }}</title>
    {{-- Letter content and styling come from the "Yahrzeit Reminder Letter" PDF template. --}}
    <style>
        @page {
            margin: 1in;
        }
        body {
            margin: 0;
        }
        .page-break {
            page-break-after: always;
        }
        .no-print {
            font-family: Arial, sans-serif;
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
        <p>This document contains {{ count($letters) }} letter(s) for the current Hebrew month.</p>
        <button onclick="window.print()">Print All Letters</button>
        <button onclick="window.close()">Close</button>
    </div>

    @foreach($letters as $letter)
        <div class="{{ $loop->last ? '' : 'page-break' }}">{!! $letter !!}</div>
    @endforeach
</body>
</html>

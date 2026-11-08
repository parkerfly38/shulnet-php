<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Monthly Yahrzeit Letters - {{ $hebrewMonth }}</title>
    {{-- Letter content and styling come from the "Yahrzeit Reminder Letter" PDF template. --}}
    <style>
        .no-print {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f0f0f0;
            margin: 0 auto 24px;
            max-width: 8.5in;
            box-sizing: border-box;
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
    </style>
</head>
<body>
    <div class="no-print">
        <h2>Monthly Yahrzeit Letters - {{ $hebrewMonth }}</h2>
        <p>This document contains {{ count($letters) }} letter(s) for the current Hebrew month.</p>
        <button onclick="window.print()">Print All Letters</button>
        <button onclick="window.close()">Close</button>
    </div>

    @include('yahrzeits.partials.letter-pages')
</body>
</html>

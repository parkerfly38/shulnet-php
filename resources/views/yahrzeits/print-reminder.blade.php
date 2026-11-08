<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Yahrzeit Reminder - {{ $yahrzeit->name }}</title>
    {{-- Letter content and styling come from the "Yahrzeit Reminder Letter" PDF template. --}}
</head>
<body>
    @include('yahrzeits.partials.letter-pages')

    <div class="no-print" style="text-align: center; margin-bottom: 24px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14pt; cursor: pointer; background-color: #6b46c1; color: white; border: none; border-radius: 5px;">
            Print {{ $letters->count() }} {{ $letters->count() === 1 ? 'Letter' : 'Letters' }}
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14pt; cursor: pointer; background-color: #666; color: white; border: none; border-radius: 5px; margin-left: 10px;">
            Close
        </button>
    </div>
</body>
</html>

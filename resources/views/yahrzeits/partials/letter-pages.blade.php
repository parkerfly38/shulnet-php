{{--
    One sheet per letter. On screen each letter is drawn as a separate sheet of paper;
    when printed, every letter starts on a new page. Expects $letters (rendered HTML strings).
--}}
<style>
    @page { size: letter; margin: 0.75in; }
    html { background: #e5e7eb; }
    body { margin: 0; padding: 24px 0; }
    .letter-page {
        box-sizing: border-box;
        width: 8.5in;
        min-height: 11in;
        margin: 0 auto 24px;
        padding: 0.75in;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        overflow: hidden; /* keeps a template's floats from leaking into the next letter */
        -webkit-print-color-adjust: exact; /* print the template's shading, which browsers drop by default */
        print-color-adjust: exact;
    }
    @media print {
        html { background: none; }
        body { padding: 0; }
        .letter-page {
            width: auto;
            min-height: 0;
            margin: 0;
            padding: 0;
            box-shadow: none;
            overflow: visible;
        }
        .letter-page.break-after {
            break-after: page;
            page-break-after: always;
        }
        .no-print { display: none !important; }
    }
</style>

@foreach ($letters as $letter)
    <section class="letter-page{{ $loop->last ? '' : ' break-after' }}">{!! $letter !!}</section>
@endforeach

<?php

namespace App\Http\Controllers;

use App\Models\PdfTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PdfTemplate::query();

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%' . $request->search . '%')
                  ->orWhere('description', 'ilike', '%' . $request->search . '%');
            });
        }

        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active === '1');
        }

        $templates = $query->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pdf-templates/index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'category', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pdf-templates/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pdf_templates,slug',
            'description' => 'nullable|string',
            'html_content' => 'required|string',
            'available_fields' => 'required|array',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active');

        PdfTemplate::create($validated);

        return redirect()->route('pdf-templates.index')
            ->with('success', 'PDF template created successfully.');
    }

    public function show(PdfTemplate $pdfTemplate): Response
    {
        return Inertia::render('pdf-templates/show', [
            'template' => $pdfTemplate,
        ]);
    }

    public function edit(PdfTemplate $pdfTemplate): Response
    {
        return Inertia::render('pdf-templates/edit', [
            'template' => $pdfTemplate,
        ]);
    }

    public function update(Request $request, PdfTemplate $pdfTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pdf_templates,slug,' . $pdfTemplate->id,
            'description' => 'nullable|string',
            'html_content' => 'required|string',
            'available_fields' => 'required|array',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active');

        $pdfTemplate->update($validated);

        return redirect()->route('pdf-templates.index')
            ->with('success', 'PDF template updated successfully.');
    }

    public function destroy(PdfTemplate $pdfTemplate): RedirectResponse
    {
        $pdfTemplate->delete();

        return redirect()->route('pdf-templates.index')
            ->with('success', 'PDF template deleted successfully.');
    }

    public function preview(Request $request, PdfTemplate $pdfTemplate): Response
    {
        $fieldValues = $request->input('field_values', []);
        
        // Replace placeholders with actual values
        $content = $pdfTemplate->renderWithFields($fieldValues);

        return Inertia::render('pdf-templates/preview', [
            'template' => $pdfTemplate,
            'renderedContent' => $content,
            'fieldValues' => $fieldValues,
        ]);
    }

    public function generate(Request $request, PdfTemplate $pdfTemplate)
    {
        $fieldValues = $request->input('field_values', []);
        
        // Replace placeholders with actual values
        $content = $pdfTemplate->renderWithFields($fieldValues);

        // Generate PDF using dompdf
        $pdf = Pdf::loadHTML($content);
        
        // Set paper size and orientation
        $pdf->setPaper('letter', 'portrait');
        
        // Generate filename from template slug
        $filename = $pdfTemplate->slug . '-' . date('Y-m-d') . '.pdf';
        
        // Return PDF for download
        return $pdf->download($filename);
    }
}

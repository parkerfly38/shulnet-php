<?php

namespace App\Http\Controllers;

use App\Models\PdfTemplate;
use App\Services\SettingsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PdfTemplateController extends Controller
{
    /** Placeholders that always mean the synagogue name from Settings. */
    protected const SYNAGOGUE_NAME_FIELDS = ['synagogue_name', 'organization_name'];

    public function __construct(protected SettingsService $settings) {}

    public function index(Request $request): Response
    {
        $query = PdfTemplate::query();

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', '%'.$request->search.'%')
                    ->orWhere('description', 'ilike', '%'.$request->search.'%');
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
        // Pre-fill the synagogue name on the form; nothing is saved to the template.
        $template = $pdfTemplate->toArray();
        $template['available_fields'] = collect($pdfTemplate->available_fields ?? [])
            ->map(fn (array $field) => in_array($field['name'] ?? null, self::SYNAGOGUE_NAME_FIELDS, true)
                ? [...$field, 'default_value' => $this->settings->organizationName()]
                : $field)
            ->all();

        return Inertia::render('pdf-templates/show', [
            'template' => $template,
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
            'slug' => 'required|string|max:255|unique:pdf_templates,slug,'.$pdfTemplate->id,
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

    /**
     * Render the template with the entered values, using the same code as the PDF.
     */
    public function preview(Request $request, PdfTemplate $pdfTemplate): JsonResponse
    {
        return response()->json([
            'html' => $pdfTemplate->renderWithFields($this->fieldValues($request)),
        ]);
    }

    public function generate(Request $request, PdfTemplate $pdfTemplate)
    {
        $content = $pdfTemplate->renderWithFields($this->fieldValues($request));

        $pdf = Pdf::loadHTML($content);
        $pdf->setPaper('letter', 'portrait');

        $filename = $pdfTemplate->slug.'-'.date('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Values typed on the template page, escaped for HTML. The Generate button posts
     * a plain form, so they can arrive as a JSON string. A blank synagogue name is
     * filled from Settings, even in templates that don't list it as a field.
     */
    protected function fieldValues(Request $request): array
    {
        $values = $request->input('field_values', []);

        if (is_string($values)) {
            $values = json_decode($values, true) ?: [];
        }

        $values = collect($values)
            ->filter(fn ($value) => is_scalar($value) || $value === null)
            ->map(fn ($value) => nl2br(e((string) $value)))
            ->all();

        foreach (self::SYNAGOGUE_NAME_FIELDS as $name) {
            if (trim($values[$name] ?? '') === '') {
                $values[$name] = e($this->settings->organizationName());
            }
        }

        return $values;
    }
}

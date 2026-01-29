<?php

namespace App\Http\Controllers;

use App\Models\HtmlTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HtmlTemplateController extends Controller
{
    public function index()
    {
        $templates = HtmlTemplate::withCount('pages')->get();

        return Inertia::render('html-publisher/templates/index', [
            'templates' => $templates,
        ]);
    }

    public function create()
    {
        return Inertia::render('html-publisher/templates/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'header' => 'nullable|string',
            'footer' => 'nullable|string',
            'navigation' => 'nullable|string',
            'css' => 'nullable|string',
        ]);

        $template = HtmlTemplate::create($validated);

        return redirect()->route('html-templates.index')
            ->with('success', 'Template created successfully.');
    }

    public function edit(HtmlTemplate $htmlTemplate)
    {
        return Inertia::render('html-publisher/templates/edit', [
            'template' => $htmlTemplate->load('pages:id,title'),
        ]);
    }

    public function update(Request $request, HtmlTemplate $htmlTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'header' => 'nullable|string',
            'footer' => 'nullable|string',
            'navigation' => 'nullable|string',
            'css' => 'nullable|string',
        ]);

        $htmlTemplate->update($validated);

        return back()->with('success', 'Template updated successfully.');
    }

    public function destroy(HtmlTemplate $htmlTemplate)
    {
        $htmlTemplate->delete();

        return redirect()->route('html-templates.index')
            ->with('success', 'Template deleted successfully.');
    }
}

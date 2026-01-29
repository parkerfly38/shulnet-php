<?php

namespace App\Http\Controllers;

use App\Models\HtmlPage;
use App\Models\HtmlTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HtmlPageController extends Controller
{
    public function index()
    {
        $pages = HtmlPage::with('template')
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();

        return Inertia::render('html-publisher/pages/index', [
            'pages' => $pages,
        ]);
    }

    public function create()
    {
        $templates = HtmlTemplate::select('id', 'name')->get();

        return Inertia::render('html-publisher/pages/create', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:html_pages,slug',
            'content' => 'nullable|string',
            'header' => 'nullable|string',
            'footer' => 'nullable|string',
            'navigation' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'template_id' => 'nullable|exists:html_templates,id',
            'status' => 'required|in:draft,published,archived',
            'sort_order' => 'nullable|integer',
            'show_in_nav' => 'boolean',
        ]);

        $page = HtmlPage::create($validated);

        return redirect()->route('html-pages.edit', $page)
            ->with('success', 'Page created successfully.');
    }

    public function edit(HtmlPage $htmlPage)
    {
        $templates = HtmlTemplate::select('id', 'name')->get();

        return Inertia::render('html-publisher/pages/edit', [
            'page' => $htmlPage->load('template'),
            'templates' => $templates,
        ]);
    }

    public function update(Request $request, HtmlPage $htmlPage)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:html_pages,slug,' . $htmlPage->id,
            'content' => 'nullable|string',
            'header' => 'nullable|string',
            'footer' => 'nullable|string',
            'navigation' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'template_id' => 'nullable|exists:html_templates,id',
            'status' => 'required|in:draft,published,archived',
            'sort_order' => 'nullable|integer',
            'show_in_nav' => 'boolean',
        ]);

        $htmlPage->update($validated);

        return back()->with('success', 'Page updated successfully.');
    }

    public function destroy(HtmlPage $htmlPage)
    {
        if ($htmlPage->published_path && Storage::disk('public')->exists($htmlPage->published_path)) {
            Storage::disk('public')->delete($htmlPage->published_path);
        }

        $htmlPage->delete();

        return redirect()->route('html-pages.index')
            ->with('success', 'Page deleted successfully.');
    }

    public function publish(HtmlPage $htmlPage)
    {
        $html = $htmlPage->compile();
        
        $filename = $htmlPage->slug . '.html';
        $path = 'published/' . $filename;
        
        Storage::disk('public')->put($path, $html);
        
        $htmlPage->update([
            'status' => 'published',
            'published_at' => now(),
            'published_path' => $path,
        ]);

        $url = Storage::disk('public')->url($path);

        return back()->with('success', 'Page published successfully.');
    }

    public function preview(HtmlPage $htmlPage)
    {
        return response($htmlPage->compile())
            ->header('Content-Type', 'text/html');
    }
}

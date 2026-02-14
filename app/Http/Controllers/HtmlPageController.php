<?php

namespace App\Http\Controllers;

use App\Models\HtmlPage;
use App\Models\HtmlTemplate;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'Content Management')]

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

    public function show(HtmlPage $htmlPage)
    {
        return Inertia::render('html-publisher/pages/show', [
            'page' => $htmlPage->load('template'),
        ]);
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
        $destination = Setting::get('html_publish_destination', 'local');
        $filename = $htmlPage->slug . '.html';
        
        switch ($destination) {
            case 's3':
                $bucket = Setting::get('html_publish_s3_bucket');
                $pathPrefix = Setting::get('html_publish_s3_path', '');
                $path = $pathPrefix ? rtrim($pathPrefix, '/') . '/' . $filename : $filename;
                
                if (!$bucket) {
                    return back()->with('error', 'S3 bucket not configured in settings.');
                }
                
                Storage::disk('s3')->put($path, $html);
                $url = Storage::disk('s3')->url($path);
                
                $htmlPage->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'published_path' => $path,
                ]);
                
                return back()->with('success', 'Page published to S3 successfully.');
                
            case 'azure':
                $container = Setting::get('html_publish_azure_container');
                $pathPrefix = Setting::get('html_publish_azure_path', '');
                $path = $pathPrefix ? rtrim($pathPrefix, '/') . '/' . $filename : $filename;
                
                if (!$container) {
                    return back()->with('error', 'Azure container not configured in settings.');
                }
                
                // TODO: Implement Azure Blob Storage upload
                // For now, store locally as fallback
                Storage::disk('public')->put('published/' . $filename, $html);
                
                $htmlPage->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'published_path' => 'published/' . $filename,
                ]);
                
                return back()->with('success', 'Page published (Azure implementation pending).');
                
            case 'zip':
                // Create a temporary zip file with the page
                $zipPath = storage_path('app/temp/' . $htmlPage->slug . '.zip');
                
                if (!file_exists(dirname($zipPath))) {
                    mkdir(dirname($zipPath), 0755, true);
                }
                
                $zip = new ZipArchive();
                if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
                    $zip->addFromString($filename, $html);
                    $zip->close();
                    
                    $htmlPage->update([
                        'status' => 'published',
                        'published_at' => now(),
                    ]);
                    
                    return response()->download($zipPath, $htmlPage->slug . '.zip')->deleteFileAfterSend();
                }
                
                return back()->with('error', 'Failed to create ZIP file.');
                
            case 'local':
            default:
                $path = 'published/' . $filename;
                Storage::disk('public')->put($path, $html);
                
                $htmlPage->update([
                    'status' => 'published',
                    'published_at' => now(),
                    'published_path' => $path,
                ]);
                
                return back()->with('success', 'Page published successfully.');
        }
    }

    public function preview(HtmlPage $htmlPage)
    {
        return response($htmlPage->compile())
            ->header('Content-Type', 'text/html');
    }

    public function exportAll()
    {
        $pages = HtmlPage::where('status', '!=', 'archived')->get();
        
        if ($pages->isEmpty()) {
            return back()->with('error', 'No pages to export.');
        }
        
        $zipPath = storage_path('app/temp/all-pages-' . time() . '.zip');
        
        if (!file_exists(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }
        
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
            foreach ($pages as $page) {
                $html = $page->compile();
                $filename = $page->slug . '.html';
                $zip->addFromString($filename, $html);
            }
            
            // Add an index.html if there's a page with slug 'home' or 'index'
            $indexPage = $pages->firstWhere('slug', 'home') ?? $pages->firstWhere('slug', 'index');
            if ($indexPage && !$zip->locateName('index.html')) {
                $zip->addFromString('index.html', $indexPage->compile());
            }
            
            $zip->close();
            
            return response()->download($zipPath, 'website-export-' . date('Y-m-d') . '.zip')->deleteFileAfterSend();
        }
        
        return back()->with('error', 'Failed to create ZIP file.');
    }

    /**
     *  Get a paginated list of HTML pages
     *
     * @group HTML Publisher
     *
     * @authenticated
     */
    public function apiIndex(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');
        $perPage = $request->get('per_page', 15);

        $query = HtmlPage::query()
            ->with('template')
            ->orderBy('sort_order')
            ->orderBy('title');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $pages = $query->paginate($perPage);

        return response()->json($pages);
    }

    /**
     *  Get a single HTML page
     *
     * @group HTML Publisher
     *
     * @authenticated
     */
    public function apiShow(HtmlPage $htmlPage)
    {
        $htmlPage->load('template');

        return response()->json([
            'data' => $htmlPage,
        ]);
    }

    /**
     *  Create a new HTML page
     *
     * @group HTML Publisher
     *
     * @authenticated
     */
    public function apiStore(Request $request)
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
        $page->load('template');

        return response()->json([
            'data' => $page,
            'message' => 'HTML page created successfully.',
        ], 201);
    }

    /**
     *  Update an existing HTML page
     *
     * @group HTML Publisher
     *
     * @authenticated
     */
    public function apiUpdate(Request $request, HtmlPage $htmlPage)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:html_pages,slug,' . $htmlPage->id,
            'content' => 'nullable|string',
            'header' => 'nullable|string',
            'footer' => 'nullable|string',
            'navigation' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
            'template_id' => 'nullable|exists:html_templates,id',
            'status' => 'sometimes|required|in:draft,published,archived',
            'sort_order' => 'nullable|integer',
            'show_in_nav' => 'boolean',
        ]);

        $htmlPage->update($validated);
        $htmlPage->load('template');

        return response()->json([
            'data' => $htmlPage,
            'message' => 'HTML page updated successfully.',
        ]);
    }

    /**
     *  Delete an HTML page
     *
     * @group HTML Publisher
     *
     * @authenticated
     */
    public function apiDestroy(HtmlPage $htmlPage)
    {
        if ($htmlPage->published_path && Storage::disk('public')->exists($htmlPage->published_path)) {
            Storage::disk('public')->delete($htmlPage->published_path);
        }

        $htmlPage->delete();

        return response()->json([
            'message' => 'HTML page deleted successfully.',
        ]);
    }
}

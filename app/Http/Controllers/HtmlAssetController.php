<?php

namespace App\Http\Controllers;

use App\Models\HtmlAsset;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HtmlAssetController extends Controller
{
    public function index()
    {
        $assets = HtmlAsset::orderBy('created_at', 'desc')->get();

        return Inertia::render('html-publisher/assets/index', [
            'assets' => $assets,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'alt_text' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $provider = Setting::get('asset_storage_provider', 'local');
        
        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store based on provider
        switch ($provider) {
            case 'local':
                $path = $file->store('html-assets', 'public');
                $url = Storage::disk('public')->url($path);
                break;
                
            case 's3':
                $path = $file->store('html-assets', 's3');
                $url = Storage::disk('s3')->url($path);
                break;
                
            case 'cloudflare':
                // Store locally first, then can sync to CloudFlare R2
                $path = $file->store('html-assets', 'public');
                $url = Storage::disk('public')->url($path);
                // TODO: Implement CloudFlare R2 upload
                break;
                
            case 'azure':
                // Store locally first, then can sync to Azure
                $path = $file->store('html-assets', 'public');
                $url = Storage::disk('public')->url($path);
                // TODO: Implement Azure Blob upload
                break;
                
            default:
                $path = $file->store('html-assets', 'public');
                $url = Storage::disk('public')->url($path);
        }

        // Get image dimensions if it's an image
        $width = null;
        $height = null;
        if (str_starts_with($file->getMimeType(), 'image/')) {
            try {
                $imageSize = getimagesize($file->getRealPath());
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            } catch (\Exception $e) {
                // Ignore if we can't get dimensions
            }
        }

        $asset = HtmlAsset::create([
            'name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'url' => $url,
            'storage_provider' => $provider,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'alt_text' => $validated['alt_text'] ?? null,
        ]);

        return back()->with('success', 'Asset uploaded successfully.');
    }

    public function update(Request $request, HtmlAsset $htmlAsset)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'alt_text' => 'nullable|string',
        ]);

        $htmlAsset->update($validated);

        return back()->with('success', 'Asset updated successfully.');
    }

    public function destroy(HtmlAsset $htmlAsset)
    {
        // Delete file from storage
        if ($htmlAsset->storage_provider === 'local' || $htmlAsset->storage_provider === 'cloudflare' || $htmlAsset->storage_provider === 'azure') {
            if (Storage::disk('public')->exists($htmlAsset->path)) {
                Storage::disk('public')->delete($htmlAsset->path);
            }
        } elseif ($htmlAsset->storage_provider === 's3') {
            if (Storage::disk('s3')->exists($htmlAsset->path)) {
                Storage::disk('s3')->delete($htmlAsset->path);
            }
        }

        $htmlAsset->delete();

        return back()->with('success', 'Asset deleted successfully.');
    }
}

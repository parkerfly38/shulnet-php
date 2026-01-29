<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HtmlAsset extends Model
{
    protected $fillable = [
        'name',
        'filename',
        'path',
        'url',
        'storage_provider',
        'mime_type',
        'file_size',
        'width',
        'height',
        'alt_text',
    ];

    /**
     * Get the full URL for the asset
     */
    public function getFullUrlAttribute(): string
    {
        return $this->url;
    }

    /**
     * Check if asset is an image
     */
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type ?? '', 'image/');
    }
}

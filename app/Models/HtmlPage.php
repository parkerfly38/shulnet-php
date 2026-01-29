<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class HtmlPage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'header',
        'footer',
        'navigation',
        'meta_description',
        'meta_keywords',
        'template_id',
        'status',
        'published_at',
        'published_path',
        'sort_order',
        'show_in_nav',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'show_in_nav' => 'boolean',
    ];

    /**
     * Get the template for this page
     */
    public function template()
    {
        return $this->belongsTo(HtmlTemplate::class, 'template_id');
    }

    /**
     * Generate slug from title
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title);
            }
        });
    }

    /**
     * Compile the full HTML for this page
     */
    public function compile(): string
    {
        $header = $this->header ?? $this->template?->header ?? '';
        $footer = $this->footer ?? $this->template?->footer ?? '';
        $navigation = $this->navigation ?? $this->template?->navigation ?? '';
        $css = $this->template?->css ?? '';

        $html = '<!DOCTYPE html>';
        $html .= '<html lang="en">';
        $html .= '<head>';
        $html .= '<meta charset="UTF-8">';
        $html .= '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
        $html .= '<title>' . htmlspecialchars($this->title) . '</title>';
        
        if ($this->meta_description) {
            $html .= '<meta name="description" content="' . htmlspecialchars($this->meta_description) . '">';
        }
        
        if ($this->meta_keywords) {
            $html .= '<meta name="keywords" content="' . htmlspecialchars($this->meta_keywords) . '">';
        }
        
        if ($css) {
            $html .= '<style>' . $css . '</style>';
        }
        
        $html .= '</head>';
        $html .= '<body>';
        
        if ($header) {
            $html .= $header;
        }
        
        if ($navigation) {
            $html .= $navigation;
        }
        
        $html .= '<main>' . $this->content . '</main>';
        
        if ($footer) {
            $html .= $footer;
        }
        
        $html .= '</body>';
        $html .= '</html>';

        return $html;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HtmlTemplate extends Model
{
    protected $fillable = [
        'name',
        'description',
        'header',
        'footer',
        'navigation',
        'css',
    ];

    /**
     * Get pages using this template
     */
    public function pages()
    {
        return $this->hasMany(HtmlPage::class, 'template_id');
    }
}

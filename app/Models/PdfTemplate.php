<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PdfTemplate extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'html_content',
        'available_fields',
        'category',
        'is_active',
    ];

    protected $casts = [
        'available_fields' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Replace template placeholders with actual field values
     * 
     * @param array $fieldValues Associative array of field_name => value
     * @return string HTML content with replaced values
     */
    public function renderWithFields(array $fieldValues): string
    {
        $content = $this->html_content;

        foreach ($fieldValues as $fieldName => $value) {
            // Replace {{field_name}} with the actual value
            $content = str_replace('{{' . $fieldName . '}}', $value, $content);
        }

        // Replace any remaining unreplaced fields with empty string
        $content = preg_replace('/\{\{[^}]+\}\}/', '', $content);

        return $content;
    }

    /**
     * Extract field names from HTML content
     * 
     * @return array List of field names found in template
     */
    public function extractFields(): array
    {
        preg_match_all('/\{\{([^}]+)\}\}/', $this->html_content, $matches);
        return array_unique($matches[1]);
    }

    /**
     * Validate that all required fields are provided
     * 
     * @param array $fieldValues
     * @return array Missing required fields
     */
    public function getMissingFields(array $fieldValues): array
    {
        $requiredFields = collect($this->available_fields)
            ->filter(fn($field) => $field['required'] ?? false)
            ->pluck('name')
            ->toArray();

        return array_diff($requiredFields, array_keys($fieldValues));
    }
}


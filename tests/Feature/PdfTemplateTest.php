<?php

namespace Tests\Feature;

use App\Models\PdfTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PdfTemplateTest extends TestCase
{
    use RefreshDatabase;

    private function template(): PdfTemplate
    {
        return PdfTemplate::create([
            'name' => 'Letter',
            'slug' => 'letter',
            'html_content' => '<html><head><style>body { color: red; }</style></head><body><p>Dear {{name}}</p>{{#if note}}<p>Note: {{note}}</p>{{/if}}</body></html>',
            'available_fields' => [['name' => 'name', 'label' => 'Name', 'type' => 'text'], ['name' => 'note', 'label' => 'Note', 'type' => 'text']],
            'category' => 'letter',
            'is_active' => true,
        ]);
    }

    public function test_preview_renders_on_the_server_like_the_pdf(): void
    {
        $template = $this->template();

        $this->actingAs(User::factory()->admin()->create())
            ->postJson("/admin/pdf-templates/{$template->id}/preview", ['field_values' => ['name' => '<Ruth>', 'note' => '']])
            ->assertOk()
            ->assertJsonPath('html', '<html><head><style>body { color: red; }</style></head><body><p>Dear &lt;Ruth&gt;</p></body></html>');
    }

    // The page posts a plain form, so field values arrive as a JSON string.
    public function test_generate_returns_a_pdf(): void
    {
        $template = $this->template();

        $response = $this->actingAs(User::factory()->admin()->create())
            ->post("/admin/pdf-templates/{$template->id}/generate", ['field_values' => json_encode(['name' => 'Ruth'])])
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');

        $this->assertStringStartsWith('%PDF', $response->getContent());
    }
}

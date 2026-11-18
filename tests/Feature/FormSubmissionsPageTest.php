<?php

namespace Tests\Feature;

use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormSubmissionsPageTest extends TestCase
{
    use RefreshDatabase;

    // "View All Submissions" pointed at a page that didn't exist; Inertia's test mode checks the page file is there.
    public function test_view_all_submissions_shows_the_forms_submissions(): void
    {
        $form = Form::create([
            'name' => 'Volunteer Interest',
            'schema' => [['id' => 'name', 'type' => 'text', 'label' => 'Name', 'required' => true]],
            'is_active' => true,
        ]);
        FormSubmission::create(['form_id' => $form->id, 'data' => ['name' => 'Alex Morgan'], 'ip_address' => '192.0.2.10']);

        $this->actingAs(User::factory()->admin()->create())
            ->get("/admin/forms/{$form->id}/submissions")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('forms/submissions')
                ->where('form.id', $form->id)
                ->where('submissions.total', 1)
                ->where('submissions.data.0.data.name', 'Alex Morgan'));
    }
}

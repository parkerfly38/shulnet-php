<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Yahrzeit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class YahrzeitIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_yahrzeits_are_ordered_by_surname_on_the_configured_database(): void
    {
        $admin = User::factory()->admin()->create();

        $zulu = Yahrzeit::factory()->create(['name' => 'Aaron Zulu']);
        $able = Yahrzeit::factory()->create(['name' => 'Zachary Able']);
        $baker = Yahrzeit::factory()->create(['name' => 'Michael Baker']);

        $response = $this->actingAs($admin)->get('/admin/yahrzeits');

        $response->assertSuccessful();
        $response->assertInertia(fn ($page) => $page
            ->component('yahrzeits/index')
            ->where('yahrzeits.data.0.id', $able->id)
            ->where('yahrzeits.data.1.id', $baker->id)
            ->where('yahrzeits.data.2.id', $zulu->id)
        );
    }
}

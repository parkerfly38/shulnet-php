<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppVersionTest extends TestCase
{
    use RefreshDatabase;

    public function test_version_comes_from_version_file(): void
    {
        $version = trim(file_get_contents(base_path('VERSION')));

        $this->assertNotSame('', $version);
        $this->assertSame($version, config('app.version'));
        $this->assertSame($version, config('scramble.info.version'));
    }

    public function test_version_is_shared_with_the_interface(): void
    {
        $user = User::factory()->create(['roles' => ['admin']]);

        $this->actingAs($user)->get('/admin/seating-charts')
            ->assertInertia(fn (Assert $page) => $page->where('version', config('app.version')));
    }
}

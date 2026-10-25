<?php

namespace Tests\Feature;

use App\Ai\Agents\AdminAssistant;
use App\Ai\Tools\FinancialReport;
use App\Ai\Tools\SearchMembers;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Tools\Request;
use Tests\TestCase;

class AdminChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admins_cannot_use_the_chat_endpoint(): void
    {
        $user = User::factory()->create(['roles' => ['member']]);

        $this->actingAs($user)->postJson('/admin/chat', ['message' => 'hi'])->assertForbidden();
    }

    public function test_chat_endpoint_returns_the_agent_reply(): void
    {
        AdminAssistant::fake(['Hello admin']);
        $admin = User::factory()->create(['roles' => ['admin']]);

        $this->actingAs($admin)->postJson('/admin/chat', ['message' => 'hi'])
            ->assertOk()
            ->assertJsonPath('reply', 'Hello admin');
    }

    public function test_tools_refuse_non_admins_and_return_data_to_admins(): void
    {
        Member::factory()->create(['first_name' => 'Zelda', 'last_name' => 'Cohen']);
        $tool = app(SearchMembers::class);

        $this->actingAs(User::factory()->create(['roles' => ['member']]));
        $this->assertStringContainsString('not authorized', (string) $tool->handle(new Request(['search' => 'Zelda'])));

        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $this->assertStringContainsString('Zelda Cohen', (string) $tool->handle(new Request(['search' => 'Zelda'])));
    }

    public function test_financial_report_tool_validates_input_and_enforces_admin(): void
    {
        $tool = app(FinancialReport::class);

        $this->actingAs(User::factory()->create(['roles' => ['member']]));
        $this->assertStringContainsString('not authorized', (string) $tool->handle(new Request(['report' => 'aging'])));

        $this->actingAs(User::factory()->create(['roles' => ['admin']]));
        $this->assertStringContainsString('needs valid start_date', (string) $tool->handle(new Request(['report' => 'income_summary'])));
        $this->assertStringContainsString('Unknown report', (string) $tool->handle(new Request(['report' => 'nope'])));

        $income = json_decode((string) $tool->handle(new Request([
            'report' => 'income_summary', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31',
        ])), true);
        $this->assertArrayHasKey('total_revenue', $income);

        $aging = json_decode((string) $tool->handle(new Request(['report' => 'aging'])), true);
        $this->assertIsArray($aging);
        $this->assertArrayNotHasKey('error', $aging);
    }

    public function test_chat_history_is_restored_for_the_same_admin_only(): void
    {
        AdminAssistant::fake(['Hello admin']);
        $admin = User::factory()->create(['roles' => ['admin']]);
        $other = User::factory()->create(['roles' => ['admin']]);

        $this->actingAs($admin)->postJson('/admin/chat', ['message' => 'hi'])->assertOk();

        $this->actingAs($admin)->getJson('/admin/chat')
            ->assertOk()
            ->assertJsonPath('messages.0.role', 'user')
            ->assertJsonPath('messages.0.content', 'hi')
            ->assertJsonPath('messages.1.content', 'Hello admin');

        $this->actingAs($other)->getJson('/admin/chat')
            ->assertOk()
            ->assertJsonPath('conversation_id', null)
            ->assertJsonPath('messages', []);
    }

    public function test_non_admins_cannot_read_chat_history(): void
    {
        $this->actingAs(User::factory()->create(['roles' => ['member']]))->getJson('/admin/chat')->assertForbidden();
    }

    public function test_prune_command_removes_only_conversations_older_than_30_days(): void
    {
        AdminAssistant::fake(['Hello admin']);
        $admin = User::factory()->create(['roles' => ['admin']]);

        $this->actingAs($admin)->postJson('/admin/chat', ['message' => 'old'])->assertOk();
        \DB::table('agent_conversations')->update(['updated_at' => now()->subDays(31)]);

        $this->getJson('/admin/chat')->assertJsonPath('messages', []);

        $this->actingAs($admin)->postJson('/admin/chat', ['message' => 'new'])->assertOk();
        $this->assertSame(2, \DB::table('agent_conversations')->count());

        $this->artisan('ai:prune-conversations')->assertSuccessful();

        $this->assertSame(1, \DB::table('agent_conversations')->count());
        $this->assertSame(2, \DB::table('agent_conversation_messages')->count());
    }
}

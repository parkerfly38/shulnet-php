# AI Assistant

ShulNET includes an AI assistant for administrators. It appears as a floating chat button in the bottom corner of every admin page and answers questions about the synagogue's data by calling read-only tools that query the same records the screens show.

Example questions:

- "Who has a yahrzeit this week?"
- "Which families owe more than $500?"
- "How many confirmed RSVPs do we have for the Chanukah party?"
- "Show me attendance for Sarah Cohen."
- "What is today's Hebrew date?"

The assistant is instructed never to guess: if a tool returns nothing or an error, it says so.

## Configuration

The assistant is built on the [Laravel AI SDK](https://github.com/laravel/ai) (`laravel/ai`). Providers are defined in `config/ai.php`, and `AI_PROVIDER` picks the default (OpenAI when unset).

### OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# Optional: any OpenAI-compatible endpoint
# OPENAI_URL=https://api.openai.com/v1
```

### Local model with Ollama

Running a local model keeps member data on your own server.

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:12b
```

### Other providers

`config/ai.php` also defines Anthropic, Azure OpenAI, Bedrock, Gemini, Groq, Mistral, DeepSeek, OpenRouter, xAI and a generic `openai-compatible` driver. Set `AI_PROVIDER` to the provider's key and supply its credentials (for example `ANTHROPIC_API_KEY`). The model must support tool calling.

## Tools

The agent (`app/Ai/Agents/AdminAssistant.php`) has these tools, all in `app/Ai/Tools/`. None of them create, change or delete data.

| Tool | What it answers |
|------|-----------------|
| `SearchMembers` | Find members and contacts by name, email, city or state, optionally by member type |
| `MemberDetail` | One member's contact details, family, membership periods, board and committee roles, unpaid balance and giving totals |
| `SearchYahrzeits` | Yahrzeits by name or related member, optionally observed between two dates |
| `UpcomingYahrzeits` | Yahrzeits observed in the coming days (default 7, max 60) |
| `SearchEvents` | Calendar events by name or description |
| `EventRsvps` | RSVP totals by status and recent RSVPs for an event |
| `SearchStudents` | Religious school students by name or email |
| `StudentDetail` | One student's profile, allergies and accommodations, parents, grades and attendance |
| `SearchInvoices` | Invoices by number, notes or member, with totals by status |
| `FinancialReport` | Income summary, revenue by source, payment methods, event revenue, member growth, outstanding balances and aging |
| `HebrewCalendar` | Today's Hebrew date, or the Hebrew date for a Gregorian date |

Tools share query logic with the controllers through classes in `app/Actions/`, so the assistant and the screens return the same results.

### Adding a tool

1. Create a class in `app/Ai/Tools/` that extends `AdminTool` and implements `description()`, `schema()` and `execute()`.
2. Add it to `AdminAssistant::tools()`.
3. Add coverage in `tests/Feature/AdminAiToolsTest.php`.

`AdminTool` checks the admin role and JSON-encodes the result; `limit()` clamps a requested result count to 1–25.

## Access control

- Both chat routes (`GET` and `POST /admin/chat`) require the `admin` role.
- Every tool call checks the role again, so a tool returns an error instead of data if it is ever reached without admin rights.
- The widget (`resources/js/components/admin-chat-widget.tsx`) only renders for admins.

## Conversations

Conversations are stored per user in the `agent_conversations` and `agent_conversation_messages` tables.

- When the widget loads, `GET /admin/chat` restores the user's latest conversation if it was active in the last 30 days (up to 100 messages).
- `POST /admin/chat` sends a message (up to 2,000 characters) and continues that conversation, or starts a new one.
- The `ai:prune-conversations` command deletes conversations inactive for 30 days. It is scheduled daily at 02:00 in `routes/console.php`:

```bash
php artisan ai:prune-conversations --days=30
```

To change retention, edit `--days` in `routes/console.php` and the 30-day window in `AdminChatController::show`. See "Scheduled Jobs" in the [README](README.md#scheduled-jobs) for running the scheduler.

## Privacy

With a hosted provider, the questions and the tool results needed to answer them (which can include member names, contact details, balances and student information) are sent to that provider. Review the provider's data retention terms, or use a local model through Ollama to keep everything on your own server.

## Testing

```bash
php artisan test tests/Feature/AdminChatTest.php tests/Feature/AdminAiToolsTest.php
```

## Troubleshooting

- **Chat button missing:** the signed-in user does not have the `admin` role.
- **"Sorry, something went wrong":** check `storage/logs/laravel.log`. Common causes are a missing API key, an unreachable `OLLAMA_URL` or `OPENAI_URL`, or a model that does not support tool calling.
- **History not restored:** the last conversation is older than 30 days or was pruned.

<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'Email Management')]

class EmailTemplateController extends Controller
{
    /**
     * Display a listing of the email templates.
     */
    public function index()
    {
        $templates = EmailTemplate::latest()->get();

        return Inertia::render('templates/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Show the form for creating a new email template.
     */
    public function create()
    {
        return Inertia::render('templates/create');
    }

    /**
     * Store a newly created email template in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        EmailTemplate::create($validated);

        return redirect()->route('admin.templates.index')
            ->with('success', 'Template created successfully.');
    }

    /**
     * Display the specified email template.
     */
    public function show(EmailTemplate $template)
    {
        return Inertia::render('templates/show', [
            'template' => $template,
        ]);
    }

    /**
     * Show the form for editing the specified email template.
     */
    public function edit(EmailTemplate $template)
    {
        return Inertia::render('templates/edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the specified email template in storage.
     */
    public function update(Request $request, EmailTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $template->update($validated);

        return redirect()->route('admin.templates.index')
            ->with('success', 'Template updated successfully.');
    }

    /**
     * Remove the specified email template from storage.
     */
    public function destroy(EmailTemplate $template)
    {
        $template->delete();

        return redirect()->route('admin.templates.index')
            ->with('success', 'Template deleted successfully.');
    }
}

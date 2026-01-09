<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FormController extends Controller
{
    /**
     * Display a listing of forms
     */
    public function index()
    {
        $forms = Form::withCount('submissions')
            ->latest()
            ->get();

        return Inertia::render('forms/index', [
            'forms' => $forms
        ]);
    }

    /**
     * Show the form for creating a new form
     */
    public function create()
    {
        return Inertia::render('forms/create');
    }

    /**
     * Store a newly created form
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schema' => 'required|array',
            'schema.*.id' => 'required|string',
            'schema.*.type' => 'required|in:text,textarea,boolean,select,multiselect,date',
            'schema.*.label' => 'required|string',
            'schema.*.description' => 'nullable|string',
            'schema.*.required' => 'boolean',
            'schema.*.options' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $form = Form::create($validated);

        return redirect()
            ->route('admin.forms.show', $form)
            ->with('success', 'Form created successfully.');
    }

    /**
     * Display the specified form
     */
    public function show(Form $form)
    {
        $form->load('submissions');
        $form->loadCount('submissions');

        return Inertia::render('forms/show', [
            'form' => $form
        ]);
    }

    /**
     * Show the form for editing the specified form
     */
    public function edit(Form $form)
    {
        return Inertia::render('forms/edit', [
            'form' => $form
        ]);
    }

    /**
     * Update the specified form
     */
    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schema' => 'required|array',
            'schema.*.id' => 'required|string',
            'schema.*.type' => 'required|in:text,textarea,boolean,select,multiselect,date',
            'schema.*.label' => 'required|string',
            'schema.*.description' => 'nullable|string',
            'schema.*.required' => 'boolean',
            'schema.*.options' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $form->update($validated);

        return redirect()
            ->route('admin.forms.show', $form)
            ->with('success', 'Form updated successfully.');
    }

    /**
     * Remove the specified form
     */
    public function destroy(Form $form)
    {
        $form->delete();

        return redirect()
            ->route('admin.forms.index')
            ->with('success', 'Form deleted successfully.');
    }

    /**
     * Preview a form (public)
     */
    public function preview(Form $form)
    {
        return Inertia::render('forms/preview', [
            'form' => $form
        ]);
    }

    /**
     * Submit a form (public)
     */
    public function submit(Request $request, Form $form)
    {
        if (!$form->is_active) {
            return back()->with('error', 'This form is not accepting submissions.');
        }

        // Build validation rules from schema
        $rules = [];
        foreach ($form->schema as $field) {
            $fieldRules = [];
            
            if ($field['required'] ?? false) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            switch ($field['type']) {
                case 'text':
                    $fieldRules[] = 'string';
                    $fieldRules[] = 'max:255';
                    break;
                case 'textarea':
                    $fieldRules[] = 'string';
                    break;
                case 'date':
                    $fieldRules[] = 'date';
                    break;
                case 'boolean':
                    $fieldRules[] = 'boolean';
                    break;
                case 'select':
                    if (isset($field['options']) && is_array($field['options'])) {
                        $fieldRules[] = 'in:' . implode(',', $field['options']);
                    }
                    break;
                case 'multiselect':
                    $fieldRules[] = 'array';
                    if (isset($field['options']) && is_array($field['options'])) {
                        $fieldRules[] = 'in:' . implode(',', $field['options']);
                    }
                    break;
            }

            $rules[$field['id']] = $fieldRules;
        }

        $validated = $request->validate($rules);

        FormSubmission::create([
            'form_id' => $form->id,
            'data' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return back()->with('success', 'Form submitted successfully!');
    }

    /**
     * View submissions for a form
     */
    public function submissions(Form $form)
    {
        $submissions = $form->submissions()
            ->latest()
            ->paginate(50);

        return Inertia::render('forms/submissions', [
            'form' => $form,
            'submissions' => $submissions
        ]);
    }
}

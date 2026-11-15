<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class SubjectController extends Controller
{
    /**
     *  Get a paginated list of subjects
     *
     * @group Subjects
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Subject::with(['classDefinition', 'teacher']);
        if ($q) {
            $query->where('name', 'like', "%{$q}%");
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single subject
     *
     * @group Subjects
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(Subject::with(['classDefinition', 'teacher'])->findOrFail($id));
    }

    /**
     *  Create a new subject
     *
     * @group Subjects
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $model = Subject::create($this->validated($request));

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.subjects.show', $model->id)
                ->with('success', 'Subject created successfully.');
        }

        return response()->json($model->load(['classDefinition', 'teacher']), 201);
    }

    /**
     *  Update an existing subject
     *
     * @group Subjects
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = Subject::findOrFail($id);
        $model->update($this->validated($request));

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.subjects.show', $model->id)
                ->with('success', 'Subject updated successfully.');
        }

        return response()->json($model->load(['classDefinition', 'teacher']));
    }

    /**
     *  Delete a subject
     *
     * @group Subjects
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = Subject::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }

    /**
     * The fields the subject forms send.
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'subject_code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'books' => 'nullable|string',
            'class_id' => 'nullable|integer|exists:class_definitions,id',
            'teacher_id' => 'nullable|integer|exists:teachers,id',
        ]);
    }
}

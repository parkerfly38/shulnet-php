<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class ExamController extends Controller
{
    /**
     *  Get a paginated list of exams
     *
     * @group Exams
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        // Exams have no description column; search the exam's and its subject's names.
        $query = Exam::with('subject:id,name')->orderByDesc('start_date')->orderBy('name');
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('name', 'like', "%{$q}%")
                    ->orWhereHas('subject', fn ($sub) => $sub->where('name', 'like', "%{$q}%"));
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(Exam::with('subject:id,name')->findOrFail($id));
    }

    /**
     *  Create a new exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $model = Exam::create($this->validated($request));

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.exams.index')->with('success', 'Exam created successfully.');
        }

        return response()->json($model->load('subject:id,name'), 201);
    }

    /**
     *  Update an existing exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = Exam::findOrFail($id);
        $model->update($this->validated($request));

        if ($request->header('X-Inertia')) {
            return redirect()->route('admin.school.exams.show', $model->id)->with('success', 'Exam updated successfully.');
        }

        return response()->json($model->load('subject:id,name'));
    }

    /**
     *  Delete an exam
     *
     * @group Exams
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = Exam::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }

    /**
     * The exam's own columns: the old rules asked for a date and description the table doesn't have,
     * and dropped the subject and dates the forms send.
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'subject_id' => 'nullable|integer|exists:subjects,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
    }
}

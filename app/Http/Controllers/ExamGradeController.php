<?php

namespace App\Http\Controllers;

use App\Models\ExamGrade;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group(name: 'School Management')]
class ExamGradeController extends Controller
{
    /**
     *  Get a paginated list of exam grades
     *
     * @group Exam Grades
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = ExamGrade::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('grade', 'like', "%{$q}%")
                    ->orWhere('remarks', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single exam grade
     *
     * @group Exam Grades
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(ExamGrade::findOrFail($id));
    }

    /**
     *  Create a new exam grade
     *
     * @group Exam Grades
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['exam_id' => 'required|integer', 'student_id' => 'required|integer', 'score' => 'nullable|integer', 'grade' => 'nullable|string']);
        $model = ExamGrade::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing exam grade
     *
     * @group Exam Grades
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = ExamGrade::findOrFail($id);
        $data = $request->validate(['exam_id' => 'required|integer', 'student_id' => 'required|integer', 'score' => 'nullable|integer', 'grade' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete an exam grade
     *
     * @group Exam Grades
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = ExamGrade::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}

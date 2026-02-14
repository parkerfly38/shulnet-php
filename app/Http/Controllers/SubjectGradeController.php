<?php

namespace App\Http\Controllers;

use App\Models\SubjectGrade;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class SubjectGradeController extends Controller
{
    /**
     *  Get a paginated list of subject grades
     *
     * @group Subject Grades
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = SubjectGrade::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('grade', 'like', "%{$q}%")
                    ->orWhere('remarks', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single subject grade
     *
     * @group Subject Grades
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(SubjectGrade::findOrFail($id));
    }

    /**
     *  Create a new subject grade
     *
     * @group Subject Grades
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['subject_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model = SubjectGrade::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing subject grade
     *
     * @group Subject Grades
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = SubjectGrade::findOrFail($id);
        $data = $request->validate(['subject_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete a subject grade
     *
     * @group Subject Grades
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = SubjectGrade::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}

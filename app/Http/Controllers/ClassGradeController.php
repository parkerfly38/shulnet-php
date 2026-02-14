<?php

namespace App\Http\Controllers;

use App\Models\ClassGrade;
use Illuminate\Http\Request;
use Dedoc\Scramble\Attributes\Group;

#[Group('School Management')]
class ClassGradeController extends Controller
{
    /**
     *  Get a paginated list of class grades
     *
     * @group Class Grades
     *
     * @authenticated
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = ClassGrade::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('grade', 'like', "%{$q}%")
                    ->orWhere('remarks', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     *  Get a single class grade
     *
     * @group Class Grades
     *
     * @authenticated
     */
    public function show($id)
    {
        return response()->json(ClassGrade::findOrFail($id));
    }

    /**
     *  Create a new class grade
     *
     * @group Class Grades
     *
     * @authenticated
     */
    public function store(Request $request)
    {
        $data = $request->validate(['class_definition_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model = ClassGrade::create($data);

        return response()->json($model, 201);
    }

    /**
     *  Update an existing class grade
     *
     * @group Class Grades
     *
     * @authenticated
     */
    public function update(Request $request, $id)
    {
        $model = ClassGrade::findOrFail($id);
        $data = $request->validate(['class_definition_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    /**
     *  Delete a class grade
     *
     * @group Class Grades
     *
     * @authenticated
     */
    public function destroy($id)
    {
        $model = ClassGrade::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}

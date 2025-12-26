<?php

namespace App\Http\Controllers;

use App\Models\SubjectGrade;
use Illuminate\Http\Request;

class SubjectGradeController extends Controller
{
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

    public function show($id)
    {
        return response()->json(SubjectGrade::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['subject_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model = SubjectGrade::create($data);
        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $model = SubjectGrade::findOrFail($id);
        $data = $request->validate(['subject_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id)
    {
        $model = SubjectGrade::findOrFail($id);
        $model->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ClassGrade;
use Illuminate\Http\Request;

class ClassGradeController extends Controller
{
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

    public function show($id)
    {
        return response()->json(ClassGrade::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['class_definition_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model = ClassGrade::create($data);
        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $model = ClassGrade::findOrFail($id);
        $data = $request->validate(['class_definition_id' => 'required|integer', 'student_id' => 'required|integer', 'grade' => 'nullable|string']);
        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id)
    {
        $model = ClassGrade::findOrFail($id);
        $model->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Exam::query();
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('name', 'like', "%{$q}%")
                  ->orWhere('description', 'like', "%{$q}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        return response()->json(Exam::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string', 'date' => 'nullable|date', 'description' => 'nullable|string']);
        $model = Exam::create($data);
        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $model = Exam::findOrFail($id);
        $data = $request->validate(['name' => 'required|string', 'date' => 'nullable|date', 'description' => 'nullable|string']);
        $model->update($data);
        return response()->json($model);
    }

    public function destroy($id)
    {
        $model = Exam::findOrFail($id);
        $model->delete();
        return response()->json(null, 204);
    }
}

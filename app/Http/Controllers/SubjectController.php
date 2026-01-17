<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = Subject::query();
        if ($q) {
            $query->where('name', 'like', "%{$q}%");
        }

        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        return response()->json(Subject::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string', 'description' => 'nullable|string']);
        $model = Subject::create($data);

        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $model = Subject::findOrFail($id);
        $data = $request->validate(['name' => 'required|string', 'description' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    public function destroy($id)
    {
        $model = Subject::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}

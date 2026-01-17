<?php

namespace App\Http\Controllers;

use App\Models\ClassDefinition;
use Illuminate\Http\Request;

class ClassDefinitionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 25);
        $q = $request->input('q');

        $query = ClassDefinition::with('teacher')->select('class_definitions.*');
        if ($q) {
            $query->where(function ($s) use ($q) {
                $s->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $pag = $query->paginate($perPage);
        // add teacher_name to each item for UI convenience
        $pag->getCollection()->transform(function ($item) {
            $item->teacher_name = $item->teacher->first_name.' '.$item->teacher->last_name ?? $item->teacher_id;

            return $item;
        });

        return response()->json($pag);
    }

    public function show($id)
    {
        return response()->json(ClassDefinition::findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => 'required|string', 'description' => 'nullable|string']);
        $model = ClassDefinition::create($data);

        return response()->json($model, 201);
    }

    public function update(Request $request, $id)
    {
        $model = ClassDefinition::findOrFail($id);
        $data = $request->validate(['name' => 'required|string', 'description' => 'nullable|string']);
        $model->update($data);

        return response()->json($model);
    }

    public function destroy($id)
    {
        $model = ClassDefinition::findOrFail($id);
        $model->delete();

        return response()->json(null, 204);
    }
}

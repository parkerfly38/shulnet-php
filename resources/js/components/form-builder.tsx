import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';

export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'boolean' | 'select' | 'multiselect' | 'date';
    label: string;
    description?: string;
    required: boolean;
    options?: string[];
}

interface FormBuilderProps {
    value: FormField[];
    onChange: (fields: FormField[]) => void;
}

export default function FormBuilder({ value, onChange }: FormBuilderProps) {
    const [editingField, setEditingField] = useState<string | null>(null);

    const addField = (type: FormField['type']) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            type,
            label: `New ${type} field`,
            description: '',
            required: false,
            options: type === 'select' || type === 'multiselect' ? ['Option 1', 'Option 2'] : undefined,
        };
        onChange([...value, newField]);
        setEditingField(newField.id);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        onChange(value.map(field => field.id === id ? { ...field, ...updates } : field));
    };

    const deleteField = (id: string) => {
        onChange(value.filter(field => field.id !== id));
        if (editingField === id) setEditingField(null);
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...value];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newFields.length) return;
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
        onChange(newFields);
    };

    const updateOptions = (id: string, options: string) => {
        const optionsArray = options.split('\n').filter(o => o.trim());
        updateField(id, { options: optionsArray });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-3">Add Field</h3>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => addField('text')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('textarea')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Textarea
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('date')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Date
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('boolean')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yes/No
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('select')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Select
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addField('multiselect')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Multi-Select
                    </Button>
                </div>
            </div>

            {value.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No fields added yet. Click the buttons above to add form fields.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {value.map((field, index) => (
                        <Card key={field.id} className={editingField === field.id ? 'border-blue-500' : ''}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                        <CardTitle className="text-base">{field.label}</CardTitle>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{field.type}</span>
                                        {field.required && <span className="text-xs text-red-600">Required</span>}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveField(index, 'up')}
                                            disabled={index === 0}
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveField(index, 'down')}
                                            disabled={index === value.length - 1}
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                                        >
                                            {editingField === field.id ? 'Done' : 'Edit'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteField(field.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                {field.description && editingField !== field.id && (
                                    <CardDescription>{field.description}</CardDescription>
                                )}
                            </CardHeader>
                            {editingField === field.id && (
                                <CardContent className="space-y-4 border-t pt-4">
                                    <div>
                                        <Label>Field Label</Label>
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Description (optional)</Label>
                                        <Input
                                            value={field.description || ''}
                                            onChange={(e) => updateField(field.id, { description: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`required-${field.id}`}
                                            checked={field.required}
                                            onCheckedChange={(checked) => updateField(field.id, { required: checked as boolean })}
                                        />
                                        <Label htmlFor={`required-${field.id}`}>Required field</Label>
                                    </div>
                                    {(field.type === 'select' || field.type === 'multiselect') && (
                                        <div>
                                            <Label>Options (one per line)</Label>
                                            <Textarea
                                                value={field.options?.join('\n') || ''}
                                                onChange={(e) => updateOptions(field.id, e.target.value)}
                                                rows={5}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

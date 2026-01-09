import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FormField } from '@/components/form-builder';

interface FormRendererProps {
    fields: FormField[];
    values?: Record<string, unknown>;
    onChange?: (fieldId: string, value: unknown) => void;
    errors?: Record<string, string>;
}

export default function FormRenderer({ fields, values = {}, onChange, errors = {} }: FormRendererProps) {
    const handleChange = (fieldId: string, value: unknown) => {
        if (onChange) {
            onChange(fieldId, value);
        }
    };

    return (
        <div className="space-y-6">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-red-600 ml-1">*</span>}
                    </Label>
                    {field.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{field.description}</p>
                    )}

                    {field.type === 'text' && (
                        <Input
                            id={field.id}
                            name={field.id}
                            value={(values[field.id] as string) || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    )}

                    {field.type === 'textarea' && (
                        <Textarea
                            id={field.id}
                            name={field.id}
                            value={(values[field.id] as string) || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                            rows={4}
                        />
                    )}

                    {field.type === 'date' && (
                        <Input
                            id={field.id}
                            name={field.id}
                            type="date"
                            value={(values[field.id] as string) || ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            required={field.required}
                        />
                    )}

                    {field.type === 'boolean' && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={field.id}
                                name={field.id}
                                checked={(values[field.id] as boolean) || false}
                                onCheckedChange={(checked) => handleChange(field.id, checked)}
                                required={field.required}
                            />
                            <Label htmlFor={field.id} className="font-normal">
                                Yes
                            </Label>
                        </div>
                    )}

                    {field.type === 'select' && field.options && (
                        <Select
                            value={(values[field.id] as string) || ''}
                            onValueChange={(value) => handleChange(field.id, value)}
                            required={field.required}
                        >
                            <SelectTrigger id={field.id}>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {field.type === 'multiselect' && field.options && (
                        <div className="space-y-2">
                            {field.options.map((option) => (
                                <div key={option} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`${field.id}_${option}`}
                                        checked={((values[field.id] as string[]) || []).includes(option)}
                                        onCheckedChange={(checked) => {
                                            const currentValues = (values[field.id] as string[]) || [];
                                            const newValues = checked
                                                ? [...currentValues, option]
                                                : currentValues.filter((v) => v !== option);
                                            handleChange(field.id, newValues);
                                        }}
                                    />
                                    <Label htmlFor={`${field.id}_${option}`} className="font-normal">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors[field.id] && (
                        <p className="text-sm text-red-600">{errors[field.id]}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

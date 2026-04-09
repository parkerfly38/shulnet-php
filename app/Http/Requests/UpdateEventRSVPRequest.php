<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRSVPRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'event_id' => 'sometimes|exists:events,id',
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'guests' => 'nullable|integer|min:0',
            'quantity' => 'nullable|integer|min:1',
            'ticket_price' => 'nullable|numeric|min:0',
            'total_amount' => 'nullable|numeric|min:0',
            'status' => 'sometimes|required|in:pending,confirmed,cancelled',
            'notes' => 'nullable|string|max:1000',
            'member_id' => 'nullable|exists:members,id',
            'event_ticket_type_id' => 'nullable|exists:event_ticket_types,id',
        ];
    }
}

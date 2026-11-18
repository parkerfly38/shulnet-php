<?php

use App\Models\ParentModel;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Tuition invoices from student onboarding were left without a member when the parent wasn't one,
 * so they showed no name. Bill each to the parent's member record, creating a contact if needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        $orphans = DB::table('invoices')
            ->whereNull('member_id')
            ->where('invoiceable_type', ParentModel::class)
            ->get(['id', 'invoiceable_id']);

        foreach ($orphans as $invoice) {
            $parent = ParentModel::find($invoice->invoiceable_id);

            if ($parent) {
                DB::table('invoices')->where('id', $invoice->id)->update(['member_id' => $parent->billingMember()->id]);
            }
        }
    }

    public function down(): void
    {
        // The contact records and links are kept; they're valid data.
    }
};

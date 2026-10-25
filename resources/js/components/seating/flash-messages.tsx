import { usePage } from '@inertiajs/react';

export default function FlashMessages() {
    const { flash } = usePage<{ flash?: { success?: string | null; error?: string | null } }>().props;

    return (
        <>
            {flash?.success && (
                <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                    {flash.error}
                </div>
            )}
        </>
    );
}

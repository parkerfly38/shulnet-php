import { usePage } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import { type SharedData } from '@/types';

export function CurrentDate() {
    const { currentDate } = usePage<SharedData>().props;

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <div className="hidden md:flex flex-col text-right">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {currentDate.gregorian}
                </span>
                <span className="text-xs">
                    {currentDate.hebrew}
                </span>
            </div>
            <div className="md:hidden flex flex-col text-right">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs">
                    {currentDate.hebrew?.split(' ').slice(0, 2).join(' ')}
                </span>
            </div>
        </div>
    );
}

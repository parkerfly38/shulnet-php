import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent } from 'react';

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone1: string | null;
    phone2: string | null;
    address_line_1: string | null;
    address_line_2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    hebrew_name: string | null;
    father_hebrew_name: string | null;
    mother_hebrew_name: string | null;
    date_of_birth: string | null;
    anniversary_date: string | null;
}

interface Props {
    member: Member;
}

export default function ProfilePage({ member }: Readonly<Props>) {
    // Format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateValue: string | null): string => {
        if (!dateValue) return '';
        if (typeof dateValue === 'string') {
            return dateValue.split('T')[0];
        }
        return '';
    };

    const { data, setData, put, processing, errors } = useForm({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone1: member.phone1 || '',
        phone2: member.phone2 || '',
        address_line_1: member.address_line_1 || '',
        address_line_2: member.address_line_2 || '',
        city: member.city || '',
        state: member.state || '',
        zip: member.zip || '',
        hebrew_name: member.hebrew_name || '',
        father_hebrew_name: member.father_hebrew_name || '',
        mother_hebrew_name: member.mother_hebrew_name || '',
        date_of_birth: formatDateForInput(member.date_of_birth),
        anniversary_date: formatDateForInput(member.anniversary_date),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put('/member/profile');
    };

    return (
        <AppLayout>
            <Head title="My Information" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Information</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Update your personal information
                        </p>
                    </div>
                    <Link
                        href="/member/dashboard"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-black rounded-lg border p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    required
                                />
                                {errors.first_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    required
                                />
                                {errors.last_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.date_of_birth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Anniversary Date
                                </label>
                                <input
                                    type="date"
                                    value={data.anniversary_date}
                                    onChange={(e) => setData('anniversary_date', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.anniversary_date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.anniversary_date}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Primary Phone
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone1}
                                    onChange={(e) => setData('phone1', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.phone1 && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone1}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Secondary Phone
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone2}
                                    onChange={(e) => setData('phone2', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.phone2 && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone2}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Address</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.address_line_1 && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.address_line_2 && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address_line_2}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        maxLength={2}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    />
                                    {errors.state && (
                                        <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={data.zip}
                                        onChange={(e) => setData('zip', e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                    />
                                    {errors.zip && (
                                        <p className="text-red-500 text-sm mt-1">{errors.zip}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hebrew Information */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Hebrew Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hebrew Name
                                </label>
                                <input
                                    type="text"
                                    value={data.hebrew_name}
                                    onChange={(e) => setData('hebrew_name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.hebrew_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.hebrew_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Father's Hebrew Name
                                </label>
                                <input
                                    type="text"
                                    value={data.father_hebrew_name}
                                    onChange={(e) => setData('father_hebrew_name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.father_hebrew_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.father_hebrew_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mother's Hebrew Name
                                </label>
                                <input
                                    type="text"
                                    value={data.mother_hebrew_name}
                                    onChange={(e) => setData('mother_hebrew_name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 dark:bg-gray-900"
                                />
                                {errors.mother_hebrew_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.mother_hebrew_name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link
                            href="/member/dashboard"
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

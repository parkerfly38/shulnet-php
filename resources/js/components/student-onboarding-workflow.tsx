import { useTranslation } from '@/hooks/use-translation';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

export interface SchoolTuitionTier {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    billing_period: 'annual' | 'semester' | 'monthly' | 'custom';
    features: string[] | null;
}

export interface Parent {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface Member {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface StudentOnboardingWorkflowProps {
    schoolTuitionTiers: SchoolTuitionTier[];
    parents: Parent[];
    members: Member[];
    onClose: () => void;
}

interface StudentFormData {
    first_name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    date_of_birth: string;
    address: string;
    email: string;
    is_parent_email: boolean;
}

export function StudentOnboardingWorkflow({ schoolTuitionTiers, parents, members, onClose }: StudentOnboardingWorkflowProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const { currency } = usePage().props as any;
    
    const [students, setStudents] = useState<StudentFormData[]>([{
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        address: '',
        email: '',
        is_parent_email: false,
    }]);
    
    const [parentData, setParentData] = useState({
        selection_type: 'existing_parent', // 'existing_parent', 'existing_member', 'new_parent'
        parent_id: '',
        member_id: '',
        // New parent fields
        first_name: '',
        last_name: '',
        date_of_birth: '',
        address: '',
        email: '',
    });

    const [tuitionData, setTuitionData] = useState({
        tuition_tier_id: '',
        quantity: 1,
        start_date: new Date().toISOString().split('T')[0],
        create_invoice: true,
        email_invoice: false,
    });

    // Sync quantity with student count - move to useMemo or derive from state
    const quantityFromStudents = students.length;

    const handleNext = () => {
        setTuitionData(prev => ({ ...prev, quantity: quantityFromStudents }));
        setStep(step + 1);
    };
    const handleBack = () => setStep(step - 1);

    const addStudent = () => {
        setStudents([...students, {
            first_name: '',
            last_name: '',
            middle_name: '',
            gender: '',
            date_of_birth: '',
            address: '',
            email: '',
            is_parent_email: false,
        }]);
    };

    const removeStudent = (index: number) => {
        if (students.length > 1) {
            setStudents(students.filter((_, i) => i !== index));
        }
    };

    const updateStudent = (index: number, field: keyof StudentFormData, value: string | boolean) => {
        const updatedStudents = [...students];
        updatedStudents[index] = { ...updatedStudents[index], [field]: value };
        setStudents(updatedStudents);
    };

    const handleSubmit = () => {
        router.post('/onboarding/student', {
            students: students as any,
            parent_data: parentData,
            tuition_data: tuitionData,
        }, {
            onSuccess: () => {
                onClose();
                setStep(1);
                setStudents([{
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    gender: '',
                    date_of_birth: '',
                    address: '',
                    email: '',
                    is_parent_email: false,
                }]);
                setParentData({
                    selection_type: 'existing_parent',
                    parent_id: '',
                    member_id: '',
                    first_name: '',
                    last_name: '',
                    date_of_birth: '',
                    address: '',
                    email: '',
                });
                setTuitionData({
                    tuition_tier_id: '',
                    quantity: 1,
                    start_date: '',
                    create_invoice: true,
                    email_invoice: false,
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            step >= s 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                            {s}
                        </div>
                        {s < 4 && <div className={`flex-1 h-1 ${
                            step > s ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />}
                    </div>
                ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{t('Student Details')}</span>
                <span>{t('Parent/Guardian')}</span>
                <span>{t('Tuition Tier')}</span>
                <span>{t('Invoice Preview')}</span>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">{t('Student Information')}</h3>
                            <Button onClick={addStudent} size="sm">
                                <UserPlus className="h-4 w-4 me-1" />
                                {t('Add Another Student')}
                            </Button>
                        </div>
                        
                        {students.map((student, index) => (
                            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Student {index + 1}</h4>
                                    {students.length > 1 && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => removeStudent(index)}
                                        >
                                            {t('Remove')}
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.first_name}
                                            onChange={(e) => updateStudent(index, 'first_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.last_name}
                                            onChange={(e) => updateStudent(index, 'last_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('Middle Name')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.middle_name}
                                            onChange={(e) => updateStudent(index, 'middle_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('Gender')}</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.gender}
                                            onChange={(e) => updateStudent(index, 'gender', e.target.value)}
                                        >
                                            <option value="">{t('Select gender')}</option>
                                            <option value="male">{t('Male')}</option>
                                            <option value="female">{t('Female')}</option>
                                            <option value="other">{t('Other')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.date_of_birth}
                                            onChange={(e) => updateStudent(index, 'date_of_birth', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('Email')}</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.email}
                                            onChange={(e) => updateStudent(index, 'email', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('Address')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={student.address}
                                            onChange={(e) => updateStudent(index, 'address', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`is_parent_email_${index}`}
                                                checked={student.is_parent_email}
                                                onChange={(e) => updateStudent(index, 'is_parent_email', e.target.checked)}
                                                className="rounded"
                                            />
                                            <label htmlFor={`is_parent_email_${index}`} className="text-sm">
                                                {t("Use parent's email")}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Select or Create Parent/Guardian')}</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="existing_parent"
                                    checked={parentData.selection_type === 'existing_parent'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>Select from Existing Parents ({parents?.length || 0} available)</span>
                            </label>
                            
                            {parentData.selection_type === 'existing_parent' && (
                                <div className="ms-6">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        value={parentData.parent_id}
                                        onChange={(e) => setParentData({ ...parentData, parent_id: e.target.value })}
                                    >
                                        <option value="">{t('Select a parent')}</option>
                                        {parents && parents.length > 0 ? (
                                            parents.map((parent) => (
                                                <option key={parent.id} value={parent.id}>
                                                    {parent.first_name} {parent.last_name} - {parent.email}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>{t('No parents available')}</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="existing_member"
                                    checked={parentData.selection_type === 'existing_member'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>Select from Existing Members (will add as parent) ({members?.length || 0} available)</span>
                            </label>
                            
                            {parentData.selection_type === 'existing_member' && (
                                <div className="ms-6">
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        value={parentData.member_id}
                                        onChange={(e) => setParentData({ ...parentData, member_id: e.target.value })}
                                    >
                                        <option value="">{t('Select a member')}</option>
                                        {members && members.length > 0 ? (
                                            members.map((member) => (
                                                <option key={member.id} value={member.id}>
                                                    {member.first_name} {member.last_name} - {member.email}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>{t('No members available')}</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                                <input
                                    type="radio"
                                    name="parent_type"
                                    value="new_parent"
                                    checked={parentData.selection_type === 'new_parent'}
                                    onChange={(e) => setParentData({ ...parentData, selection_type: e.target.value })}
                                    className="rounded-full"
                                />
                                <span>{t('Create New Parent')}</span>
                            </label>
                            
                            {parentData.selection_type === 'new_parent' && (
                                <div className="ms-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.first_name}
                                            onChange={(e) => setParentData({ ...parentData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.last_name}
                                            onChange={(e) => setParentData({ ...parentData, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email *</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.email}
                                            onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">{t('Date of Birth')}</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.date_of_birth}
                                            onChange={(e) => setParentData({ ...parentData, date_of_birth: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1">{t('Address')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                            value={parentData.address}
                                            onChange={(e) => setParentData({ ...parentData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Select Tuition Tier')}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Choose a tuition tier for {students.length} student{students.length > 1 ? 's' : ''}
                        </div>
                        {!schoolTuitionTiers || schoolTuitionTiers.length === 0 ? (
                            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500 dark:text-gray-400">
                                {t('No tuition tiers available. Please contact administration.')}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {schoolTuitionTiers.map((tier) => (
                                    <div
                                        key={tier.id}
                                        onClick={() => setTuitionData({ ...tuitionData, tuition_tier_id: tier.id.toString(), quantity: students.length })}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            tuitionData.tuition_tier_id === tier.id.toString()
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-lg">{tier.name}</div>
                                                {tier.description && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {tier.description}
                                                    </div>
                                                )}
                                                {tier.features && tier.features.length > 0 && (
                                                    <ul className="mt-2 space-y-1">
                                                        {tier.features.map((feature, idx) => (
                                                            <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                                                <span className="me-2">✓</span>
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="ms-4 text-end">
                                                <div className="font-bold text-xl">
                                                    {formatCurrency(parseFloat(tier.price), currency)}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                    {tier.billing_period}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('Quantity (Students)')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={tuitionData.quantity}
                                    onChange={(e) => setTuitionData({ ...tuitionData, quantity: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    value={tuitionData.start_date}
                                    onChange={(e) => setTuitionData({ ...tuitionData, start_date: e.target.value })}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="create_invoice"
                                checked={tuitionData.create_invoice}
                                onChange={(e) => setTuitionData({ ...tuitionData, create_invoice: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="create_invoice" className="text-sm">{t('Create invoice for tuition')}</label>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-4">
                        <h3 className="font-medium text-lg">{t('Review & Send Invoice')}</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Students')}</div>
                                {students.map((student, idx) => (
                                    <div key={idx} className="font-medium">
                                        {idx + 1}. {student.first_name} {student.last_name}
                                        {student.email && ` - ${student.email}`}
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Parent/Guardian')}</div>
                                {parentData.selection_type === 'existing_parent' && parentData.parent_id && (() => {
                                    const selectedParent = parents.find(p => p.id.toString() === parentData.parent_id);
                                    return selectedParent ? (
                                        <div className="font-medium">
                                            {selectedParent.first_name} {selectedParent.last_name} - {selectedParent.email}
                                        </div>
                                    ) : null;
                                })()}
                                {parentData.selection_type === 'existing_member' && parentData.member_id && (() => {
                                    const selectedMember = members.find(m => m.id.toString() === parentData.member_id);
                                    return selectedMember ? (
                                        <div className="font-medium">
                                            {selectedMember.first_name} {selectedMember.last_name} - {selectedMember.email}
                                            <span className="text-xs text-gray-600 dark:text-gray-400 ms-2">(Member → Parent)</span>
                                        </div>
                                    ) : null;
                                })()}
                                {parentData.selection_type === 'new_parent' && (
                                    <div className="font-medium">
                                        {parentData.first_name} {parentData.last_name} - {parentData.email}
                                        <span className="text-xs text-gray-600 dark:text-gray-400 ms-2">(New)</span>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{t('Tuition')}</div>
                                {tuitionData.tuition_tier_id && (() => {
                                    const selectedTier = schoolTuitionTiers.find(t => t.id.toString() === tuitionData.tuition_tier_id);
                                    return selectedTier ? (
                                        <>
                                            <div className="font-medium">{selectedTier.name}</div>
                                            <div className="text-sm">Start Date: {tuitionData.start_date}</div>
                                            <div className="text-sm capitalize">
                                                {selectedTier.billing_period} - {formatCurrency(parseFloat(selectedTier.price), currency)} × {tuitionData.quantity} student{tuitionData.quantity > 1 ? 's' : ''}
                                            </div>
                                        </>
                                    ) : null;
                                })()}
                            </div>
                            
                            {tuitionData.create_invoice && tuitionData.tuition_tier_id && (() => {
                                const selectedTier = schoolTuitionTiers.find(t => t.id.toString() === tuitionData.tuition_tier_id);
                                return selectedTier ? (
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{t('Total Invoice Amount')}</div>
                                        <div className="font-medium text-lg">
                                            {formatCurrency(parseFloat(selectedTier.price) * tuitionData.quantity, currency)}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                        </div>
                        
                        {tuitionData.create_invoice && (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="email_invoice"
                                    checked={tuitionData.email_invoice}
                                    onChange={(e) => setTuitionData({ ...tuitionData, email_invoice: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="email_invoice" className="text-sm">{t('Email invoice to parent')}</label>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                >
                    {t('Back')}
                </Button>
                {step < 4 ? (
                    <Button onClick={handleNext}>
                        {t('Next')}
                    </Button>
                ) : (
                    <Button onClick={handleSubmit}>
                        {t('Complete Onboarding')}
                    </Button>
                )}
            </div>
        </div>
    );
}
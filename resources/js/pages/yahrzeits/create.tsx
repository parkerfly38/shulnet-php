import { useState, useEffect } from 'react';
import { router, useForm, Head } from '@inertiajs/react';
import { ArrowLeft, Calendar, Star, User, Plus, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Yahrzeits',
        href: '/admin/yahrzeits',
    },
    {
        title: 'Create',
        href: '/admin/yahrzeits/create',
    },
];

interface Member {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    hebrew_name?: string;
}

interface MemberRelationship {
    member_id: string;
    relationship: string;
}

interface YahrzeitCreateProps {
    members: Member[];
}

interface YahrzeitFormData {
    name: string;
    hebrew_name: string;
    date_of_death: string;
    observance_type: string;
    notes: string;
    members: MemberRelationship[];
}

const RELATIONSHIP_OPTIONS = [
    'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister',
    'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin', 'Friend', 'Other'
];

const OBSERVANCE_OPTIONS = [
    { value: 'standard', label: 'Standard Yahrzeit' },
    { value: 'kaddish', label: 'Kaddish Observance' },
    { value: 'memorial_candle', label: 'Memorial Candle' },
    { value: 'other', label: 'Other Observance' }
];

export default function YahrzeitCreate({ members }: YahrzeitCreateProps) {
    const { data, setData, post, processing, errors } = useForm<YahrzeitFormData>({
        name: '',
        hebrew_name: '',
        date_of_death: '',
        observance_type: 'standard',
        notes: '',
        members: []
    });

    const [memberSearches, setMemberSearches] = useState<string[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[][]>([members]);

    useEffect(() => {
        const newFilteredMembers = memberSearches.map(search => {
            if (search) {
                return members.filter(member =>
                    `${member.first_name} ${member.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
                    (member.hebrew_name && member.hebrew_name.toLowerCase().includes(search.toLowerCase()))
                );
            } else {
                return members;
            }
        });
        setFilteredMembers(newFilteredMembers);
    }, [memberSearches, members]);

    const addMember = () => {
        setData('members', [...data.members, { member_id: '', relationship: '' }]);
        setMemberSearches([...memberSearches, '']);
    };

    const removeMember = (index: number) => {
        const newMembers = data.members.filter((_, i) => i !== index);
        setData('members', newMembers);
        setMemberSearches(memberSearches.filter((_, i) => i !== index));
    };

    const updateMember = (index: number, field: keyof MemberRelationship, value: string) => {
        const newMembers = [...data.members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setData('members', newMembers);
    };

    const updateMemberSearch = (index: number, search: string) => {
        const newSearches = [...memberSearches];
        newSearches[index] = search;
        setMemberSearches(newSearches);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/yahrzeits');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Yahrzeit Record" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          {/* Header */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Yahrzeit Record</h1>
                        <p className="text-gray-600 dark:text-gray-400">Create a new memorial observance record</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Deceased Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Deceased Information
                            </CardTitle>
                            <CardDescription>
                                Information about the person being remembered
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Deceased Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                    placeholder="Full name of the deceased"
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="hebrew_name">Hebrew Name</Label>
                                <Input
                                    id="hebrew_name"
                                    type="text"
                                    value={data.hebrew_name}
                                    onChange={(e) => setData('hebrew_name', e.target.value)}
                                    className={errors.hebrew_name ? 'border-red-500' : ''}
                                    placeholder="Hebrew name (optional)"
                                />
                                {errors.hebrew_name && <p className="text-sm text-red-600 mt-1">{errors.hebrew_name}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date and Observance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Date and Observance Details
                            </CardTitle>
                            <CardDescription>
                                Date of death and observance preferences. Hebrew dates will be calculated automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="date_of_death">Date of Death *</Label>
                                <Input
                                    id="date_of_death"
                                    type="date"
                                    value={data.date_of_death}
                                    onChange={(e) => setData('date_of_death', e.target.value)}
                                    className={errors.date_of_death ? 'border-red-500' : ''}
                                />
                                {errors.date_of_death && <p className="text-sm text-red-600 mt-1">{errors.date_of_death}</p>}
                                <p className="text-sm text-gray-600 mt-1">
                                    Hebrew calendar date will be calculated automatically
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="observance_type">Observance Type *</Label>
                                <Select value={data.observance_type} onValueChange={(value) => setData('observance_type', value)}>
                                    <SelectTrigger className={errors.observance_type ? 'border-red-500' : ''}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OBSERVANCE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.observance_type && <p className="text-sm text-red-600 mt-1">{errors.observance_type}</p>}
                            </div>

                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className={errors.notes ? 'border-red-500' : ''}
                                    placeholder="Additional notes or special instructions (optional)"
                                    rows={3}
                                />
                                {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members Selection (Optional) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Family Members (Optional)
                            </CardTitle>
                            <CardDescription>
                                Add congregation members who will observe this yahrzeit and their relationship to the deceased
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.members.length === 0 ? (
                                <Alert>
                                    <AlertDescription>
                                        No family members added yet. Click the button below to add members who will observe this yahrzeit.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                data.members.map((memberData, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Family Member {index + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeMember(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor={`member_search_${index}`}>Search Member</Label>
                                            <Input
                                                id={`member_search_${index}`}
                                                type="text"
                                                placeholder="Search by name or Hebrew name..."
                                                value={memberSearches[index] || ''}
                                                onChange={(e) => updateMemberSearch(index, e.target.value)}
                                                className="mb-2"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor={`member_id_${index}`}>Select Member *</Label>
                                            <Select 
                                                value={memberData.member_id} 
                                                onValueChange={(value) => updateMember(index, 'member_id', value)}
                                            >
                                                <SelectTrigger className={errors[`members.${index}.member_id`] ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Choose a member..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(filteredMembers[index] || []).map((member) => (
                                                        <SelectItem key={member.id} value={member.id.toString()}>
                                                            <div>
                                                                <div>{member.first_name} {member.last_name}</div>
                                                                {member.hebrew_name && (
                                                                    <div className="text-sm text-gray-600">{member.hebrew_name}</div>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`members.${index}.member_id`] && (
                                                <p className="text-sm text-red-600 mt-1">{errors[`members.${index}.member_id`]}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor={`relationship_${index}`}>Relationship to Deceased *</Label>
                                            <Select 
                                                value={memberData.relationship} 
                                                onValueChange={(value) => updateMember(index, 'relationship', value)}
                                            >
                                                <SelectTrigger className={errors[`members.${index}.relationship`] ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select relationship..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {RELATIONSHIP_OPTIONS.map((relationship) => (
                                                        <SelectItem key={relationship} value={relationship}>
                                                            {relationship}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`members.${index}.relationship`] && (
                                                <p className="text-sm text-red-600 mt-1">{errors[`members.${index}.relationship`]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addMember}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Family Member
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                    <div className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/admin/yahrzeits')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Yahrzeit Record'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
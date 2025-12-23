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
import { Badge } from "@/components/ui/badge";

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

interface YahrzeitMember extends Member {
    pivot?: {
        relationship: string;
    };
}

interface Yahrzeit {
    id: number;
    members: YahrzeitMember[];
    name: string;
    hebrew_name?: string;
    date_of_death: string;
    hebrew_day_of_death: number;
    hebrew_month_of_death: number;
    observance_type: string;
    notes?: string;
}

interface YahrzeitEditProps {
    yahrzeit: Yahrzeit;
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

const HEBREW_MONTHS = [
    '', // 0 index placeholder
    'Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
    'Nissan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'
];

export default function YahrzeitEdit({ yahrzeit, members }: YahrzeitEditProps) {
    const { data, setData, put, processing, errors } = useForm<YahrzeitFormData>({
        name: yahrzeit.name,
        hebrew_name: yahrzeit.hebrew_name || '',
        date_of_death: yahrzeit.date_of_death,
        observance_type: yahrzeit.observance_type,
        notes: yahrzeit.notes || '',
        members: yahrzeit.members.map(m => ({
            member_id: m.id.toString(),
            relationship: m.pivot?.relationship || ''
        }))
    });

    const [memberSearches, setMemberSearches] = useState<string[]>(
        yahrzeit.members.map(() => '')
    );
    const [filteredMembers, setFilteredMembers] = useState<Member[][]>(
        yahrzeit.members.map(() => members)
    );

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
        if (data.members.length > 1) {
            setData('members', data.members.filter((_, i) => i !== index));
            setMemberSearches(memberSearches.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: 'member_id' | 'relationship', value: string) => {
        const newMembers = [...data.members];
        newMembers[index][field] = value;
        setData('members', newMembers);
    };

    const updateMemberSearch = (index: number, value: string) => {
        const newSearches = [...memberSearches];
        newSearches[index] = value;
        setMemberSearches(newSearches);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/yahrzeits/${yahrzeit.id}`);
    };

    const formatHebrewDate = (day: number, month: number) => {
        const monthName = HEBREW_MONTHS[month] || 'Unknown';
        return `${day} ${monthName}`;
    };

    return (
        <AppLayout>
            <Head title="Edit Yahrzeit Record" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          {/* Header */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Yahrzeit Record</h1>
                        <p className="text-gray-600 dark:text-gray-400">Update memorial observance for {yahrzeit.name}</p>
                    </div>
                </div>

                {/* Current Hebrew Date Info */}
                <Alert>
                    <Star className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex items-center gap-2">
                            <span>Current Hebrew Date:</span>
                            <Badge variant="secondary">
                                {formatHebrewDate(yahrzeit.hebrew_day_of_death, yahrzeit.hebrew_month_of_death)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                                (will be recalculated if date of death is changed)
                            </span>
                        </div>
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Member Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Member Information
                            </CardTitle>
                            <CardDescription>
                                Select the congregation member(s) who will observe this yahrzeit
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.members.map((memberRel, index) => {
                                const selectedMember = members.find(m => m.id.toString() === memberRel.member_id);
                                return (
                                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                        {data.members.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => removeMember(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        
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
                                                value={memberRel.member_id} 
                                                onValueChange={(value) => updateMember(index, 'member_id', value)}
                                            >
                                                <SelectTrigger className={errors[`members.${index}.member_id`] ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Choose a member..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(filteredMembers[index] || members).map((member) => (
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
                                            <Label htmlFor={`relationship_${index}`}>Relationship *</Label>
                                            <Select 
                                                value={memberRel.relationship} 
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

                                        {selectedMember && (
                                            <Alert>
                                                <AlertDescription>
                                                    Selected: <strong>{selectedMember.first_name} {selectedMember.last_name}</strong>
                                                    {selectedMember.hebrew_name && (
                                                        <span> ({selectedMember.hebrew_name})</span>
                                                    )}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                );
                            })}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addMember}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Another Member
                            </Button>
                        </CardContent>
                    </Card>

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
                                Date of death and observance preferences. Hebrew dates will be recalculated automatically if changed.
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
                                    Hebrew calendar date will be recalculated if this date is changed
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
                            {processing ? 'Updating...' : 'Update Yahrzeit Record'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
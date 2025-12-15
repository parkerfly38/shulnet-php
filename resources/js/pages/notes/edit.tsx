import { useState, useMemo } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, AlertTriangle, Tag } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbItem, Note, Member, User } from '@/types';

interface EditNoteProps {
    note: Note;
    members: Member[];
    users: User[];
}

interface NoteFormData {
    item_scope: string;
    name: string;
    deadline_date: string;
    note_text: string;
    label: string;
    added_by: string;
    visibility: string;
    priority: string;
    member_id: string;
    user_id: string;
}

export default function EditNote({ note, members, users }: EditNoteProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Notes',
            href: '/admin/notes',
        },
        {
            title: note.name,
            href: `/admin/notes/${note.id}`,
        },
        {
            title: 'Edit',
            href: `/admin/notes/${note.id}/edit`,
        }
    ], [note.name, note.id]);

    const formatDateTimeForInput = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    const { data, setData, put, processing, errors } = useForm<NoteFormData>({
        item_scope: note.item_scope || 'User',
        name: note.name || '',
        deadline_date: formatDateTimeForInput(note.deadline_date),
        note_text: note.note_text || '',
        label: note.label || '',
        added_by: note.added_by || '',
        visibility: note.visibility || 'Admin',
        priority: note.priority || 'Medium',
        member_id: note.member_id?.toString() || '',
        user_id: note.user_id?.toString() || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/notes/${note.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Note - ${note.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Note</h1>
                        <p className="text-gray-600 dark:text-gray-400">Update note information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Update the basic details for the note
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Note Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter note name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="item_scope">
                                        Scope <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.item_scope} onValueChange={(value) => setData('item_scope', value)}>
                                        <SelectTrigger className={errors.item_scope ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="User">User</SelectItem>
                                            <SelectItem value="Member">Member</SelectItem>
                                            <SelectItem value="Contact">Contact</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.item_scope && (
                                        <p className="text-red-500 text-sm">{errors.item_scope}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">
                                        Priority <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                        <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-red-500 text-sm">{errors.priority}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="visibility">
                                        Visibility <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.visibility} onValueChange={(value) => setData('visibility', value)}>
                                        <SelectTrigger className={errors.visibility ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Member">Member</SelectItem>
                                            <SelectItem value="Admin">Admin</SelectItem>
                                            <SelectItem value="Broadcast">Broadcast</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.visibility && (
                                        <p className="text-red-500 text-sm">{errors.visibility}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Additional Details
                                </CardTitle>
                                <CardDescription>
                                    Optional information and scheduling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deadline_date">Deadline Date</Label>
                                    <Input
                                        id="deadline_date"
                                        type="datetime-local"
                                        value={data.deadline_date}
                                        onChange={(e) => setData('deadline_date', e.target.value)}
                                        className={errors.deadline_date ? 'border-red-500' : ''}
                                    />
                                    {errors.deadline_date && (
                                        <p className="text-red-500 text-sm">{errors.deadline_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="label">Label</Label>
                                    <Input
                                        id="label"
                                        type="text"
                                        value={data.label}
                                        onChange={(e) => setData('label', e.target.value)}
                                        placeholder="Enter label (e.g., Financial, Meetings)"
                                        className={errors.label ? 'border-red-500' : ''}
                                    />
                                    {errors.label && (
                                        <p className="text-red-500 text-sm">{errors.label}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="added_by">Added By</Label>
                                    <Input
                                        id="added_by"
                                        type="text"
                                        value={data.added_by}
                                        onChange={(e) => setData('added_by', e.target.value)}
                                        placeholder="Enter who added this note"
                                        className={errors.added_by ? 'border-red-500' : ''}
                                    />
                                    {errors.added_by && (
                                        <p className="text-red-500 text-sm">{errors.added_by}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="member_id">Related Member</Label>
                                    <Select value={data.member_id ?? ' '} onValueChange={(value) => setData('member_id', value)}>
                                        <SelectTrigger className={errors.member_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select a member (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">No member</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.first_name} {member.last_name} - {member.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.member_id && (
                                        <p className="text-red-500 text-sm">{errors.member_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Assigned User</Label>
                                    <Select value={data.user_id ?? ' '} onValueChange={(value) => setData('user_id', value)}>
                                        <SelectTrigger className={errors.user_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Assign to user (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">No user assigned</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} - {user.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-red-500 text-sm">{errors.user_id}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Note Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Note Content
                            </CardTitle>
                            <CardDescription>
                                Detailed description and content of the note
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="note_text">Note Details</Label>
                                <Textarea
                                    id="note_text"
                                    value={data.note_text}
                                    onChange={(e) => setData('note_text', e.target.value)}
                                    placeholder="Enter detailed note content..."
                                    rows={6}
                                    className={errors.note_text ? 'border-red-500' : ''}
                                />
                                {errors.note_text && (
                                    <p className="text-red-500 text-sm">{errors.note_text}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Note'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
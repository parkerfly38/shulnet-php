import React, { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar, CalendarPlus, Clock, Edit, Trash2, User, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbItem, Note } from '@/types';

interface NoteShowProps {
    note: Note;
}

export default function NoteShow({ note }: NoteShowProps) {
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
            href: `/admin/notes/${note.id}`
        }
    ], [note.name, note.id]);

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the note "${note.name}"?`)) {
            router.delete(`/admin/notes/${note.id}`);
        }
    };

    const handleMarkComplete = () => {
        if (!note.completed_date) {
            router.put(`/admin/notes/${note.id}`, {
                ...note,
                completed_date: new Date().toISOString()
            });
        }
    };

    const handleDownloadICS = () => {
        window.location.href = `/admin/notes/${note.id}/ics`;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPriorityIcon = () => {
        switch (note.priority) {
            case 'High':
                return <AlertTriangle className="h-4 w-4" />;
            case 'Medium':
                return <Clock className="h-4 w-4" />;
            case 'Low':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getPriorityVariant = () => {
        switch (note.priority) {
            case 'High':
                return 'destructive';
            case 'Medium':
                return 'default';
            case 'Low':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusInfo = () => {
        if (note.completed_date) {
            return {
                status: 'Completed',
                variant: 'default' as const,
                icon: <CheckCircle className="h-4 w-4" />
            };
        } else if (note.deadline_date && new Date(note.deadline_date) < new Date()) {
            return {
                status: 'Overdue',
                variant: 'destructive' as const,
                icon: <AlertTriangle className="h-4 w-4" />
            };
        } else {
            return {
                status: 'Pending',
                variant: 'secondary' as const,
                icon: <Clock className="h-4 w-4" />
            };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={note.name} />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{note.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400">Note Details</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/admin/notes/${note.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Status and Priority Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                {getPriorityIcon()}
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</p>
                                    <div className="flex items-center mt-1">
                                        <Badge variant={getPriorityVariant()}>
                                            {note.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                {statusInfo.icon}
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                                    <div className="flex items-center mt-1">
                                        <Badge variant={statusInfo.variant}>
                                            {statusInfo.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scope</p>
                                    <div className="flex items-center mt-1">
                                        <Badge variant="outline">
                                            {note.item_scope}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Visibility</p>
                                    <div className="flex items-center mt-1">
                                        <Badge variant="outline">
                                            {note.visibility}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Note Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Note Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {note.note_text ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="whitespace-pre-wrap">{note.note_text}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No note content available</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {!note.completed_date && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>
                                        Perform quick actions on this note
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex space-x-2">
                                        <Button onClick={handleMarkComplete}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Complete
                                        </Button>
                                        {note.deadline_date && (
                                            <Button onClick={handleDownloadICS} variant="outline">
                                                <CalendarPlus className="h-4 w-4 mr-2" />
                                                Add to Calendar
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timing Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Timing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {note.deadline_date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Deadline
                                        </p>
                                        <p className="text-sm">
                                            {formatDateTime(note.deadline_date)}
                                        </p>
                                    </div>
                                )}

                                {note.completed_date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Completed
                                        </p>
                                        <p className="text-sm">
                                            {formatDateTime(note.completed_date)}
                                        </p>
                                    </div>
                                )}

                                {note.seen_date && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Last Seen
                                        </p>
                                        <p className="text-sm">
                                            {formatDateTime(note.seen_date)}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Created
                                    </p>
                                    <p className="text-sm">
                                        {formatDateTime(note.created_at)}
                                    </p>
                                </div>

                                {note.updated_at !== note.created_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Last Updated
                                        </p>
                                        <p className="text-sm">
                                            {formatDateTime(note.updated_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {note.member && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Related Member
                                        </p>
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm">
                                                {note.member.first_name} {note.member.last_name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{note.member.email}</p>
                                    </div>
                                )}

                                {note.user && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Assigned User
                                        </p>
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="text-sm">{note.user.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{note.user.email}</p>
                                    </div>
                                )}

                                {note.label && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Label
                                        </p>
                                        <Badge variant="outline">{note.label}</Badge>
                                    </div>
                                )}

                                {note.added_by && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Added By
                                        </p>
                                        <p className="text-sm">{note.added_by}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
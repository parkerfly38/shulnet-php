import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, ArrowLeft, User, CalendarDays, Plus, Trash2, FileText } from 'lucide-react';
import { type BreadcrumbItem, type BoardMembership } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Board {
  id: number;
  name: string;
  description?: string;
  members?: BoardMembership[];
  created_at: string;
  updated_at: string;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Props {
  board: Board;
  availableMembers: Member[];
}

export default function BoardsShow({ board, availableMembers }: Readonly<Props>) {
  const [showAddForm, setShowAddForm] = React.useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    member_id: '',
    title: '',
    term_start_date: '',
    term_end_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/boards/${board.id}/members`, {
      onSuccess: () => {
        reset();
        setShowAddForm(false);
      },
    });
  };

  const handleRemoveMember = (memberId: number) => {
    if (confirm('Are you sure you want to remove this member from the board?')) {
      router.delete(`/admin/boards/${board.id}/members/${memberId}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Boards', href: '/admin/boards' },
    { title: board.name, href: `/admin/boards/${board.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={board.name} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/boards">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
              {board.description && (
                <p className="text-muted-foreground mt-2">{board.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/meetings/board/${board.id}`}>
              <Button variant="outline">
                <CalendarDays className="mr-2 h-4 w-4" />
                Meetings
              </Button>
            </Link>
            <Link href={`/admin/reports/board/${board.id}`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link href={`/admin/boards/${board.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Board
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Board Members</CardTitle>
                  <CardDescription>
                    {board.members?.length || 0} member{board.members?.length === 1 ? '' : 's'}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? 'outline' : 'default'}>
                  <Plus className="mr-2 h-4 w-4" />
                  {showAddForm ? 'Cancel' : 'Add Member'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddForm && (
                <Card className="mb-6 bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Member to Board</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="member_id">Member *</Label>
                        <Select value={data.member_id} onValueChange={(value) => setData('member_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.member_id && (
                          <p className="text-sm text-destructive">{errors.member_id}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Title/Position</Label>
                        <Input
                          id="title"
                          value={data.title}
                          onChange={(e) => setData('title', e.target.value)}
                          placeholder="e.g., President, Treasurer, Director"
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="term_start_date">Term Start Date *</Label>
                          <Input
                            id="term_start_date"
                            type="date"
                            value={data.term_start_date}
                            onChange={(e) => setData('term_start_date', e.target.value)}
                            required
                          />
                          {errors.term_start_date && (
                            <p className="text-sm text-destructive">{errors.term_start_date}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="term_end_date">Term End Date</Label>
                          <Input
                            id="term_end_date"
                            type="date"
                            value={data.term_end_date}
                            onChange={(e) => setData('term_end_date', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Leave blank for ongoing</p>
                          {errors.term_end_date && (
                            <p className="text-sm text-destructive">{errors.term_end_date}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                          {processing ? 'Adding...' : 'Add Member'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {board.members && board.members.length > 0 ? (
                <div className="space-y-4">
                  {board.members.map((member) => {
                    const isActive = !member.pivot?.term_end_date ||
                      new Date(member.pivot.term_end_date) >= new Date();

                    return (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4" />
                              <h3 className="font-medium">
                                {member.first_name} {member.last_name}
                              </h3>
                              <Badge variant={isActive ? 'default' : 'secondary'}>
                                {isActive ? 'Active' : 'Expired'}
                              </Badge>
                            </div>

                            {member.pivot?.title && (
                              <div className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Position:</span> {member.pivot.title}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Term Start:</span>
                                <div>
                                  {member.pivot?.term_start_date
                                    ? formatDate(member.pivot.term_start_date)
                                    : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Term End:</span>
                                <div>
                                  {member.pivot?.term_end_date
                                    ? formatDate(member.pivot.term_end_date)
                                    : 'Ongoing'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/admin/members/${member.id}`}>
                              <Button variant="outline" size="sm">
                                View Profile
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No members assigned to this board yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

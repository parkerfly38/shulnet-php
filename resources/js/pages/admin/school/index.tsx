import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    Calendar, 
    FileText, 
    UserPlus,
    Plus,
    ArrowRight,
    TrendingUp,
    School
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'School Management', href: '/admin/school' },
];

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    parent?: {
        first_name: string;
        last_name: string;
    };
    created_at: string;
}

interface Exam {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    subject?: {
        name: string;
    };
}

interface ClassDefinition {
    id: number;
    name: string;
    teacher?: {
        first_name: string;
        last_name: string;
    };
}

interface DashboardStats {
    students: number;
    teachers: number;
    classes: number;
    subjects: number;
    exams: number;
    parents: number;
}

interface SchoolDashboardProps {
    stats: DashboardStats;
    recentStudents: Student[];
    upcomingExams: Exam[];
    activeClasses: ClassDefinition[];
}

export default function SchoolIndexPage({ stats, recentStudents, upcomingExams, activeClasses }: Readonly<SchoolDashboardProps>) {
    const quickActions = [
        { 
            title: 'Mark Attendance', 
            href: '/admin/school/attendance/mark', 
            icon: UserPlus,
            description: 'Take daily attendance',
            color: 'text-emerald-600'
        },
        { 
            title: 'Add Student', 
            href: '/admin/school/students/create', 
            icon: UserPlus,
            description: 'Register a new student',
            color: 'text-blue-600'
        },
        { 
            title: 'Add Teacher', 
            href: '/admin/school/teachers/create', 
            icon: GraduationCap,
            description: 'Add a new teacher',
            color: 'text-green-600'
        },
        { 
            title: 'Create Class', 
            href: '/admin/school/class-definitions/create', 
            icon: School,
            description: 'Set up a new class',
            color: 'text-purple-600'
        },
        { 
            title: 'Schedule Exam', 
            href: '/admin/school/exams/create', 
            icon: FileText,
            description: 'Schedule an exam',
            color: 'text-orange-600'
        },
    ];

    const managementSections = [
        { title: 'Students', href: '/admin/school/students', icon: Users, count: stats.students, color: 'bg-blue-500' },
        { title: 'Teachers', href: '/admin/school/teachers', icon: GraduationCap, count: stats.teachers, color: 'bg-green-500' },
        { title: 'Classes', href: '/admin/school/class-definitions', icon: School, count: stats.classes, color: 'bg-purple-500' },
        { title: 'Subjects', href: '/admin/school/subjects', icon: BookOpen, count: stats.subjects, color: 'bg-indigo-500' },
        { title: 'Exams', href: '/admin/school/exams', icon: Calendar, count: stats.exams, color: 'bg-orange-500' },
        { title: 'Parents', href: '/admin/school/parents', icon: Users, count: stats.parents, color: 'bg-pink-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Management Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Management</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Overview of your school's administration and activities</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardContent>
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-black ${action.color}`}>
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{action.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {managementSections.map((section) => (
                        <Link key={section.href} href={section.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{section.title}</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{section.count}</p>
                                        </div>
                                        <div className={`p-3 rounded-full ${section.color}`}>
                                            <section.icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Students */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Students</CardTitle>
                                <CardDescription>Recently enrolled students</CardDescription>
                            </div>
                            <Link href="/admin/school/students">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentStudents && recentStudents.length > 0 ? (
                                recentStudents.map((student) => (
                                    <Link 
                                        key={student.id} 
                                        href={`/admin/school/students/${student.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {student.parent ? `Parent: ${student.parent.first_name} ${student.parent.last_name}` : student.email}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No students enrolled yet</p>
                                    <Link href="/admin/school/students/create">
                                        <Button variant="link" size="sm" className="mt-2">
                                            Add your first student
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Exams */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Upcoming Exams</CardTitle>
                                <CardDescription>Scheduled examinations</CardDescription>
                            </div>
                            <Link href="/admin/school/exams">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingExams && upcomingExams.length > 0 ? (
                                upcomingExams.map((exam) => (
                                    <Link 
                                        key={exam.id} 
                                        href={`/admin/school/exams/${exam.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{exam.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {exam.subject?.name} • {new Date(exam.start_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No upcoming exams</p>
                                    <Link href="/admin/school/exams/create">
                                        <Button variant="link" size="sm" className="mt-2">
                                            Schedule an exam
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Classes */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Active Classes</CardTitle>
                                <CardDescription>Current class roster</CardDescription>
                            </div>
                            <Link href="/admin/school/class-definitions">
                                <Button variant="ghost" size="sm">
                                    View All <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeClasses && activeClasses.length > 0 ? (
                                activeClasses.map((classItem) => (
                                    <Link 
                                        key={classItem.id} 
                                        href={`/admin/school/class-definitions/${classItem.id}`}
                                        className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                                                <School className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">{classItem.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {classItem.teacher 
                                                        ? `${classItem.teacher.first_name} ${classItem.teacher.last_name}`
                                                        : 'No teacher assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                                    <School className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>No active classes</p>
                                    <Link href="/admin/school/class-definitions/create">
                                        <Button variant="link" size="sm" className="mt-2">
                                            Create your first class
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>
        </AppLayout>
    );
}

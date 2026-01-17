import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { GraduationCap, Calendar, User, Mail, MapPin, Award, BookOpen, CheckCircle, XCircle, Clock, FileText, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClassGrade {
    id: number;
    class_name: string;
    teacher_name: string;
    grade: string | null;
    school_year: string | null;
}

interface SubjectGrade {
    id: number;
    subject_name: string;
    grade: string | null;
}

interface ExamGrade {
    id: number;
    exam_name: string;
    grade: string | null;
    date_taken: string | null;
}

interface AttendanceStats {
    total: number;
    present: number;
    absent: number;
    tardy: number;
    excused: number;
    attendance_rate: number | null;
}

interface RecentAttendance {
    id: number;
    date: string;
    status: string;
    class_name: string;
    notes: string | null;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    gender: string | null;
    date_of_birth: string | null;
    email: string | null;
    address: string | null;
    picture_url: string | null;
    classes: ClassGrade[];
    subject_grades: SubjectGrade[];
    exam_grades: ExamGrade[];
    attendance: AttendanceStats;
    recent_attendances: RecentAttendance[];
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
}

interface Props {
    member: Member;
    students: Student[];
    hasStudents: boolean;
}

export default function StudentsPage({ member, students, hasStudents }: Props) {
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    
    const { data, setData, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        date_of_birth: '',
        email: '',
        address: '',
    });

    const openEditDialog = (student: Student) => {
        setEditingStudent(student);
        setData({
            first_name: student.first_name,
            last_name: student.last_name,
            middle_name: student.middle_name || '',
            gender: student.gender || '',
            date_of_birth: student.date_of_birth || '',
            email: student.email || '',
            address: student.address || '',
        });
    };

    const closeEditDialog = () => {
        setEditingStudent(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        
        put(`/member/students/${editingStudent.id}`, {
            onSuccess: () => {
                closeEditDialog();
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const calculateAge = (dateOfBirth: string | null) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <AppLayout>
            <Head title="My Students" />

            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">My Students</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            View your children's educational information
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

                {!hasStudents ? (
                    <div className="bg-white dark:bg-black rounded-lg border p-8">
                        <div className="text-center">
                            <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No Students Found</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                There are no students associated with your account.
                            </p>
                        </div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="bg-white dark:bg-black rounded-lg border p-8">
                        <div className="text-center">
                            <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No Students Registered</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                No students have been registered yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {students.map((student) => (
                            <div key={student.id} className="bg-white dark:bg-black rounded-lg border overflow-hidden">
                                {/* Student Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                    <div className="flex items-start gap-4">
                                        {student.picture_url ? (
                                            <img
                                                src={student.picture_url}
                                                alt={`${student.first_name} ${student.last_name}`}
                                                className="w-20 h-20 rounded-full border-4 border-white object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center">
                                                <User className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h2 className="text-2xl font-bold">
                                                    {student.first_name} {student.middle_name && student.middle_name + ' '}{student.last_name}
                                                </h2>
                                                <Button
                                                    onClick={() => openEditDialog(student)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-white hover:bg-white/20"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-4 mt-2 text-blue-100">
                                                {student.date_of_birth && (
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(student.date_of_birth)}
                                                        {calculateAge(student.date_of_birth) && (
                                                            <span className="ml-1">({calculateAge(student.date_of_birth)} years old)</span>
                                                        )}
                                                    </div>
                                                )}
                                                {student.gender && (
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-1" />
                                                        {student.gender}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Details */}
                                <div className="p-6 space-y-6">
                                    {/* Contact Information */}
                                    {(student.email || student.address) && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                                                Contact Information
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                {student.email && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        {student.email}
                                                    </div>
                                                )}
                                                {student.address && (
                                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        {student.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Classes */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center">
                                            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                                            Current Classes
                                        </h3>
                                        {student.classes.length === 0 ? (
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                No classes enrolled
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {student.classes.map((classGrade) => (
                                                    <div
                                                        key={classGrade.id}
                                                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                    >
                                                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                            {classGrade.class_name}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            Teacher: {classGrade.teacher_name}
                                                        </div>
                                                        {classGrade.school_year && (
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                Year: {classGrade.school_year}
                                                            </div>
                                                        )}
                                                        {classGrade.grade && (
                                                            <div className="mt-2 text-sm">
                                                                <span className="font-medium">Grade: </span>
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
                                                                    {classGrade.grade}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Subject Grades */}
                                    {student.subject_grades.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                                                Subject Grades
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {student.subject_grades.map((subjectGrade) => (
                                                    <div
                                                        key={subjectGrade.id}
                                                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                                    >
                                                        <div className="font-semibold text-purple-600 dark:text-purple-400">
                                                            {subjectGrade.subject_name}
                                                        </div>
                                                        {subjectGrade.grade && (
                                                            <div className="mt-2">
                                                                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded font-medium">
                                                                    {subjectGrade.grade}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Attendance */}
                                    {student.attendance.total > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                                                Attendance
                                            </h3>
                                            
                                            {/* Attendance Summary */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                <div className="border rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                        {student.attendance.present}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Present</div>
                                                </div>
                                                <div className="border rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                        {student.attendance.absent}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Absent</div>
                                                </div>
                                                <div className="border rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                        {student.attendance.tardy}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tardy</div>
                                                </div>
                                                <div className="border rounded-lg p-3 text-center">
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {student.attendance.excused}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Excused</div>
                                                </div>
                                                <div className="border rounded-lg p-3 text-center bg-blue-50 dark:bg-blue-950">
                                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                        {student.attendance.attendance_rate !== null 
                                                            ? `${student.attendance.attendance_rate}%` 
                                                            : 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Rate</div>
                                                </div>
                                            </div>

                                            {/* Recent Attendance */}
                                            {student.recent_attendances.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                                        Recent Attendance
                                                    </h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                        Date
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                        Class
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                        Status
                                                                    </th>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                        Notes
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                {student.recent_attendances.map((attendance) => (
                                                                    <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                                        <td className="px-4 py-2 text-sm">
                                                                            {formatDate(attendance.date)}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            {attendance.class_name}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm">
                                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                                attendance.status === 'present' 
                                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                                    : attendance.status === 'absent'
                                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                                    : attendance.status === 'tardy'
                                                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                                            }`}>
                                                                                {attendance.status === 'present' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                                                {attendance.status === 'absent' && <XCircle className="w-3 h-3 mr-1" />}
                                                                                {attendance.status === 'tardy' && <Clock className="w-3 h-3 mr-1" />}
                                                                                {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                                                            {attendance.notes || '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Exam Results */}
                                    {student.exam_grades.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                                <Award className="w-5 h-5 mr-2 text-blue-600" />
                                                Exam Results
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Exam
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Grade
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                                Date
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                        {student.exam_grades.map((examGrade) => (
                                                            <tr key={examGrade.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                                <td className="px-4 py-3 text-sm">
                                                                    {examGrade.exam_name}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {examGrade.grade ? (
                                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded">
                                                                            {examGrade.grade}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatDate(examGrade.date_taken)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Edit Student Dialog */}
                <Dialog open={editingStudent !== null} onOpenChange={(open) => !open && closeEditDialog()}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Student Information
                            </DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    className={errors.middle_name ? 'border-red-500' : ''}
                                />
                                {errors.middle_name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.middle_name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className={`w-full rounded-md border ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-950 px-3 py-2 text-sm`}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.gender && (
                                        <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className={errors.date_of_birth ? 'border-red-500' : ''}
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className={errors.address ? 'border-red-500' : ''}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeEditDialog}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

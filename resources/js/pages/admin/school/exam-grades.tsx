import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import SchoolCrud from '@/components/school-crud';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'School Management', href: '/admin/school' },
    { title: 'Exam Grades', href: '/admin/school/exam-grades' },
];

export default function ExamGradesPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exam Grades" />
            <div className="p-4">
                <SchoolCrud
                    title="Exam Grades"
                    endpoint="/api/admin/exam-grades"
                    fields={[
                        { name: 'exam_id', label: 'Exam', type: 'select', optionsEndpoint: '/api/admin/exams' },
                        { name: 'student_id', label: 'Student', type: 'select', optionsEndpoint: '/api/admin/students' },
                        { name: 'score', label: 'Score', type: 'number' },
                        { name: 'grade', label: 'Grade', type: 'text' },
                    ]}
                />
            </div>
        </AppLayout>
    );
}

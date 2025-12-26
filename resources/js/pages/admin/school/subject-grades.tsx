import React from 'react';
import SchoolCrud from '@/components/school-crud';

export default function SubjectGradesPage() {
    return (
        <div className="p-4">
            <SchoolCrud
                title="Subject Grades"
                endpoint="/api/admin/subject-grades"
                fields={[
                    { name: 'subject_id', label: 'Subject', type: 'select', optionsEndpoint: '/api/admin/subjects' },
                    { name: 'student_id', label: 'Student', type: 'select', optionsEndpoint: '/api/admin/students' },
                    { name: 'grade', label: 'Grade', type: 'text' },
                ]}
            />
        </div>
    );
}

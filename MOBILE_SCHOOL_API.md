# Mobile School Management API

API endpoints for mobile school management, accessible to users with **Admin** or **Teacher** roles.

## Authentication

All endpoints require authentication using Laravel Sanctum tokens.

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "your-password",
  "device_name": "iPhone 15 Pro" // optional, defaults to "Mobile App"
}
```

**Response (with member record):**
```json
{
  "message": "Login successful",
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "teacher@example.com",
    "roles": ["teacher"]
  },
  "member": {
    "id": 5,
    "first_name": "John",
    "last_name": "Smith",
    "email": "teacher@example.com"
  }
}
```

**Response (without member record):**
```json
{
  "message": "Login successful",
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "teacher@example.com",
    "roles": ["admin", "teacher"]
  },
  "member": null
}
```

**Note:** 
- The `user.name` field is always returned regardless of whether a member record exists
- The `user.roles` array contains all roles assigned to the user (e.g., `admin`, `teacher`, `member`, `parent`, `student`)
- The `member` object is only populated if the user has an associated member record in the system

### Using the Token

Include the token in the Authorization header for all subsequent requests:
```http
Authorization: Bearer your-sanctum-token
```

## Base URL

- School management endpoints: `/api/school`
- Admin dashboard endpoints: `/api/admin`

## Dashboard Endpoints

### Admin Dashboard

Get comprehensive administrative dashboard data including membership statistics, yahrzeits, events, and invoices.

**Requires:** Admin role

```http
GET /api/admin/dashboard
Authorization: Bearer your-token
```

**Response:**
```json
{
  "stats": {
    "total_members": 250,
    "active_members": 200,
    "total_students": 75,
    "total_invoices": 150,
    "open_invoices": 25,
    "total_events": 12
  },
  "members_joined_data": [
    {"month": "Jan", "members": 5},
    {"month": "Feb", "members": 3},
    {"month": "Mar", "members": 8},
    ...
  ],
  "current_year": 2024,
  "current_hebrew_date": {
    "day": 15,
    "month": "Adar",
    "year": 5784
  },
  "current_month_yahrzeits": [
    {
      "id": 1,
      "name": "Sarah Cohen",
      "hebrew_name": "שרה כהן",
      "hebrew_day_of_death": 10,
      "date_of_death": "2020-03-15"
    }
  ],
  "upcoming_events": [
    {
      "id": 5,
      "name": "Shabbat Service",
      "event_start": "2024-03-22T18:00:00Z",
      "event_end": "2024-03-22T20:00:00Z",
      "location": "Main Sanctuary",
      "members_only": true
    }
  ],
  "recent_invoices": [
    {
      "id": 123,
      "invoice_number": "INV-2024-123",
      "member_name": "David Levy",
      "total": 500.00,
      "status": "open",
      "due_date": "2024-04-01"
    }
  ],
  "invoice_aging": {
    "current": {"count": 10, "total": 5000.00},
    "1-30": {"count": 8, "total": 3200.00},
    "31-60": {"count": 4, "total": 1500.00},
    "61-90": {"count": 2, "total": 800.00},
    "90+": {"count": 1, "total": 250.00}
  }
}
```

### School Dashboard

Get school-specific dashboard data including statistics, recent students, upcoming exams, and active classes.

**Requires:** Admin or Teacher role

```http
GET /api/school/dashboard
Authorization: Bearer your-token
```

**Response:**
```json
{
  "stats": {
    "total_students": 75,
    "total_teachers": 8,
    "total_classes": 12,
    "total_subjects": 15,
    "total_exams": 20,
    "total_parents": 60
  },
  "recent_students": [
    {
      "id": 42,
      "first_name": "Emma",
      "last_name": "Cohen",
      "email": "emma.cohen@example.com",
      "date_of_birth": "2010-05-15",
      "parent_name": "Rachel Cohen"
    }
  ],
  "upcoming_exams": [
    {
      "id": 10,
      "name": "Hebrew Reading Test",
      "start_date": "2024-03-25",
      "end_date": "2024-03-25"
    }
  ],
  "active_classes": [
    {
      "id": 5,
      "name": "Hebrew 101",
      "description": "Beginning Hebrew",
      "teacher_name": "Sarah Goldstein"
    }
  ],
  "recent_attendance": [
    {
      "id": 150,
      "student_name": "Emma Cohen",
      "class_name": "Hebrew 101",
      "attendance_date": "2024-03-20",
      "status": "present"
    }
  ]
}
```

## School Management Endpoints

All school management endpoints are prefixed with `/api/school`

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/students` | List all students (paginated) |
| POST | `/api/school/students` | Create a new student |
| GET | `/api/school/students/{id}` | Get student details |
| PUT | `/api/school/students/{id}` | Update a student |
| DELETE | `/api/school/students/{id}` | Delete a student |

**Query Parameters (GET list):**
- `per_page` - Items per page (default: 25)
- `page` - Page number
- `q` - Search query (searches name, email)

**Example:**
```http
GET /api/school/students?per_page=10&q=Cohen
Authorization: Bearer your-token
```

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/attendance` | List attendance records |
| POST | `/api/school/attendance` | Create/update attendance records |
| GET | `/api/school/attendance/{id}` | Get attendance record |
| PUT | `/api/school/attendance/{id}` | Update attendance record |
| DELETE | `/api/school/attendance/{id}` | Delete attendance record |

**Query Parameters (GET list):**
- `date` - Filter by date (YYYY-MM-DD)
- `student_id` - Filter by student
- `class_id` - Filter by class
- `status` - Filter by status (present, absent, tardy, excused)

**Create Attendance Example:**
```http
POST /api/school/attendance
Authorization: Bearer your-token
Content-Type: application/json

{
  "attendances": [
    {
      "student_id": 1,
      "attendance_date": "2026-02-24",
      "status": "present",
      "class_definition_id": 5,
      "notes": "On time"
    },
    {
      "student_id": 2,
      "attendance_date": "2026-02-24",
      "status": "tardy",
      "notes": "Late 10 minutes"
    }
  ]
}
```

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/classes` | List all classes |
| POST | `/api/school/classes` | Create a new class |
| GET | `/api/school/classes/{id}` | Get class details |
| PUT | `/api/school/classes/{id}` | Update a class |
| DELETE | `/api/school/classes/{id}` | Delete a class |

### Class Grades

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/class-grades` | List class grades |
| POST | `/api/school/class-grades` | Create a class grade |
| GET | `/api/school/class-grades/{id}` | Get grade details |
| PUT | `/api/school/class-grades/{id}` | Update a grade |
| DELETE | `/api/school/class-grades/{id}` | Delete a grade |

### Exams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/exams` | List all exams |
| POST | `/api/school/exams` | Create a new exam |
| GET | `/api/school/exams/{id}` | Get exam details |
| PUT | `/api/school/exams/{id}` | Update an exam |
| DELETE | `/api/school/exams/{id}` | Delete an exam |

### Exam Grades

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/exam-grades` | List exam grades |
| POST | `/api/school/exam-grades` | Create an exam grade |
| GET | `/api/school/exam-grades/{id}` | Get grade details |
| PUT | `/api/school/exam-grades/{id}` | Update a grade |
| DELETE | `/api/school/exam-grades/{id}` | Delete a grade |

### Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/subjects` | List all subjects |
| POST | `/api/school/subjects` | Create a new subject |
| GET | `/api/school/subjects/{id}` | Get subject details |
| PUT | `/api/school/subjects/{id}` | Update a subject |
| DELETE | `/api/school/subjects/{id}` | Delete a subject |

### Subject Grades

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/subject-grades` | List subject grades |
| POST | `/api/school/subject-grades` | Create a subject grade |
| GET | `/api/school/subject-grades/{id}` | Get grade details |
| PUT | `/api/school/subject-grades/{id}` | Update a grade |
| DELETE | `/api/school/subject-grades/{id}` | Delete a grade |

### Teachers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/teachers` | List all teachers |
| POST | `/api/school/teachers` | Create a new teacher |
| GET | `/api/school/teachers/{id}` | Get teacher details |
| PUT | `/api/school/teachers/{id}` | Update a teacher |
| DELETE | `/api/school/teachers/{id}` | Delete a teacher |

### Parents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/parents` | List all parents |
| POST | `/api/school/parents` | Create a new parent |
| GET | `/api/school/parents/{id}` | Get parent details |
| PUT | `/api/school/parents/{id}` | Update a parent |
| DELETE | `/api/school/parents/{id}` | Delete a parent |

## Role-Based Access

### Available Roles

The system supports the following user roles:
- **admin** - Full system access, including school management
- **teacher** - Access to school management features
- **member** - Standard member access (member portal)
- **parent** - Parent-specific features
- **student** - Student-specific features

Users can have multiple roles assigned simultaneously (e.g., a user can be both `admin` and `teacher`).

### School Management Access

The `/api/school/*` endpoints are accessible to users with either:
- **Admin** role - Full access to all endpoints
- **Teacher** role - Full access to all school management endpoints

If a user without the required role attempts to access these endpoints, they will receive:
```json
{
  "message": "Insufficient permissions. Required roles: Administrator, Teacher"
}
```

## Response Format

### Success Response (List)
```json
{
  "current_page": 1,
  "data": [...],
  "first_page_url": "...",
  "from": 1,
  "last_page": 5,
  "per_page": 25,
  "to": 25,
  "total": 100
}
```

### Success Response (Single Item)
```json
{
  "id": 1,
  "first_name": "Sarah",
  "last_name": "Cohen",
  "email": "sarah@example.com",
  ...
}
```

### Error Response
```json
{
  "message": "Error message here",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

## HTTP Status Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

## Example Mobile App Integration

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://your-domain.com';

// Login and store token
async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email, 
      password,
      device_name: 'My iPhone' // optional
    }),
  });
  
  const data = await response.json();
  
  // Store authentication data
  await AsyncStorage.setItem('authToken', data.token);
  await AsyncStorage.setItem('userName', data.user.name);
  await AsyncStorage.setItem('userRoles', JSON.stringify(data.user.roles));
  
  return data;
}

// Check if user has teacher or admin role
async function canAccessSchoolManagement() {
  const rolesJson = await AsyncStorage.getItem('userRoles');
  const roles = JSON.parse(rolesJson || '[]');
  
  return roles.includes('admin') || roles.includes('teacher');
}

// Get students
async function getStudents(page = 1) {
  const token = await AsyncStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/school/students?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
}

// Mark attendance
async function markAttendance(attendanceData) {
  const token = await AsyncStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE}/api/school/attendance`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attendances: attendanceData }),
  });
  
  return await response.json();
}
```

## Notes

- All list endpoints support pagination
- All list endpoints support search via the `q` parameter
- Dates should be in `YYYY-MM-DD` format
- The API uses Laravel Sanctum for authentication
- Tokens don't expire by default but can be revoked via `/api/logout`

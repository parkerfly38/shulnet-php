# React Native API Guide

This document outlines how to use the ShulNet API from a React Native application.

## Authentication

### 1. Login (Mobile App)

**Endpoint:** `POST /api/login`

**Auth Required:** No (uses email/password)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "device_name": "iPhone 14"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "1|abcdef123456...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

**Store the token** in secure storage (e.g., `react-native-keychain`) and include it in all subsequent requests:

```
Authorization: Bearer 1|abcdef123456...
```

**Note:** The `device_name` field is optional and defaults to "Mobile App" if not provided.

---

### 2. Create API Token (Admin Only)

**Endpoint:** `POST /api/tokens/create`

**Auth Required:** No (but requires admin user credentials)

**Note:** This endpoint is for admin users to create API tokens for server-to-server authentication. Regular members should use `POST /api/login` instead.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "token_name": "Server Integration"
}
```

---

### 3. Logout

**Endpoint:** `POST /api/logout`

**Auth Required:** Yes (Sanctum Bearer token)

**Description:** Revokes the current access token. After logout, the token can no longer be used.

**Request:** No body required, just include the Authorization header.

**Response:**
```json
{
  "message": "Logout successful"
}
```

**After logout:** Remove the token from secure storage on the device.

---

## Member Portal API Endpoints

All member portal endpoints require authentication via Sanctum bearer token.

**Base URL:** `/api/member`

**Headers:**
```
Authorization: Bearer {your-token}
Accept: application/json
Content-Type: application/json
```

---

### Dashboard

**Endpoint:** `GET /api/member/dashboard`

**Description:** Get member dashboard data including recent invoices, students, upcoming yahrzeits, aliyah assignments, and events.

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "invoices": [
    {
      "id": 123,
      "invoice_number": "INV-2026-001",
      "description": "Membership Dues",
      "total_amount": "500.00",
      "status": "open",
      "due_date": "2026-03-15",
      "created_at": "2026-02-01T00:00:00.000000Z"
    }
  ],
  "students": [
    {
      "id": 45,
      "first_name": "Sarah",
      "last_name": "Doe",
      "email": "sarah@example.com",
      "classes": [...]
    }
  ],
  "yahrzeits": [...],
  "assignments": [...],
  "events": [...],
  "isBirthday": false,
  "isAnniversary": false
}
```

---

### Profile

#### Get Profile

**Endpoint:** `GET /api/member/profile`

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone1": "555-1234",
    "phone2": null,
    "address_line_1": "123 Main St",
    "address_line_2": null,
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "hebrew_name": "Yochanan",
    "father_hebrew_name": "David",
    "mother_hebrew_name": "Rachel",
    "date_of_birth": "1980-01-15T00:00:00.000000Z",
    "anniversary_date": "2005-06-20T00:00:00.000000Z"
  }
}
```

#### Update Profile

**Endpoint:** `PUT /api/member/profile`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone1": "555-1234",
  "phone2": null,
  "address_line_1": "123 Main St",
  "address_line_2": null,
  "city": "New York",
  "state": "NY",
  "zip": "10001",
  "hebrew_name": "Yochanan",
  "father_hebrew_name": "David",
  "mother_hebrew_name": "Rachel",
  "date_of_birth": "1980-01-15",
  "anniversary_date": "2005-06-20"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "member": { ... }
}
```

---

### Invoices

#### Get All Invoices

**Endpoint:** `GET /api/member/invoices`

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  },
  "invoices": [
    {
      "id": 123,
      "invoice_number": "INV-2026-001",
      "invoice_date": "2026-02-01",
      "due_date": "2026-03-15",
      "status": "open",
      "total": "500.00",
      "amount_paid": "0.00",
      "balance": "500.00",
      "notes": "Membership dues for 2026"
    }
  ]
}
```

#### Get Single Invoice

**Endpoint:** `GET /api/member/invoices/{id}`

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone1": "555-1234",
    "address_line_1": "123 Main St",
    "address_line_2": null,
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "invoice": {
    "id": 123,
    "invoice_number": "INV-2026-001",
    "invoice_date": "2026-02-01",
    "due_date": "2026-03-15",
    "status": "open",
    "subtotal": "500.00",
    "tax_amount": "0.00",
    "total": "500.00",
    "amount_paid": "0.00",
    "balance": "500.00",
    "notes": "Membership dues for 2026",
    "created_at": "2026-02-01T00:00:00.000000Z",
    "items": [
      {
        "id": 1,
        "description": "Annual Membership",
        "quantity": 1,
        "unit_price": "500.00",
        "total": "500.00"
      }
    ],
    "payments": []
  }
}
```

---

### Students

**Endpoint:** `GET /api/member/students`

**Description:** Get all students associated with the member's parent account, including grades, attendance, and class information.

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  },
  "students": [
    {
      "id": 45,
      "first_name": "Sarah",
      "last_name": "Doe",
      "middle_name": null,
      "gender": "female",
      "date_of_birth": "2010-05-15",
      "email": "sarah@example.com",
      "address": "123 Main St",
      "picture_url": null,
      "classes": [...],
      "subject_grades": [...],
      "exam_grades": [...],
      "attendance": {
        "total": 120,
        "present": 115,
        "absent": 2,
        "tardy": 3,
        "excused": 0,
        "attendance_rate": 95.8
      },
      "recent_attendances": [...]
    }
  ],
  "hasStudents": true
}
```

---

### Yahrzeits

**Endpoint:** `GET /api/member/yahrzeits`

**Description:** Get all yahrzeits for the member, including calculated next occurrence dates.

**Response:**
```json
{
  "member": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  },
  "yahrzeits": [
    {
      "id": 10,
      "name": "David Doe",
      "hebrew_name": "David ben Avraham",
      "relationship": "Father",
      "date_of_death": "2020-03-15",
      "hebrew_date_of_death": "20 Adar 5780",
      "next_occurrence": "2026-03-15",
      "days_until": 28
    }
  ]
}
```

---

## Error Responses

All API endpoints may return error responses in the following format:

**404 Not Found:**
```json
{
  "error": "No member profile found."
}
```

**403 Forbidden:**
```json
{
  "error": "You do not have permission to view this invoice."
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthenticated."
}
```

**422 Validation Error:**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## React Native Implementation Example

```typescript
// api/client.ts
import * as Keychain from 'react-native-keychain';

const API_BASE_URL = 'https://your-domain.com';

async function getToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword();
  return credentials ? credentials.password : null;
}

async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('api_token', token);
}

async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword();
}

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getToken();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'API request failed');
  }

  return response.json();
}

// Authentication
export async function login(
  email: string,
  password: string,
  deviceName?: string
): Promise<{ token: string; user: any; member: any }> {
  const data = await apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      device_name: deviceName || 'React Native App',
    }),
  });

  const token = data.token;
  await setToken(token);
  return {
    token,
    user: data.user,
    member: data.member,
  };
}

export async function logout(): Promise<void> {
  try {
    // Revoke token on server
    await apiRequest('/api/logout', { method: 'POST' });
  } catch (error) {
    // Even if server logout fails, clear local token
    console.error('Logout error:', error);
  } finally {
    await clearToken();
  }
}

// Member Portal
export async function getDashboard() {
  return apiRequest('/api/member/dashboard');
}

export async function getProfile() {
  return apiRequest('/api/member/profile');
}

export async function updateProfile(data: any) {
  return apiRequest('/api/member/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getInvoices() {
  return apiRequest('/api/member/invoices');
}

export async function getInvoice(id: number) {
  return apiRequest(`/api/member/invoices/${id}`);
}

export async function getStudents() {
  return apiRequest('/api/member/students');
}

export async function getYahrzeits() {
  return apiRequest('/api/member/yahrzeits');
}
```

---

## CORS Configuration

Make sure your Laravel application is configured to accept requests from your React Native app. Update `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_origins' => [
    'http://localhost:19006',  // Expo development
    'capacitor://localhost',    // Capacitor iOS
    'http://localhost',         // Capacitor Android
],
```

---

## Testing with cURL

```bash
# 1. Login and get token
curl -X POST https://your-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "device_name": "Test Device"
  }'

# 2. Use token to access member dashboard
curl https://your-domain.com/api/member/dashboard \
  -H "Authorization: Bearer 1|your-token-here" \
  -H "Accept: application/json"

# 3. Update profile
curl -X PUT https://your-domain.com/api/member/profile \
  -H "Authorization: Bearer 1|your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone1": "555-1234"
  }'

# 4. Logout (revoke token)
curl -X POST https://your-domain.com/api/logout \
  -H "Authorization: Bearer 1|your-token-here" \
  -H "Accept: application/json"
```

---

## Next Steps

1. **Set up your React Native project** with TypeScript
2. **Install dependencies:**
   ```bash
   npm install react-native-keychain
   ```
3. **Create typed interfaces** matching the API responses (reuse types from `resources/js/types/index.d.ts`)
4. **Implement authentication flow** with token storage
5. **Build UI components** using React Native components (not web components)
6. **Test on both iOS and Android**

---

## Shared Code Recommendations

Consider creating a shared npm package for:
- **TypeScript interfaces** (`Member`, `Invoice`, `Student`, etc.)
- **Utility functions** (`formatCurrency`, `formatDate`)
- **Validation rules** (email, phone, zip code)
- **Constants** (status values, payment methods)

This allows both your web and mobile apps to use the same type definitions and business logic.

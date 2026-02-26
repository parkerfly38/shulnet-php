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

#### Pay Invoice

**Endpoint:** `POST /api/member/invoices/{id}/pay`

**Description:** Process a payment for an invoice from an external payment system. Use this endpoint when your mobile app handles payment processing (e.g., Stripe, PayPal, or other payment SDK) and needs to record the payment in ShulNet.

**Request Body:**
```json
{
  "amount": 250.00,
  "payment_method": "stripe",
  "transaction_id": "pi_3ABC123DEF456GHI",
  "payment_details": {
    "card_last4": "4242",
    "card_brand": "visa"
  }
}
```

**Request Parameters:**
- `amount` (required): Payment amount (must be between 0.01 and the invoice balance)
- `payment_method` (required): One of: `stripe`, `authorize_net`, `paypal`, `credit_card`, `external`
- `transaction_id` (optional): Transaction ID from the payment processor
- `payment_details` (optional): Additional payment details as an object

**Response:**
```json
{
  "success": true,
  "message": "Partial payment processed successfully!",
  "payment": {
    "id": 42,
    "amount": 250.00,
    "payment_method": "stripe",
    "transaction_id": "pi_3ABC123DEF456GHI",
    "status": "completed",
    "paid_at": "2026-03-10T15:30:00.000000Z"
  },
  "invoice": {
    "id": 123,
    "invoice_number": "INV-2026-001",
    "description": "Membership dues for 2026",
    "total": "500.00",
    "amount_paid": "250.00",
    "balance": "250.00",
    "status": "partial",
    "due_date": "2026-03-15",
    "items": [
      {
        "id": 1,
        "description": "Annual Membership",
        "quantity": 1,
        "unit_price": "500.00",
        "amount": "500.00",
        "amount_paid": "0.00"
      }
    ]
  }
}
```

**Error Responses:**

404 Not Found:
```json
{
  "error": "Invoice not found."
}
```

403 Forbidden:
```json
{
  "error": "You do not have permission to pay this invoice."
}
```

400 Bad Request:
```json
{
  "error": "This invoice has already been paid."
}
```

**Example Usage:**

After processing a payment through Stripe or another payment provider in your React Native app, call this endpoint to record the payment:

```typescript
// 1. Process payment with Stripe (or other provider)
const paymentIntent = await stripe.confirmPayment({
  amount: 25000, // $250.00 in cents
  // ... other Stripe parameters
});

// 2. Record the payment in ShulNet
const response = await fetch('https://shulnet.example.com/api/member/invoices/123/pay', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    amount: 250.00,
    payment_method: 'stripe',
    transaction_id: paymentIntent.id,
    payment_details: {
      card_last4: paymentIntent.payment_method.card.last4,
      card_brand: paymentIntent.payment_method.card.brand,
    }
  })
});

const data = await response.json();
console.log(data.message); // "Partial payment processed successfully!"
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

## Admin Dashboard API

**Requires:** Admin role

### Get Admin Dashboard Data

**Endpoint:** `GET /api/admin/dashboard`

**Description:** Get comprehensive administrative dashboard data including membership statistics, yahrzeits, events, invoices, and financial aging reports.

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
    {"month": "Apr", "members": 6},
    {"month": "May", "members": 4},
    {"month": "Jun", "members": 7},
    {"month": "Jul", "members": 2},
    {"month": "Aug", "members": 9},
    {"month": "Sep", "members": 11},
    {"month": "Oct", "members": 5},
    {"month": "Nov", "members": 3},
    {"month": "Dec", "members": 6}
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
      "event_start": "2024-03-22T18:00:00.000000Z",
      "event_end": "2024-03-22T20:00:00.000000Z",
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

---

## School Dashboard API

**Requires:** Admin or Teacher role

### Get School Dashboard Data

**Endpoint:** `GET /api/school/dashboard`

**Description:** Get school-specific dashboard data including statistics, recent students, upcoming exams, active classes, and recent attendance.

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

export async function payInvoice(
  id: number,
  amount: number,
  paymentMethod: string,
  transactionId?: string,
  paymentDetails?: any
) {
  return apiRequest(`/api/member/invoices/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({
      amount,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_details: paymentDetails,
    }),
  });
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

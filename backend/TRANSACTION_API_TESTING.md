# Transaction API Endpoints - Testing Guide

## Overview
RESTful API endpoints for managing income and expense transactions with full CRUD operations, filtering, pagination, and file upload support.

## Base URL
```
http://localhost:8000
```

## Authentication
All transaction endpoints require JWT authentication. Include the access token in the Authorization header:

```bash
Authorization: Bearer {access_token}
```

### Get Access Token
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"courage@example.com","password":"courage"}'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

---

## Transaction Endpoints

### 1. Create Transaction
**POST** `/api/transactions`

Create a new income or expense transaction.

**Request Body:**
```json
{
  "type": "expense",
  "amount_cents": 2500,
  "category_id": "55555555-5555-5555-5555-555555555555",
  "description": "Coffee and snacks",
  "occurred_at": "2024-11-04T10:30:00Z"
}
```

**Fields:**
- `type` (required): `"income"` or `"expense"`
- `amount_cents` (required): Positive integer (e.g., 2500 = $25.00)
- `category_id` (optional): UUID of category (must belong to user)
- `description` (optional): String, max 500 chars
- `receipt_url` (optional): Path to receipt file
- `occurred_at` (optional): ISO 8601 datetime (defaults to now, cannot be future)
- `metadata_` (optional): JSON object for additional data

**Business Rules:**
- ✅ Amount must be positive (> 0)
- ✅ Transaction date cannot be in the future
- ✅ Category must belong to the user

**Example:**
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount_cents": 2500,
    "category_id": "55555555-5555-5555-5555-555555555555",
    "description": "Coffee and snacks",
    "occurred_at": "2024-11-04T10:30:00Z"
  }'
```

**Response (201 Created):**
```json
{
  "id": "c106ce31-05f5-41e1-8a9b-4c4199c3e490",
  "user_id": "22222222-2222-2222-2222-222222222222",
  "category_id": "55555555-5555-5555-5555-555555555555",
  "type": "expense",
  "amount_cents": 2500,
  "occurred_at": "2024-11-04T10:30:00Z",
  "description": "Coffee and snacks",
  "receipt_url": null,
  "metadata_": null,
  "created_at": "2025-11-05T04:33:36.656457Z"
}
```

---

### 2. List Transactions
**GET** `/api/transactions`

List transactions with filtering, sorting, and pagination.

**Query Parameters:**
- `type`: Filter by type (`income` or `expense`)
- `category_id`: Filter by category UUID
- `start_date`: Filter by start date (ISO 8601)
- `end_date`: Filter by end date (ISO 8601)
- `min_amount`: Minimum amount in cents
- `max_amount`: Maximum amount in cents
- `sort_by`: Sort column (`occurred_at`, `amount_cents`, `category_id`) - default: `occurred_at`
- `sort_order`: Sort direction (`asc` or `desc`) - default: `desc`
- `page`: Page number (min: 1) - default: 1
- `limit`: Results per page (min: 1, max: 100) - default: 50

**Example: List all transactions**
```bash
curl -X GET "http://localhost:8000/api/transactions" \
  -H "Authorization: Bearer $TOKEN"
```

**Example: Filter expenses only**
```bash
curl -X GET "http://localhost:8000/api/transactions?type=expense&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Example: Filter by date range and category**
```bash
curl -X GET "http://localhost:8000/api/transactions?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z&category_id=55555555-5555-5555-5555-555555555555" \
  -H "Authorization: Bearer $TOKEN"
```

**Example: Sort by amount ascending**
```bash
curl -X GET "http://localhost:8000/api/transactions?sort_by=amount_cents&sort_order=asc" \
  -H "Authorization: Bearer $TOKEN"
```

**Example: Pagination**
```bash
curl -X GET "http://localhost:8000/api/transactions?page=2&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
[
  {
    "id": "99999999-9999-9999-9999-999999999999",
    "user_id": "22222222-2222-2222-2222-222222222222",
    "category_id": null,
    "type": "income",
    "amount_cents": 250000,
    "occurred_at": "2025-10-26T03:38:02.983824Z",
    "description": "Paycheck",
    "receipt_url": null,
    "metadata_": null,
    "created_at": "2025-11-05T03:38:02.570536Z"
  }
]
```

**Authorization:**
- Regular users see only their own transactions
- Admins see all transactions

---

### 3. Get Single Transaction
**GET** `/api/transactions/{transaction_id}`

Retrieve a specific transaction by ID.

**Example:**
```bash
curl -X GET "http://localhost:8000/api/transactions/c106ce31-05f5-41e1-8a9b-4c4199c3e490" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200 OK):**
```json
{
  "id": "c106ce31-05f5-41e1-8a9b-4c4199c3e490",
  "user_id": "22222222-2222-2222-2222-222222222222",
  "category_id": "55555555-5555-5555-5555-555555555555",
  "type": "expense",
  "amount_cents": 2500,
  "occurred_at": "2024-11-04T10:30:00Z",
  "description": "Coffee and snacks",
  "receipt_url": null,
  "metadata_": null,
  "created_at": "2025-11-05T04:33:36.656457Z"
}
```

**Errors:**
- `404 Not Found`: Transaction doesn't exist or doesn't belong to user

---

### 4. Update Transaction
**PUT** `/api/transactions/{transaction_id}`

Update an existing transaction (full replacement).

**Request Body:** Same as Create Transaction

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/transactions/c106ce31-05f5-41e1-8a9b-4c4199c3e490" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount_cents": 3000,
    "category_id": "55555555-5555-5555-5555-555555555555",
    "description": "Coffee, snacks, and tip",
    "occurred_at": "2024-11-04T10:30:00Z"
  }'
```

**Response (200 OK):**
```json
{
  "id": "c106ce31-05f5-41e1-8a9b-4c4199c3e490",
  "user_id": "22222222-2222-2222-2222-222222222222",
  "category_id": "55555555-5555-5555-5555-555555555555",
  "type": "expense",
  "amount_cents": 3000,
  "occurred_at": "2024-11-04T10:30:00Z",
  "description": "Coffee, snacks, and tip",
  "receipt_url": null,
  "metadata_": null,
  "created_at": "2025-11-05T04:33:36.656457Z"
}
```

**Authorization:**
- Users can only update their own transactions
- Admins can update any transaction

**Errors:**
- `404 Not Found`: Transaction doesn't exist or doesn't belong to user
- `400 Bad Request`: Validation errors (future date, negative amount, etc.)

---

### 5. Delete Transaction
**DELETE** `/api/transactions/{transaction_id}`

Delete a transaction permanently.

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/transactions/c106ce31-05f5-41e1-8a9b-4c4199c3e490" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (204 No Content)**
No response body.

**Authorization:**
- Users can only delete their own transactions
- Admins can delete any transaction

**Errors:**
- `404 Not Found`: Transaction doesn't exist or doesn't belong to user

---

## File Upload Endpoints

### 6. Upload Receipt
**POST** `/api/files/receipts`

Upload a receipt image for a transaction.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Allowed formats: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.gif`
- Max size: 10MB

**Example:**
```bash
curl -X POST "http://localhost:8000/api/files/receipts" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/receipt.jpg"
```

**Response (201 Created):**
```json
{
  "url": "/api/files/receipts/22222222-2222-2222-2222-222222222222_a3b4c5d6-e7f8-9012-3456-789abcdef012.jpg",
  "filename": "22222222-2222-2222-2222-222222222222_a3b4c5d6-e7f8-9012-3456-789abcdef012.jpg"
}
```

**Usage:**
1. Upload receipt file
2. Get the `url` from response
3. Use the `url` as `receipt_url` when creating/updating a transaction

**Security:**
- Files are prefixed with user ID
- Users can only access their own receipts
- Admins can access all receipts

---

### 7. Get Receipt
**GET** `/api/files/receipts/{filename}`

Retrieve an uploaded receipt file.

**Example:**
```bash
curl -X GET "http://localhost:8000/api/files/receipts/22222222-2222-2222-2222-222222222222_a3b4c5d6.jpg" \
  -H "Authorization: Bearer $TOKEN" \
  --output receipt.jpg
```

**Response:**
Binary file content with appropriate Content-Type header.

---

### 8. Delete Receipt
**DELETE** `/api/files/receipts/{filename}`

Delete an uploaded receipt file.

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/files/receipts/22222222-2222-2222-2222-222222222222_a3b4c5d6.jpg" \
  -H "Authorization: Bearer $TOKEN"
```

**Response (204 No Content)**

---

## Complete Workflow Example

### 1. Login and get token
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"courage@example.com","password":"courage"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
```

### 2. Upload a receipt
```bash
RECEIPT=$(curl -s -X POST "http://localhost:8000/api/files/receipts" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@receipt.jpg" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['url'])")
```

### 3. Create transaction with receipt
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"type\": \"expense\",
    \"amount_cents\": 4599,
    \"category_id\": \"55555555-5555-5555-5555-555555555555\",
    \"description\": \"Lunch at restaurant\",
    \"receipt_url\": \"$RECEIPT\"
  }"
```

### 4. List all expenses
```bash
curl -X GET "http://localhost:8000/api/transactions?type=expense" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Update transaction
```bash
curl -X PUT "http://localhost:8000/api/transactions/{id}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount_cents": 5000,
    "category_id": "55555555-5555-5555-5555-555555555555",
    "description": "Lunch at restaurant (updated with tip)"
  }'
```

### 6. Delete transaction
```bash
curl -X DELETE "http://localhost:8000/api/transactions/{id}" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Transaction date cannot be in the future"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Transaction not found"
}
```

---

## Test Data

### Demo Users
- **Student**: `courage@example.com` / `courage`
- **Admin**: `admin@example.com` / `admin`

### Categories (belonging to courage user)
- **Rent**: `44444444-4444-4444-4444-444444444444` ($1200/month limit)
- **Groceries**: `55555555-5555-5555-5555-555555555555` ($400/month limit)
- **Transport**: `66666666-6666-6666-6666-666666666666` ($150/month limit)

### Existing Transactions
Run `make seed` to populate with sample transactions.

---

## API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to:
- View all endpoints
- See request/response schemas
- Test endpoints directly in the browser
- Authenticate with JWT tokens

---

## Summary

✅ **CRUD Operations**: Create, Read, Update, Delete transactions
✅ **Filtering**: By type, category, date range, amount range
✅ **Sorting**: By date, amount, or category
✅ **Pagination**: Page-based with configurable limit
✅ **Authorization**: User isolation, admin access
✅ **File Upload**: Receipt images with local storage
✅ **Validation**: Business rules enforced (no future dates, positive amounts, category ownership)
✅ **REST Compliant**: Standard HTTP methods and status codes

All endpoints tested and working! 🎉

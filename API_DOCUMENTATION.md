# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

### Success Response (2xx)
```json
{
  "success": true,
```json
{
  "success": true,
  "message": "Branches fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Main Branch",
      "manager_name": "John Doe",
      "address": "123 Main St",
      "contact": "555-0100",
      "ext_no": "101",
      "service_station": "Central",
      "region": "North",
      "createdAt": "2025-12-09T10:00:00Z",
      "updatedAt": "2025-12-09T10:00:00Z"
    }
  ]
}
```

### Get Branch by ID
**GET** `/branches/:id`

**Headers**: Requires authentication

**Response** (200):
```json
{
  "success": true,
  "message": "Branch fetched successfully",
  "data": {
    "id": 1,
    "name": "Main Branch",
    "manager_name": "John Doe",
    "address": "123 Main St",
    "contact": "555-0100",
    "ext_no": "101",
    "service_station": "Central",
    "region": "North",
    "infra": { /* branch infrastructure */ },
    "scanner": { /* scanner data */ },
    "projector": { /* projector data */ },
    "createdAt": "2025-12-09T10:00:00Z",
    "updatedAt": "2025-12-09T10:00:00Z"
  }
}
```

**Errors**:
- `404`: Branch not found

### Create Branch
**POST** `/branches`

**Headers**: 
- Requires authentication
- Requires admin or subadmin role

**Body**:
```json
{
  "name": "New Branch",
  "manager_name": "Jane Doe",
  "address": "456 Oak Ave",
  "contact": "555-0200",
  "ext_no": "102",
  "service_station": "West",
  "region": "South"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "id": 2,
    "name": "New Branch",
    "manager_name": "Jane Doe",
    "address": "456 Oak Ave",
    "contact": "555-0200",
    "ext_no": "102",
    "service_station": "West",
    "region": "South",
    "createdAt": "2025-12-09T10:30:00Z",
    "updatedAt": "2025-12-09T10:30:00Z"
  }
}
```

**Errors**:
- `400`: Validation failed
- `409`: Branch already exists
- `403`: Insufficient permissions

### Update Branch
**PUT** `/branches/:id`

**Headers**: 
- Requires authentication
- Requires admin or subadmin role

**Body**: (All fields optional)
```json
{
  "name": "Updated Branch",
  "manager_name": "Jane Doe",
  "address": "456 Oak Ave",
  "contact": "555-0200",
  "ext_no": "102",
  "service_station": "West",
  "region": "South"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Branch updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Branch",
    /* ... updated fields ... */
    "updatedAt": "2025-12-09T10:45:00Z"
  }
}
```

**Errors**:
- `400`: Validation failed
- `404`: Branch not found
- `403`: Insufficient permissions

### Delete Branch
**DELETE** `/branches/:id`

**Headers**: 
- Requires authentication
- Requires admin role only

**Response** (200):
```json
{
  "success": true,
  "message": "Branch deleted successfully",
  "data": {}
}
```

**Errors**:
- `404`: Branch not found
- `403`: Insufficient permissions

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request successful |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Validation failed |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 500  | Internal Server Error - Server error |

---

## Error Examples

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": null
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "errors": null
}
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get Branches (with token)
```bash
curl -X GET http://localhost:5000/api/branches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Branch
```bash
curl -X POST http://localhost:5000/api/branches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"New Branch","manager_name":"Manager","address":"123 St"}'
```

---

**Version**: 1.0.0
**Last Updated**: December 9, 2025

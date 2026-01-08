# Bhejoo API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "mapped_restaurant": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "mapped_restaurant": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## User Endpoints (Requires Authentication)

### Get User Profile
```http
GET /api/user/profile
```

### Get Order History
```http
GET /api/user/orders
```

### Get Order Details
```http
GET /api/user/orders/:id
```

---

## Restaurant Endpoints (Public)

### Get All Restaurants
```http
GET /api/restaurants
```

### Get Restaurant by ID
```http
GET /api/restaurants/:id
```

### Get Restaurant Dishes
```http
GET /api/restaurants/:id/dishes
```

---

## Dish Endpoints (Public)

### Get All Available Dishes
```http
GET /api/dishes
```

### Get Dish by ID
```http
GET /api/dishes/:id
```

---

## Order Endpoints

### Place Order (Requires Authentication)
```http
POST /api/orders
```

**Request Body:**
```json
{
  "restaurant_id": 1,
  "dishes": [
    {
      "dish_id": 1,
      "quantity": 2
    },
    {
      "dish_id": 3,
      "quantity": 1
    }
  ],
  "delivery_address": "123 Main St, City, State"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "restaurant_id": 1,
    "status": "pending",
    "total_amount": 45.50,
    "payment_method": "COD",
    "delivery_address": "123 Main St, City, State",
    "dishes": [
      {
        "id": 1,
        "dish_id": 1,
        "quantity": 2,
        "price": 15.00,
        "dish_name": "Burger"
      }
    ]
  }
}
```

### Get Order Details (Requires Authentication)
```http
GET /api/orders/:id
```

### Assign Delivery Man (Admin Only)
```http
POST /api/orders/:id/assign-delivery
```

**Request Body:**
```json
{
  "delivery_man_id": 5
}
```

### Auto Assign Delivery (Admin Only)
```http
POST /api/orders/:id/auto-assign-delivery
```

---

## Admin Endpoints (Requires Admin Authentication)

### Get Restaurant Dishes
```http
GET /api/admin/dishes
```

### Create Dish
```http
POST /api/admin/dishes
```

**Request Body:**
```json
{
  "name": "Chicken Burger",
  "description": "Delicious chicken burger",
  "price": 15.99,
  "availability": "available",
  "image_url": "https://example.com/burger.jpg",
  "category": "Burgers"
}
```

### Update Dish
```http
PUT /api/admin/dishes/:id
```

### Delete Dish
```http
DELETE /api/admin/dishes/:id
```

### Update Dish Availability
```http
PATCH /api/admin/dishes/:id/availability
```

**Request Body:**
```json
{
  "availability": "unavailable"
}
```

### Get Restaurant Orders
```http
GET /api/admin/orders
```

### Update Order Status
```http
PUT /api/admin/orders/:id/status
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Available Statuses:**
- `pending`
- `confirmed`
- `preparing`
- `packed`
- `assigned`
- `picked_up`
- `on_the_way`
- `delivered`
- `cancelled`

### Get Admin Notifications
```http
GET /api/admin/notifications
```

---

## Delivery Endpoints (Requires Delivery Man Authentication)

### Get Assigned Orders
```http
GET /api/delivery/orders
```

### Get Order Details
```http
GET /api/delivery/orders/:id
```

### Update Delivery Status
```http
PUT /api/delivery/orders/:id/status
```

**Request Body:**
```json
{
  "status": "picked_up"
}
```

**Available Statuses:**
- `picked_up`
- `on_the_way`
- `delivered`

---

## Notification Endpoints (Requires Authentication)

### Get User Notifications
```http
GET /api/notifications
```

### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```

### Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Order Status Flow

1. **pending** - Order placed by user
2. **confirmed** - Restaurant confirms the order
3. **preparing** - Restaurant starts preparing food
4. **packed** - Food is packed and ready
5. **assigned** - Order assigned to delivery man
6. **picked_up** - Delivery man picked up from restaurant
7. **on_the_way** - Delivery man is on the way
8. **delivered** - Order delivered successfully
9. **cancelled** - Order cancelled (can happen at any stage)

---

## User Roles

- **user** - Regular customer
- **admin** - Restaurant admin (mapped to a specific restaurant)
- **Delivery Man** - Delivery person

---

## Notification Types

Notifications are automatically created on order status changes:
- `order_placed`
- `order_confirmed`
- `order_preparing`
- `order_packed`
- `order_assigned`
- `order_picked_up`
- `order_on_the_way`
- `order_delivered`
- `order_cancelled`

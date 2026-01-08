# Bhejoo Backend API

Backend API for Bhejoo Food Delivery Application.

## Features

- User Registration & Login with JWT Authentication
- Role-based Access Control (User, Admin, Delivery Man)
- Restaurant Management
- Dish Management
- Order Management with Status Tracking
- Delivery Assignment
- Real-time Notifications (MongoDB)

## Tech Stack

- Node.js + Express
- MySQL (Relational Data)
- MongoDB (Notifications)
- JWT (Authentication)
- bcryptjs (Password Encryption)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Create MySQL database:
```sql
CREATE DATABASE bhejoo_db;
```

4. Run the application:
```bash
npm start
# or for development
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User Registration
- POST `/api/auth/login` - User Login

### User
- GET `/api/user/profile` - Get User Profile
- GET `/api/user/orders` - Get Order History

### Admin (Restaurant)
- GET `/api/admin/dishes` - Get Restaurant Dishes
- POST `/api/admin/dishes` - Create New Dish
- PUT `/api/admin/dishes/:id` - Update Dish
- DELETE `/api/admin/dishes/:id` - Delete Dish
- GET `/api/admin/orders` - Get Restaurant Orders
- PUT `/api/admin/orders/:id/status` - Update Order Status

### Delivery
- GET `/api/delivery/orders` - Get Assigned Orders
- PUT `/api/delivery/orders/:id/status` - Update Delivery Status

### Orders
- POST `/api/orders` - Place Order
- GET `/api/orders/:id` - Get Order Details

### Notifications
- GET `/api/notifications` - Get User Notifications

## Database Schema

### MySQL Tables
- users
- restaurants
- dishes
- orders
- order_items
- delivery_assignments

### MongoDB Collections
- notifications

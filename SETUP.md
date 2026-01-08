# Bhejoo Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
cd bhejoo-backend
npm install
```

### 2. Database Setup

#### MySQL Setup

1. Create MySQL database:
```sql
CREATE DATABASE bhejoo_db;
```

2. Run the initialization script:
```bash
mysql -u root -p bhejoo_db < src/database/init.sql
```

Or manually execute the SQL file in your MySQL client.

#### MongoDB Setup

1. Make sure MongoDB is running on your system
2. MongoDB will automatically create the database `bhejoo_notifications` when first used

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=bhejoo_db

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bhejoo_notifications
```

**Important:** Change the `JWT_SECRET` to a strong random string in production!

### 4. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

### 5. Verify Installation

Visit `http://localhost:3000/health` in your browser or use curl:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "success": true,
  "message": "Bhejoo Backend API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing the API

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response for authenticated requests.

### 3. Create a Restaurant Admin

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurant Admin",
    "email": "admin@restaurant.com",
    "password": "admin123",
    "role": "admin",
    "mapped_restaurant": 1
  }'
```

**Note:** Make sure restaurant with ID 1 exists first, or create a restaurant manually.

### 4. Create a Delivery Man

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delivery Person",
    "email": "delivery@example.com",
    "password": "delivery123",
    "role": "Delivery Man"
  }'
```

## Project Structure

```
bhejoo-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── sql/             # SQL query files
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Utility functions
│   └── app.js           # Main application file
├── .env                 # Environment variables (not in git)
├── package.json         # Dependencies
└── README.md            # Project documentation
```

## Common Issues

### MySQL Connection Error
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database `bhejoo_db` exists

### MongoDB Connection Error
- Verify MongoDB is running
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB service is accessible

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using port 3000

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration time

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper MySQL and MongoDB credentials
4. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start src/app.js --name bhejoo-backend
```

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

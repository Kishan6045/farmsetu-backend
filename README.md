# FarmSetu Backend - Authentication System

A complete authentication system built with Node.js, Express, and MongoDB.

## Features

- User Registration with complete profile information
- User Login with JWT token authentication
- Password change functionality (protected route)
- Secure password hashing using bcrypt
- JWT-based authentication middleware

## Project Structure

```
FarmSetu/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── authController.js    # Authentication logic (register, login, changePassword)
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User schema/model
├── routes/
│   └── authRoutes.js        # Authentication routes
├── server.js                # Main server file
├── .env.example             # Environment variables template
└── package.json             # Dependencies and scripts
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd FarmSetu
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Create environment file**
   - Create a `.env` file in the root directory
   - Add the following environment variables:
     ```env
     PORT=5000
     MONGODB_URI=mongodb+srv://username:password@cluster0.rorsju8.mongodb.net/?retryWrites=true&w=majority
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     JWT_EXPIRE=30d
     ```
   
   **⚠️ IMPORTANT - Database Connection:**
   - Make sure your `MONGODB_URI` points to YOUR MongoDB cluster
   - The database name is automatically set to `farmsetu` in the code
   - When the server starts, it will log which cluster and database it's connected to
   - If you see a warning about wrong database, check your `MONGODB_URI` immediately

4. **Start MongoDB** (if using local MongoDB)
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017`

## Running the Server

### Development Mode
```bash
npm start
```
or
```bash
node server.js
```

The server will start on port 5000 (or the port specified in your `.env` file).

You should see:
```
🔌 Connecting to MongoDB...
📍 Cluster: cluster0.rorsju8.mongodb.net
📦 Target Database: farmsetu
✅ MongoDB Connected Successfully!
📊 Connected Database: farmsetu
🌐 Connected Host: cluster0-shard-00-00.xxxxx.mongodb.net
✅ Database name verified: farmsetu
Server is running on port 5000
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "1234567890",
    "countryCode": "+91",
    "address": {
      "state": "Maharashtra",
      "district": "Pune",
      "taluko": "Pune",
      "villageName": "Village Name"
    },
    "pincode": "411001",
    "password": "password123"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "countryCode": "+91",
        "address": { ... },
        "pincode": "411001"
      }
    }
  }
  ```

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "phoneNumber": "1234567890",
    "password": "password123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "1234567890",
        "countryCode": "+91",
        "address": { ... },
        "pincode": "411001"
      }
    }
  }
  ```

### 3. Change Password
- **Endpoint:** `PUT /api/auth/change-password`
- **Access:** Private (Requires JWT Token)
- **Headers:**
  ```
  Authorization: Bearer <jwt-token>
  ```
- **Request Body:**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

### Health Check
- **Endpoint:** `GET /health`
- **Access:** Public
- **Response:**
  ```json
  {
    "success": true,
    "message": "Server is running"
  }
  ```

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token is returned upon successful registration or login.

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Passwords are hashed using bcrypt before storing in database
- JWT tokens for secure authentication
- Password field is excluded from default queries
- Input validation and sanitization

## Testing with Postman/Thunder Client

1. **Register a new user:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body: JSON (use the register request body above)

2. **Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: JSON (use the login request body above)
   - Copy the token from response

3. **Change Password:**
   - Method: PUT
   - URL: `http://localhost:5000/api/auth/change-password`
   - Headers: `Authorization: Bearer <your-token>`
   - Body: JSON (use the change password request body above)

## Troubleshooting

- **MongoDB Connection Error:** Ensure MongoDB is running and the `MONGODB_URI` in `.env` is correct
- **Data going to wrong database:** 
  - Check the console logs when server starts - it shows which cluster and database you're connected to
  - Verify your `MONGODB_URI` points to YOUR cluster (not someone else's)
  - The database name is hardcoded to `farmsetu` - if you see a different database name in logs, your URI is wrong
- **Port Already in Use:** Change the `PORT` in `.env` file (Note: Port change does NOT affect database connection)
- **JWT Secret Error:** Make sure `JWT_SECRET` is set in `.env` file
- **Duplicate Email/Phone:** Each user must have a unique email and phone number

## Dependencies

- `express` - Web framework
- `mongoose` - MongoDB object modeling
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

## License

ISC

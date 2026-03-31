# Tasawak - Backend E-Commerce System

A comprehensive Node.js e-commerce backend application built with Express.js, MongoDB, and Redis. Tasawak provides a complete solution for managing products, users, categories, brands, carts, orders, and more.

## 🚀 Features

- **User Management**: User registration, authentication, and profile management with JWT
- **Product Catalog**: Complete product management with categories, subcategories, and brands
- **Shopping Cart**: Add/remove items, manage quantities, and cart persistence
- **Coupons & Discounts**: Apply promotional codes and calculate discounts
- **Order Processing**: Order creation and management
- **Email Notifications**: OTP verification and order confirmations via email
- **Caching**: Redis integration for improved performance
- **Job Queue**: BullMQ for asynchronous task processing
- **Request Validation**: Comprehensive input validation with Express Validator
- **Error Handling**: Centralized error handling middleware
- **Security**: Password encryption with bcryptjs, JWT authentication

## 🛠️ Tech Stack

### Core Framework
- **Express.js** - Web application framework
- **Node.js** - JavaScript runtime

### Database & Caching
- **MongoDB** - NoSQL database with Mongoose ODM
- **Redis** - In-memory data store for caching

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

### Background Jobs & Email
- **BullMQ** - Job queue system
- **Nodemailer** - Email service
- **node-cron** - Scheduled task runner

### Utilities
- **Morgan** - HTTP request logger
- **Express Validator** - Input validation
- **Slugify** - URL-friendly string conversion
- **Express Async Handler** - Async error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud instance)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tasawak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables** in `.env`:
   ```
   NODE_ENV=development
   PORT=8000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   
   # Email Service
   EMAIL_HOST=your_email_provider
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   ```

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
Runs the server with Nodemon for automatic restart on file changes.

### Production Mode
```bash
npm run production
```
Runs the server in production environment with cross-env.

The server will start on the port specified in your `.env` file (default: 8000).

## 📁 Project Structure

```
Tasawak/
├── config/              # Configuration files
│   ├── database.js      # MongoDB connection
│   ├── mainRoutes.js    # Route aggregation
│   └── redis.config.js  # Redis configuration
├── controllers/         # Request handlers
│   ├── adminService.js
│   ├── brand.controller.js
│   ├── product.controller.js
│   ├── user.controller.js
│   └── ...
├── middlewares/         # Express middlewares
│   ├── errorMiddleware.js
│   └── ValidatorMiddlewareMethod.js
├── models/              # Mongoose schemas
│   ├── userModel.js
│   ├── productModel.js
│   ├── categoryModel.js
│   └── ...
├── routes/              # API route definitions
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── brand.routes.js
│   └── ...
├── services/            # Business logic
│   ├── user.service.js
│   ├── product.service.js
│   └── ...
├── utils/               # Utility functions
│   ├── apiError.js
│   ├── AuthMethods.js
│   ├── jwtMethod.js
│   ├── sendEmails.js
│   └── ...
├── Validations/         # Request validation rules
│   ├── userValidationRules.js
│   ├── productValidationRules.js
│   └── ...
├── Views/               # Email templates
│   └── otp-email.html
├── app.js              # Express app setup
├── server.js           # Server entry point
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔌 API Endpoints Overview

### Users
- `POST /users/register` - User registration
- `POST /users/login` - User login
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Categories
- `GET /categories` - List categories
- `POST /categories` - Create category (admin)
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

### Brands
- `GET /brands` - List brands
- `POST /brands` - Create brand (admin)
- `PUT /brands/:id` - Update brand (admin)
- `DELETE /brands/:id` - Delete brand (admin)

### Cart
- `GET /cart` - Get user cart
- `POST /cart` - Add item to cart
- `PUT /cart/:id` - Update cart item
- `DELETE /cart/:id` - Remove item from cart

### Coupons
- `GET /coupons` - List coupons
- `POST /coupons` - Create coupon (admin)
- `PUT /coupons/:id` - Update coupon (admin)
- `DELETE /coupons/:id` - Delete coupon (admin)

*For detailed API documentation, refer to individual route files in the `routes/` directory.*

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. User logs in with credentials
2. Server returns a JWT token
3. Client includes token in `Authorization: Bearer <token>` header for protected routes
4. Server validates token and allows/denies access

Protected routes require valid JWT tokens in the request header.

## 🚦 Error Handling

The application includes centralized error handling through the `errorMiddleware.js`. All errors are standardized using the `apiError.js` utility class.

### Error Response Format
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error message",
  "data": null
}
```

## 📧 Email Service

Email notifications are sent via Nodemailer for:
- OTP verification during registration
- Order confirmations
- Password reset links
- Other transactional emails

Email templates are located in the `Views/` directory.

## 🔄 Background Jobs

BullMQ job queue is used for:
- Sending emails asynchronously
- Processing long-running tasks
- Scheduled operations via node-cron

Job workers are defined in `utils/workers.js`.

## ⚙️ Configuration Files

- **database.js** - MongoDB connection configuration
- **redis.config.js** - Redis client setup
- **mainRoutes.js** - Central route aggregator

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a new branch for your feature
2. Make your changes with clear commit messages
3. Test thoroughly before submitting
4. Submit a pull request with detailed description

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

Created as a full E-commerce system implementation using modern Node.js patterns and best practices.

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy coding!** 🎉

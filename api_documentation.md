# E-Pharmacy API Documentation

This documentation provides details for the frontend team to integrate with the backend services.

## Base URLs
- **Admin Dashboard API**: `{{BASE_URL}}/api/admin/v1`
- **Mobile Application API**: `{{BASE_URL}}/api/mobile/v1`
- **Swagger UI**: `{{BASE_URL}}/api-docs`

---

## Authentication

### Admin Authentication
Admin endpoints require a Bearer token in the `Authorization` header.

#### 1. Admin Login
- **Endpoint**: `POST /user/login`
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "yourpassword"
  }
  ```
- **Response (200)**:
  ```json
  {
    "token": "JWT_TOKEN",
    "user": {
      "name": "Admin Name",
      "email": "admin@example.com"
    }
  }
  ```

#### 2. Get Admin Info
- **Endpoint**: `GET /user/user-info`
- **Auth**: `Bearer <token>`

---

### Mobile Authentication
Mobile endpoints use OTP-based authentication.

#### 1. Get OTP
- **Endpoint**: `POST /auth/get-otp`
- **Body**:
  ```json
  {
    "phone": "+91XXXXXXXXXX"
  }
  ```

#### 2. Verify OTP
- **Endpoint**: `POST /auth/verify-otp`
- **Body**:
  ```json
  {
    "phone": "+91XXXXXXXXXX",
    "otp": "123456"
  }
  ```
- **Response (200)**:
  ```json
  {
    "accessToken": "JWT_ACCESS_TOKEN",
    "refreshToken": "JWT_REFRESH_TOKEN",
    "user": {
      "_id": "USER_ID",
      "phone": "+91XXXXXXXXXX",
      "role": "user"
    }
  }
  ```

#### 3. Refresh Token
- **Endpoint**: `POST /auth/refreshToken`
- **Body**:
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }
  ```

#### 4. Logout
- **Endpoint**: `POST /auth/logout`
- **Body**:
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }
  ```
- **Response (200)**:
  ```json
  {
    "status": 200,
    "data": null,
    "message": "Logged out successfully"
  }
  ```

---

## Admin Endpoints (`/api/admin/v1`)

### Dashboard
- **GET `/dashboard`**: Get statistics for the admin dashboard.
  - **Response**:
    ```json
    {
      "dashboard": [
        { "name": "Income", "amount": "15000", "type": "Income" },
        { "name": "Expense", "amount": "5000", "type": "Expense" }
      ],
      "productsCount": 120,
      "customersCount": 450,
      "customers": [
        { "_id": "...", "name": "...", "email": "...", "phone": "..." }
      ]
    }
    ```

### Products
- **GET `/products`**: List all products. Supports query parameters for filtering if implemented.
- **POST `/products/create`**: Create a new product.
  - **Type**: `multipart/form-data`
  - **Fields**: 
    - `name` (required)
    - `description`
    - `price` (required, number)
    - `stock` (required, number)
    - `category` (required)
    - `discount` (number)
    - `isFeatured` (boolean)
    - `isActive` (boolean)
  - **Files**: `images` (Array, max 6).
- **PUT `/products/:_id`**: Update an existing product.
  - **Type**: `multipart/form-data`
- **DELETE `/products/:_id`**: Delete a product.

### Orders
- **GET `/orders/get-all`**: List all orders. Returns an array of order objects.
- **GET `/orders/:id`**: Get details of a specific order by ID.
- **PATCH `/orders/:id`**: Update order status.
  - **Body**:
    ```json
    {
      "status": "pending" | "accepted" | "processing" | "delivered" | "cancelled"
    }
    ```

---

## Mobile Endpoints (`/api/mobile/v1`)

### User Profile
- **GET `/user`**: Get current authenticated user profile.
- **PATCH `/user`**: Update user profile details (name, email, profile image).
  - **Type**: `multipart/form-data`
  - **Fields**: 
    - `name` (string, optional)
    - `email` (string, optional)
  - **Files**: 
    - `image` (single file, optional, field name: "image")
  - **Note**: You can also send `application/json` if you are only updating text fields (like `name`) without an image.

### Saved Addresses
- **POST `/user/address`**: Add a new address.
  - **Body**:
    ```json
    {
      "fullName": "John Doe",
      "fullAddress": "123 Main St, Apt 4B",
      "pincode": "400001",
      "cityTown": "Mumbai",
      "phone": "+919876543210",
      "isDefault": true
    }
    ```
- **DELETE `/user/address/:addressId`**: Remove a saved address.
- **PATCH `/user/address/default/:addressId`**: Set an address as the default (primary) address.

### Products
- **GET `/products`**: Get list of all available products for mobile.
  - **Query Parameters**:
    - `search`: Filter products by name.
    - `page`: Page number (default: 1).
    - `limit`: Number of items per page (default: 10).
- **GET `/products/:id`**: Get detailed information for a single product.

### Orders
- **POST `/orders`**: Place a new order.
  - **Important**: If any item in the order has `requiresPrescription: true`, the `prescriptionImage` field is mandatory.
  - **Body**:
    ```json
    {
      "items": [
        { "productId": "65f...", "quantity": 2 }
      ],
      "delivery": {
        "fullName": "John Doe",
        "fullAddress": "123 Main St, Apt 4B",
        "pincode": "400001",
        "cityTown": "Mumbai",
        "phone": "+919876543210"
      },
      "paymentMethod": "cash_on_delivery" | "online",
      "prescriptionImage": "https://cloudinary.com/..."
    }
    ```
- **GET `/orders/get-all`**: Get authenticated user's order history.
- **GET `/orders/:id`**: Get status and details for a specific order.

---

## Data Structures

### Product Object
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "images": [
    { "url": "string", "public_id": "string" }
  ],
  "price": number,
  "discount": number,
  "stock": number,
  "category": "Medicine" | "Dental Care" | "Skin Care" | etc,
  "isFeatured": boolean,
  "isActive": boolean,
  "outOfStock": boolean,
  "requiresPrescription": boolean,
  "createdAt": "date-string",
  "updatedAt": "date-string"
}
```

### Order Object
```json
{
  "_id": "string",
  "userId": "string",
  "items": [
    { 
      "productId": "string", 
      "quantity": number
    }
  ],
  "priceBreakdown": {
    "subtotal": number,
    "discount": number,
    "tax": number,
    "shipping": number,
    "total": number
  },
  "status": "pending" | "accepted" | "processing" | "delivered" | "cancelled",
  "paymentMethod": "cash_on_delivery" | "online",
  "delivery": {
    "fullName": "string",
    "fullAddress": "string",
    "pincode": "string",
    "cityTown": "string",
    "phone": "string",
    "coordinates": { "lat": number, "lng": number }
  },
  "createdAt": "date-string",
  "updatedAt": "date-string"
}
```

---

## Enumerations

### Product Categories
- `Medicine`
- `Head`
- `Hand`
- `Dental Care`
- `Skin Care`
- `Eye Care`
- `Vitamins & Supplements`
- `Leg`
- `Baby Care`
- `Heart`

### Order Status
- `pending`: Initial status when order is placed.
- `accepted`: Admin has confirmed the order.
- `processing`: Order is being prepared.
- `delivered`: Order has reached the customer.
- `cancelled`: Order was cancelled by user or admin.

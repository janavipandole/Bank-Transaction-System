# Bank Transaction System - End-to-End Guide

This project is a simple yet powerful banking-style transaction system backend API that manages users, accounts, transactions, and ledger entries. If you are a frontend developer, this README will help you understand the complete project workflow and how to interact with the APIs.

## 1. Project Goal

The main objectives of this project are:

* User registration and login
* Creating bank-style accounts for users
* Tracking account balances
* Transferring funds between accounts
* Ensuring transaction safety with idempotency support
* Ledger-based balance calculation

This project provides only the backend API layer. Building and integrating the frontend application is the responsibility of the frontend developer.

---

## 2. Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT for authentication
* Cookie-based authentication
* Nodemailer for email notifications
* bcryptjs for password hashing

---

## 3. Project Structure

```text
src/
  app.js                  # Express app setup
  server.js               # Entry point
  config/
    db.js                 # MongoDB connection
  controllers/
    auth.controller.js    # Register/login/logout logic
    account.controller.js # Account creation and balance APIs
    transaction.controller.js # Transfer and initial funds logic
  middleware/
    auth.middleware.js    # JWT and system-user authentication checks
  models/
    user.model.js         # User schema
    account.model.js      # Account schema + balance method
    transaction.model.js  # Transaction schema
    ledger.model.js       # Ledger entry schema
    blackList.model.js    # Blacklisted JWT tokens
  routes/
    auth.routes.js        # /api/auth routes
    account.routes.js     # /api/accounts routes
    transaction.routes.js # /api/transactions routes
  services/
    email.service.js      # Registration and transaction email logic
```

---

## 4. Main Business Flow

The following workflow is the most important for frontend developers:

1. User registers.
2. User logs in.
3. The backend generates a JWT token and stores it in a cookie.
4. The user creates a bank account.
5. The system user can provide initial funds.
6. The user transfers money to another account.
7. The backend creates transaction and ledger entries.
8. Account balance is calculated based on ledger entries.

---

## 5. How Authentication Works

This project uses cookie-based authentication.

* After registration or login, the backend generates a JWT token.
* The token is stored in the `token` cookie.
* For protected routes, the frontend should send requests with `credentials: 'include'`.
* Alternatively, the token can be sent using the `Authorization: Bearer <token>` header.

### Important Note for Frontend Developers

If you are using the Fetch API:

```javascript
fetch('http://localhost:3000/api/accounts', {
  method: 'GET',
  credentials: 'include'
});
```

Or if you are using Axios:

```javascript
axios.defaults.withCredentials = true;
```

---

## 6. Setup Instructions

### Prerequisites

* Node.js installed
* MongoDB running locally or on a cloud instance
* Gmail account (for sending emails via OAuth2)

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bank-transaction-system
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

### Run the Project

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Default server port:

```text
3000
```

---

## 7. API Endpoints

Base URL:

```text
http://localhost:3000
```

### Authentication APIs

#### 1. Register User

* **Method:** `POST`
* **Endpoint:** `/api/auth/register`

Request Body:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "user": {
    "_id": "...",
    "email": "ali@example.com",
    "name": "Ali"
  },
  "token": "jwt_token"
}
```

---

#### 2. Login User

* **Method:** `POST`
* **Endpoint:** `/api/auth/login`

Request Body:

```json
{
  "email": "ali@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "user": {
    "_id": "...",
    "email": "ali@example.com",
    "name": "Ali"
  },
  "token": "jwt_token"
}
```

---

#### 3. Logout User

* **Method:** `POST`
* **Endpoint:** `/api/auth/logout`

---

### Account APIs

#### 1. Create Account

* **Method:** `POST`
* **Endpoint:** `/api/accounts/`
* **Authentication Required**

Response:

```json
{
  "account": {
    "_id": "...",
    "user": "...",
    "status": "ACTIVE",
    "currency": "INR",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### 2. Get All Accounts of the Logged-in User

* **Method:** `GET`
* **Endpoint:** `/api/accounts/`
* **Authentication Required**

---

#### 3. Get Account Balance

* **Method:** `GET`
* **Endpoint:** `/api/accounts/balance/:accountId`
* **Authentication Required**

---

### Transaction APIs

#### 1. Transfer Money Between Accounts

* **Method:** `POST`
* **Endpoint:** `/api/transactions/`
* **Authentication Required**

Request Body:

```json
{
  "fromAccount": "account_id_1",
  "toAccount": "account_id_2",
  "amount": 500,
  "idempotencyKey": "transfer-123"
}
```

Important Notes:

* `idempotencyKey` is mandatory.
* If the same key is used again, the backend prevents duplicate processing.
* The sender must have a sufficient balance.
* Both accounts must be in the `ACTIVE` state.

Response:

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "...",
    "fromAccount": "...",
    "toAccount": "...",
    "amount": 500,
    "status": "COMPLETED"
  }
}
```

---

#### 2. Initial Funds Transfer from the System User

* **Method:** `POST`
* **Endpoint:** `/api/transactions/system/initial-funds`
* **Authentication Required (System User Only)**

Request Body:

```json
{
  "toAccount": "account_id",
  "amount": 1000,
  "idempotencyKey": "initial-funds-001"
}
```

This endpoint allows the system user to provide initial funds to a newly created account.

---

## 8. Database Models (Important for Frontend Developers)

### User

Fields:

* `name`
* `email`
* `password`
* `systemUser` (internal/private)

### Account

Fields:

* `user`
* `status` (`ACTIVE`, `FROZEN`, `CLOSED`)
* `currency` (default: `INR`)

### Transaction

Fields:

* `fromAccount`
* `toAccount`
* `amount`
* `status` (`PENDING`, `COMPLETED`, `FAILED`, `REVERSED`)
* `idempotencyKey`

### Ledger

Ledger entries are used to track the balance of each account.

* Every debit and credit creates a ledger entry.
* Account balance is calculated as:

```
Total Credits - Total Debits
```

---

## 9. Frontend Integration Tips

### A. Save Authentication State

After registration or login, the frontend should manage the user's session and authentication.

Recommended approach:

* Use cookie-based authentication.
* Enable `credentials: 'include'`.
* Verify authentication before accessing protected pages.

### B. Account Creation Flow

The recommended user flow is:

1. Register or log in.
2. Create an account.
3. Fetch the user's accounts.
4. Display the account balance.

### C. Money Transfer Flow

The frontend should follow these steps:

1. User selects the sender and receiver accounts.
2. User enters the transfer amount.
3. Generate a unique `idempotencyKey`.
4. Send a POST request to `/api/transactions/`.
5. Display a success or error message based on the response.

Example:

```javascript
const idempotencyKey = crypto.randomUUID();

await fetch('http://localhost:3000/api/transactions', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromAccount: senderAccountId,
    toAccount: receiverAccountId,
    amount: 500,
    idempotencyKey
  })
});
```

### D. Handle Errors Properly

Common HTTP responses:

* `401` → Unauthorized or invalid token
* `400` → Bad request, invalid account, or insufficient balance
* `404` → Account not found
* `422` → User already exists during registration

---

## 10. Important Notes

* This repository currently contains only the backend API. The frontend application is not included.
* MongoDB transactions and ledger entries are used to ensure safe fund transfers.
* Account balances are calculated from ledger entries instead of being stored directly.
* Email notifications are sent for registration and transactions. If email environment variables are missing, the server will continue to run, but emails will not be sent.
* During logout, the user's JWT token is added to the blacklist.

---

## 11. Recommended Frontend Workflow

The recommended API sequence is:

1. `/api/auth/register` or `/api/auth/login`
2. Store the user session.
3. Call `/api/accounts/` to fetch accounts.
4. Call `/api/accounts/balance/:accountId` to retrieve the balance.
5. Use `/api/transactions/` to transfer funds.
6. Refresh account details and balances after a successful transaction.

---

## 12. Quick Start Summary

```bash
npm install
cp .env.example .env   # If available; otherwise create the file manually.
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 13. Conclusion

This project provides a complete backend API for a banking-style transaction system. The key responsibilities for frontend developers include:

* Authentication handling
* Account management
* Secure fund transfers with idempotency
* Proper error handling
* Cookie-based authenticated requests

If you are building the frontend, this README will help you understand the complete end-to-end workflow and integrate seamlessly with the backend APIs.

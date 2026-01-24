# Production-Grade M-Pesa API Integration

A robust, senior-level implementation of the Safaricom M-Pesa (Daraja) API. This project demonstrates production-ready backend principles including architectural separation, centralized error handling, request validation, and observability.

## Architecture

Following the Controller -> Service pattern for clear separation of concerns:

- **Controllers**: Handle HTTP-specific logic, extracting data from requests and returning formatted responses.
- **Services**: Encapsulate business logic and external API communication (Safaricom Daraja API).
- **Middlewares**: Centralized error handling, input validation, and structured logging.
- **Configuration**: Environment variable validation using Zod to ensure the system never starts in a broken state.

## Key Features

- **Centralized Error Handling**: Custom AppError class and global middleware to ensure consistent, safe error responses (no stack trace leaks).
- **Request Validation**: Schema-based validation using Zod for all incoming payloads.
- **Structured Logging**: JSON logging via Winston for better observability and log aggregation (e.g., ELK, Datadog).
- **Graceful Async Handling**: Uses express-async-errors to avoid repetitive try-catch blocks in controllers.
- **Environment Safety**: Runtime validation of .env variables.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a .env file based on the following:
   ```env
   PORT=5001
   NODE_ENV=development
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_BUSINESS_SHORT_CODE=your_shortcode
   MPESA_PASS_KEY=your_passkey
   MPESA_CALLBACK_URL=https://your-domain.com/lipa/payment-callback
   ```

3. **Run the App**:
   ```bash
   # Development mode
   npm run dev

   # Build & Start
   npm run build
   npm start
   ```

## API Endpoints

### STK Push
`POST /lipa/stkpush`
- **Body**: `{ "phone": "254...", "amount": 10 }`
- **Validation**: Ensures Kenyan phone format and positive amount.

### STK Status Query
`POST /lipa/payment-callback`
- **Body**: `{ "CheckoutRequestID": "..." }`
- **Logic**: Queries Safaricom for the latest status of a transaction.

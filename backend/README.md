# Garro Backend API

Car service marketplace backend built with Node.js, Express, MongoDB, Socket.IO, Stripe, Resend, and Twilio.

## Setup & Run

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your credentials.
4. Run in development mode:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server listening port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas Connection String |
| `JWT_SECRET` | Secret key for JSON Web Token signing |
| `RESEND_API_KEY` | Resend email driver API key |
| `TWILIO_ACCOUNT_SID` | Twilio account SID (WhatsApp & SMS) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | Twilio sandbox WhatsApp sender number |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY` | Cloudflare R2 access key |
| `R2_SECRET_KEY` | Cloudflare R2 secret key |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name |
| `STRIPE_SECRET_KEY` | Stripe developer API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `FRONTEND_URL` | Staging or production client app URL |

## Core APIs & Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /register`: Register a customer, admin, or helper
* `POST /login`: Log in and retrieve JWT token
* `POST /send-otp` / `POST /verify-otp`: Transactional OTP verification flow

### 🚘 Vehicles (`/api/vehicles`)
* `POST /`: Add a vehicle
* `GET /`: Get all customer vehicles

### 🏪 Garages & Helpers (`/api/garages`, `/api/helpers`)
* `POST /garages`: Admin registers a garage
* `POST /helpers`: Admin registers a helper linked to a garage

### 🛠 Requests & Assignment (`/api/requests`)
* `POST /`: Customer creates request (supports Cloudflare R2 photos)
* `PATCH /api/admin/requests/:id/manual-assign`: Admin manual allocation

### 📄 Quotes & Invoices (`/api/quotes`, `/api/invoices`)
* `POST /quotes`: Admin issues a quote
* `GET /quotes/:id/pdf`: Download quote PDF attachment
* `PUT /quotes/:id/approve` / `PUT /quotes/:id/reject`: Customer action
* `GET /invoices/:id/pdf`: Download A4 invoice PDF

### 💳 Stripe Payments (`/api/payments`)
* `POST /create-intent`: Initiate Stripe Payment Intent (fils-to-AED)
* `POST /webhook`: Raw signature validation webhook to transition state to paid

### 🚨 Complaints (`/api/complaints`)
* `POST /`: Submit a complaint
* `PATCH /:id/resolve`: Admin resolves complaint

### 📊 Admin Dashboard & Reports (`/api/admin`)
* `GET /dashboard`: Aggregated platform metrics (all 8 KPIs)
* `GET /reports/revenue`: Monthly billing overview
* `GET /reports/garages`: Garage completion rate and efficiency ranks

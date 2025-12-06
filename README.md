# GoldNews Backend (Node.js + Express + MongoDB)

This is a clean backend for your gold/silver/platinum price app with:

- Admin authentication (login + JWT)
- Forgot & reset password
- Admin panel APIs:
  - Edit prices (per country / state / region)
  - History edit/delete
- Client APIs:
  - Latest prices (with India default = Delhi)
  - History list for graphs
  - Latest table per metal
- Currency exchange proxy endpoint

## Folder structure

```bash
backend/
  package.json
  .env.example
  src/
    app.js
    server.js
    config/
      db.js
    models/
      Admin.js
      MetalPrice.js
    middleware/
      auth.js
    utils/
      email.js
      password.js
    services/
      authService.js
      metalPriceService.js
      currencyService.js
    controllers/
      authController.js
      metalPriceController.js
      currencyController.js
    routes/
      authRoutes.js
      metalPriceRoutes.js
      currencyRoutes.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill values

```bash
cp .env.example .env
```

3. Start MongoDB locally (or use Atlas) and update `MONGODB_URI` in `.env`.

4. Run in dev mode:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

## Important endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Metal prices (admin)

All admin routes require `Authorization: Bearer <token>` from login.

- `POST /api/metal-prices` — create new price
- `PUT /api/metal-prices/:id` — update existing price
- `DELETE /api/metal-prices/:id` — delete price

### Metal prices (public / client)

- `GET /api/metal-prices/latest?country=IN&stateOrRegion=Delhi&metalType=gold`
- `GET /api/metal-prices/latest-table?country=IN&stateOrRegion=Mumbai`
- `GET /api/metal-prices/history?country=IN&stateOrRegion=Delhi&metalType=gold`

> For **India**, if `stateOrRegion` is not provided, **Delhi** is used as default.

### Currency

- `GET /api/currency/rates?base=USD&symbols=INR,AED,USD`

## Notes

- History is stored in the same `MetalPrice` collection. The client can use `/history` for graphs.
- For "live" feeling even if data isn't updated, you can call `/latest?normalizeDate=true` and use `displayDate` from response on the frontend.

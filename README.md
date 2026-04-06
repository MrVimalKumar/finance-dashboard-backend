# Finance Dashboard Backend

A backend system for a finance dashboard where users can manage financial records, view analytics, and interact with the system based on their assigned roles. Built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

- Node.js (v18 or above)
- MongoDB (local instance or a cloud URI like MongoDB Atlas)

### Setting Up MongoDB

You need a running MongoDB instance before starting the server. A couple of options:

**Option 1 — Local MongoDB**

If you have MongoDB installed locally, just make sure the `mongod` service is running:

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or if using Homebrew on Mac
brew services start mongodb-community
```

Then use `mongodb://localhost:27017/finance-dashboard` as your `MONGO_URI` in the `.env` file. The database will be created automatically on first use.

**Option 2 — MongoDB Atlas (cloud)**

If you don't have MongoDB installed locally:

1. Create a free account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Set up a free shared cluster
3. Under Database Access, create a database user with a password
4. Under Network Access, add your IP address (or allow access from anywhere for development)
5. Click "Connect" on your cluster, choose "Connect your application", and copy the connection string
6. Paste that string as the `MONGO_URI` in your `.env` file — replace `<password>` with your actual database user password

Either way, once the `MONGO_URI` is set in `.env`, the server handles the connection on startup.

### Installation

```bash
git clone https://github.com/MrVimalKumar/finance-dashboard-backend.git
cd finance-dashboard-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=your_jwt_secret_here
```

Replace `your_jwt_secret_here` with any strong secret string.

### Running the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or whatever port you set).

---

## Project Structure

```
app.js                        # Express app setup (middleware, routes)
server.js                     # Entry point — starts the server and connects to DB
src/
  config/
    database_config.js        # MongoDB connection logic
  models/
    user.js                   # User schema (name, email, password, role, status)
    record.js                 # Financial record schema (amount, type, category, date)
    log.js                    # Audit log schema (tracks create/update/delete actions)
  controllers/
    authController.js         # Register, login, logout handlers
    recordControllers.js      # CRUD handlers for financial records
    analyticsController.js    # Summary, category breakdown, monthly trends
    userController.js         # Admin user management (roles, status)
  services/
    authService.js            # Auth business logic (hashing, JWT generation)
    recordService.js          # Record CRUD logic, filtering, pagination
    analyticsService.js       # MongoDB aggregation pipelines for analytics
  middlewares/
    auth.js                   # JWT verification — extracts user from cookie
    role.js                   # Role-based access control
    rateLimiter.js            # Rate limiting (global + login-specific)
    errorResponder.js         # Central error handler
  routes/
    authRoutes.js
    recordRoutes.js
    analyticsRoutes.js
    userRoutes.js
  utils/
    ApiException.js           # Custom error class with status codes
    wrapAsync.js              # Async wrapper to catch errors in controllers
    inputGuard.js             # Input validation for record payloads
```

The idea was to keep a clear separation — routes define endpoints, controllers handle HTTP concerns, services contain the actual business logic, and models define the data shape. Middlewares sit in between to handle auth, permissions, and error formatting.

---

## How Authentication Works

- On login, the server generates a JWT and sends it back as an **httpOnly cookie**. I went with cookies over sending the token in the response body because httpOnly cookies aren't accessible via JavaScript on the client side, which helps against XSS.
- Every protected route goes through the `auth` middleware, which reads the token from the cookie, verifies it, and attaches `userId` and `role` to `req.user`.
- Logout simply clears the cookie.

---

## Roles and Permissions

There are three roles — `viewer`, `analyst`, and `admin`. Here's what each can do:

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View own records | Yes | Yes | Yes |
| View all records | — | Yes | Yes |
| Create records | — | Yes | Yes |
| Update records | — | — | Yes |
| Delete records (soft) | — | — | Yes |
| View summary analytics | Yes | Yes | Yes |
| View category/trend analytics | — | Yes | Yes |
| Manage users (roles, status) | — | — | Yes |

Viewers can only see their own records and the general summary. Analysts get broader read access and can create records. Admins have full control.

Role assignment happens through admin user management endpoints, not during registration.

The very first user who registers in a fresh database is automatically assigned the `admin` role. This ensures that the system always has an initial administrator without requiring any manual database updates.

All subsequent users are assigned the `viewer` role by default. From that point onward, the admin can manage roles and permissions of other users through the provided user management APIs.

This approach removes the need for manual intervention while still maintaining security, as there is no way for users to assign themselves elevated privileges during registration.

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive token cookie | No |
| POST | `/api/auth/logout` | Clear token cookie | No |

### Records

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/api/records` | Create a financial record | admin, analyst |
| GET | `/api/records` | List records (with filters) | all roles |
| PUT | `/api/records/:id` | Update a record | admin |
| DELETE | `/api/records/:id` | Soft-delete a record | admin |

**Query params for GET `/api/records`:**
- `type` — filter by `income` or `expense`
- `category` — filter by category name
- `startDate` / `endDate` — date range filter
- `search` — text search across notes and category
- `page` / `limit` — pagination (defaults: page 1, limit 10)
- `deleted` — set to `true` to view soft-deleted records (admin/analyst only)

### Analytics

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/api/analytics/summary` | Total income, expense, net balance, count | all roles |
| GET | `/api/analytics/category` | Breakdown by category and type | admin, analyst |
| GET | `/api/analytics/trends` | Monthly income/expense/net over time | admin, analyst |

### User Management

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/api/users` | List all users | admin |
| PUT | `/api/users/:id/role` | Change a user's role | admin |
| PUT | `/api/users/:id/status` | Activate or deactivate a user | admin |

---

## A Few Design Decisions and Assumptions

- **Soft deletes** — Records aren't actually removed from the database. They get an `isDeleted` flag set to `true`. This felt more appropriate for financial data where you might need to audit or recover entries.

- **Audit logging** — Every create, update, and delete on records is logged to an `AuditLog` collection with the user who performed the action, the action type, and the entity affected. Seemed like a natural fit for a finance system.

- **Viewers are scoped** — When a viewer fetches records or analytics, they only see data tied to their own `userId`. Admins and analysts see everything. This scoping is handled in the service layer, not the controllers.

- **Rate limiting** — There's a global rate limit (100 requests per 15 minutes) and a stricter one on the login route (5 attempts per 15 minutes) to slow down brute-force attempts.

- **Cookie-based auth** — Chose httpOnly cookies for JWT storage instead of expecting the client to send an Authorization header. Simpler for frontend integration and slightly better security defaults.

- **No fixed categories** — Categories are free-form strings rather than a predefined enum. This keeps things flexible — the frontend can suggest common categories, but users aren't locked into a fixed list.

- **MongoDB as the database** — Used MongoDB with Mongoose for schema definition and validation. The aggregation framework made the analytics endpoints straightforward to implement.

- **Database indexes** — Added indexes on commonly queried fields (`userId`, `type`, `category`, `date`) and a compound index for the most common query pattern to keep things performant as data grows.

- **Full-field API responses** — Every API returns all the fields from a record rather than a trimmed subset. Since there's no frontend or UI requirement to work against, there was no basis to decide which fields to include or exclude. In a real project, once the frontend needs are known, we'd add field projection or response shaping to only send what the client actually needs.

---

## Error Handling

All errors flow through a central `errorResponder` middleware. Controllers use a `wrapAsync` utility that catches rejected promises and forwards them to the error handler. Business logic throws `ApiException` instances with appropriate HTTP status codes, so the error middleware can send back consistent JSON responses:

```json
{
  "success": false,
  "error": "Record not found"
}
```

---

## What's Not Included (and why)

- **No frontend** — This is purely the backend API. It's designed to serve data to a frontend dashboard, but the frontend itself isn't part of this scope.
- **No email verification** — Kept auth simple for this implementation. In production, you'd want email confirmation on registration.
- **No password reset flow** — Same reasoning. Would add it for a production system, but it wasn't part of the core requirements here.
- **No file uploads or exports** — The focus was on the core data flow: records in, analytics out.
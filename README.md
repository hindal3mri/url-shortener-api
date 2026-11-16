# URL Shortener API

A RESTful URL Shortener API built with **Node.js**, **Express.js**, and **Supabase (PostgreSQL)**. The API supports user authentication, user-owned short links, public redirection, and click tracking.

## Features

- Register users with email and password.
- Authenticate users using Supabase Auth.
- Refresh access and refresh tokens.
- Create short URLs from valid HTTP and HTTPS links.
- Generate unique short codes automatically.
- Validate submitted URLs.
- Retrieve only the authenticated user's URLs.
- Delete only URLs owned by the authenticated user.
- Redirect visitors without requiring authentication.
- Track successful short-link visits.
- Enforce user-level access with Row Level Security (RLS).

## Tech Stack

- Node.js 22 or later
- Express.js
- Supabase Auth
- Supabase PostgreSQL
- Postman
- Git and GitHub

## Prerequisites

- [Node.js](https://nodejs.org/) version 22 or later
- npm
- A Supabase project with the Email provider enabled
- [Postman](https://www.postman.com/) for API testing

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/hindal3mri/url-shortener-api.git url-shortenerapi
cd url-shortenerapi
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Open your Supabase project.
2. Navigate to SQL Editor.
3. Run the SQL in `schema.sql`.
4. Make sure the Email provider is enabled under Authentication → Sign In / Providers.
5. Configure email confirmation according to your application requirements.

The database uses the `user_id` column to associate each URL with its owner.

Existing records created before authentication can remain in the database with a null `user_id`. They are not included in any user's personal URL list, but their short links can still redirect.

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
PORT=3000
BASE_URL=http://localhost:3000
```

Replace the placeholder values with your Supabase project settings.

Never commit `.env`, access tokens, refresh tokens, passwords, or privileged Supabase keys to source control.

## Run the Server

Start the server:

```bash
npm start
```

For development:

```bash
npm run dev
```

The local API is available at:

```text
http://localhost:3000
```

## Authentication

The API uses Supabase Auth.

Protected endpoints require an access token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 1. Sign Up

**POST** `/api/auth/signup`

Request body:

```json
{
  "email": "user@example.com",
  "password": "ChooseA_StrongPassword"
}
```

Successful response: `201 Created`.

Email confirmation may be required depending on the Supabase configuration. If confirmation is required, the API returns the user without an active session.

### 2. Login

**POST** `/api/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "ChooseA_StrongPassword"
}
```

Successful response: `200 OK`.

Returns the user details, `accessToken`, and `refreshToken`.

### 3. Refresh Access Token

**POST** `/api/auth/refresh`

Request body:

```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

Successful response: `200 OK`.

Returns a new access token and refresh token.

## API Endpoints

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| GET | `/` | Public | Health check |
| POST | `/api/auth/signup` | Public | Register a user |
| POST | `/api/auth/login` | Public | Sign in |
| POST | `/api/auth/refresh` | Refresh token | Refresh session tokens |
| POST | `/api/urls` | Required | Create a short URL |
| GET | `/api/urls` | Required | List the current user's URLs |
| DELETE | `/api/urls/:shortCode` | Required | Delete an owned URL |
| GET | `/:shortCode` | Public | Redirect and track clicks |

### 1. Create a Short URL

**POST** `/api/urls`

Requires an access token.

Request body:

```json
{
  "longUrl": "https://www.example.com/"
}
```

Successful response: `201 Created`.

```json
{
  "message": "URL shortened successfully",
  "longUrl": "https://www.example.com/",
  "shortCode": "a1b2c3d4",
  "shortUrl": "http://localhost:3000/a1b2c3d4"
}
```

Possible errors:

- `400 Bad Request`: Invalid URL.
- `401 Unauthorized`: Missing or invalid access token.
- `500 Internal Server Error`: Database error or failure to generate a unique short code.

### 2. Get the Current User's URLs

**GET** `/api/urls`

Requires an access token.

Returns only the URLs belonging to the authenticated user.

Successful response: `200 OK`.

```json
{
  "count": 1,
  "urls": [
    {
      "long_url": "https://www.example.com/",
      "short_code": "a1b2c3d4",
      "clicks": 3,
      "created_at": "2026-11-16T09:00:00+00:00"
    }
  ]
}
```

If the user has no URLs:

```json
{
  "count": 0,
  "urls": []
}
```

### 3. Delete a Short URL

**DELETE** `/api/urls/:shortCode`

Requires an access token.

Example:

```text
DELETE /api/urls/a1b2c3d4
```

Successful response: `200 OK`.

```json
{
  "message": "URL deleted successfully",
  "shortCode": "a1b2c3d4"
}
```

If the short code does not exist or belongs to another user, the API returns `404 Not Found`.

### 4. Redirect to the Original URL

**GET** `/:shortCode`

This endpoint is public and does not require authentication.

Example:

```text
GET /a1b2c3d4
```

- Existing short codes return `302 Found` and redirect to the original destination.
- Each successful visit increments the click count.
- Unknown short codes return `404 Not Found`.

## Database Design and Access Control

The project uses a Supabase table named `public.urls`.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Auto-generated primary key |
| `long_url` | TEXT | Original destination URL |
| `short_code` | VARCHAR(20) | Unique short code |
| `clicks` | INTEGER | Number of successful redirects |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |
| `user_id` | UUID | URL owner, references `auth.users(id)` |

Row Level Security (RLS) is enabled.

Authenticated users can insert, view, and delete only their own URLs using `auth.uid() = user_id`.

Anonymous users have no direct table privileges. Public redirects use the `increment_url_clicks` database function, which runs with `SECURITY DEFINER` privileges and a restricted search path.

## Postman Testing

The API was exercised with Postman.

Observed successful cases included:

| Test | Observed Result |
|---|---|
| Register a test account | `201 Created` |
| Login with a confirmed account | `200 OK` |
| Create a URL as an authenticated user | `201 Created` |
| Retrieve the owner's URLs | `200 OK` |
| Retrieve URLs as another user | `200 OK` with an empty list |
| Create a URL as the second user | `201 Created` |
| Delete the second user's URL | `200 OK` |
| Retrieve URLs after deletion | `200 OK` with an empty list |

Earlier project tests also covered invalid URL input, missing URL input, unknown short codes, redirection, and click tracking.

## Security Notes

- Keep `.env` out of Git using `.gitignore`.
- Never commit passwords, access tokens, refresh tokens, or Supabase secret/service-role keys.
- Use the access token in the Authorization header for protected endpoints.
- RLS enforces URL ownership at the database level.
- Public visitors can redirect using a known short code but cannot directly access the URLs table.
- The click-tracking function uses `SECURITY DEFINER`; keep its implementation narrowly scoped.
- Legacy records with a null `user_id` are not listed under user accounts but remain redirectable.

## Git Ignore

Make sure `.gitignore` includes:

```gitignore
node_modules/
.env
```

## Project Structure

```text
url-shortenerapi/
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── README.md
└── schema.sql
```

## Repository

[URL Shortener API – GitHub](https://github.com/hindal3mri/url-shortener-api)
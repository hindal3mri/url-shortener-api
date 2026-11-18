# URL Shortener API

A RESTful URL Shortener API built with **Node.js**, **Express.js**, and **Supabase (PostgreSQL)**. The API creates short links, redirects visitors to their original URLs, tracks clicks, and supports retrieving and deleting URLs.

## Features

- Create short URLs from valid HTTP and HTTPS links.
- Generate unique short codes automatically.
- Validate submitted URLs.
- Retrieve all stored URLs.
- Delete a short URL using its short code.
- Redirect visitors to the original URL.
- Track successful redirects with click counts.
- Store URL data in Supabase PostgreSQL.
- Handle duplicate short-code collisions.

## Tech Stack

- Node.js 22 or later
- Express.js
- Supabase PostgreSQL
- Postman
- Git and GitHub

## Prerequisites

- [Node.js](https://nodejs.org/) version 22 or later
- npm
- A Supabase project
- [Postman](https://www.postman.com/) for API testing

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/hindal3mri/url-shortener-api.git
cd url-shortener-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Database

1. Open your Supabase project.
2. Navigate to the SQL Editor.
3. Run the SQL script from `schema.sql`.
4. Make sure the `urls` table and click-tracking function are created successfully.

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
PORT=3000
BASE_URL=http://localhost:3000
```

Replace the placeholder values with your Supabase project settings.

Never commit `.env` or privileged Supabase keys to source control.

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

## API Endpoints

All API endpoints are public and do not require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check API status |
| POST | `/api/urls` | Create a short URL |
| GET | `/api/urls` | Retrieve all URLs |
| DELETE | `/api/urls/:shortCode` | Delete a URL |
| GET | `/:shortCode` | Redirect and track clicks |

### 1. Health Check

**GET** `/`

Checks whether the API is running.

### 2. Create a Short URL

**POST** `/api/urls`

Request body:

```json
{
  "longUrl": "https://www.example.com/"
}
```

Successful response: `201 Created`

```json
{
  "message": "URL shortened successfully",
  "longUrl": "https://www.example.com/",
  "shortCode": "a1b2c3d4",
  "shortUrl": "http://localhost:3000/a1b2c3d4"
}
```

Possible errors:

- `400 Bad Request`: Invalid or missing URL.
- `500 Internal Server Error`: Database error or failure to generate a unique short code.

### 3. Retrieve All URLs

**GET** `/api/urls`

Returns the stored URLs, including their short codes, original URLs, click counts, and creation timestamps.

Successful response: `200 OK`.

### 4. Delete a Short URL

**DELETE** `/api/urls/:shortCode`

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

If the short code does not exist, the API returns `404 Not Found`.

### 5. Redirect to the Original URL

**GET** `/:shortCode`

Example:

```text
GET /a1b2c3d4
```

- Existing short codes return `302 Found` and redirect to the original URL.
- Each successful redirect increments the click count.
- Unknown short codes return `404 Not Found`.

**Note:** Postman may automatically follow redirects and display the destination's response instead of the original `302` response. Disable automatic redirect following in Postman to inspect the `302` status and `Location` header.

## Database Design

The project uses a Supabase table named `public.urls`.

| Column | Type | Description |
|---|---|---|
| `id` | BIGINT | Auto-generated primary key |
| `long_url` | TEXT | Original destination URL |
| `short_code` | VARCHAR(20) | Unique short code |
| `clicks` | INTEGER | Number of successful redirects |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |

Row Level Security (RLS) is enabled. The database has policies that allow anonymous users to insert, select, and delete URL records.

The `increment_url_clicks` database function updates the click count and returns the original URL for redirection.

## Postman Testing

The API can be tested using Postman.

Important test cases include:

| Test Case | Expected Result |
|---|---|
| Check API status | `200 OK` |
| Create a URL with valid input | `201 Created` |
| Submit an invalid URL | `400 Bad Request` |
| Submit a request without `longUrl` | `400 Bad Request` |
| Retrieve all URLs | `200 OK` |
| Redirect using an existing short code | `302 Found` |
| Redirect using an unknown short code | `404 Not Found` |
| Delete an existing short code | `200 OK` |
| Delete the same short code again | `404 Not Found` |
| Verify click tracking | Click count increases after a successful redirect |

## Security Notes

- Keep `.env` out of Git using `.gitignore`.
- Never commit Supabase secret or service-role keys.
- URL creation, listing, and deletion are public operations in this assignment's no-auth scope.
- Because these operations are public, anyone with API access can view or delete stored URLs. This configuration is intended for the assignment scope, not as a production access-control model.

## Git Ignore

Make sure `.gitignore` includes:

```gitignore
node_modules/
.env
```

## Project Structure

```text
url-shortener-api/
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── README.md
└── schema.sql
```

## Repository

[URL Shortener API – GitHub](https://github.com/hindal3mri/url-shortener-api)

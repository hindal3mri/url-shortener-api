# URL Shortener API

A RESTful URL Shortener API built with **Node.js**, **Express.js**, and **Supabase (PostgreSQL)**.

The API allows users to create short URLs, redirect to original destinations, track link clicks, retrieve stored URLs, and manage shortened links.

## Features

- Create short URLs from valid HTTP/HTTPS links.
- Generate unique short codes automatically.
- Handle duplicate short codes.
- Validate submitted URLs.
- Retrieve all stored shortened URLs.
- Redirect short URLs to their original destinations.
- Track the number of clicks for each short URL.
- Return appropriate errors for non-existing short codes.
- Implement URL deletion through a dedicated endpoint (requires database permission).

## Tech Stack

- Node.js
- Express.js
- Supabase (PostgreSQL)
- Postman
- Git & GitHub

## Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) version 22 or later
- npm
- A Supabase project
- [Postman](https://www.postman.com/) for API testing

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hindal3mri/url-shortener-api.git
   ```

2. Navigate to the project directory:

   ```bash
   cd url-shortener-api
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure the database:

   - Open your Supabase project.
   - Navigate to the SQL Editor.
   - Open the project's `schema.sql` file.
   - Copy its contents into the SQL Editor and run the script.

   This script creates the `urls` table, enables Row Level Security (RLS), creates the click-tracking function, and configures the required permissions.

5. Create a `.env` file in the project root:

   ```env
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   PORT=3000
   ```

   Replace the placeholder values with your Supabase project settings.

   Never commit your `.env` file or expose secret keys in a public repository.

## Run the Server

Start the backend:

```bash
npm start
```

For development, use:

```bash
npm run dev
```

The server will be available at:

```text
http://localhost:3000
```

## API Endpoints

### 1. Health Check

**GET /**

Checks whether the API is running.

Example response:

```json
{
  "message": "URL Shortener API is running!"
}
```

### 2. Create a Short URL

**POST /api/urls**

Creates a shortened URL.

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

- `400 Bad Request`: Invalid URL or missing `longUrl` field.

```json
{
  "error": "Invalid URL"
}
```

- `500 Internal Server Error`: Failed to save the URL.

```json
{
  "error": "Failed to save URL"
}
```

- `500 Internal Server Error`: Could not generate a unique short code.

```json
{
  "error": "Could not generate a unique short code"
}
```

### 3. Get All Shortened URLs

**GET /api/urls**

Returns all stored shortened URLs, including their click counts.

Successful response: `200 OK`

```json
{
  "count": 1,
  "urls": [
    {
      "long_url": "https://www.example.com/",
      "short_code": "a1b2c3d4",
      "clicks": 3,
      "created_at": "2026-11-12T08:56:51.249211+00:00"
    }
  ]
}
```

Possible error:

- `500 Internal Server Error`: Failed to retrieve URLs.

```json
{
  "error": "Failed to retrieve URLs"
}
```

### 4. Redirect to the Original URL

**GET /:shortCode**

Redirects visitors to the original URL.

Example:

```text
GET /a1b2c3d4
```

- Existing short codes redirect to their original URLs.
- Each successful visit increments the click count.
- Unknown short codes return `404 Not Found`.

Example error:

```json
{
  "error": "Short URL not found"
}
```

### 5. Delete a Shortened URL

**DELETE /api/urls/:shortCode**

Deletes a shortened URL using its unique short code.

Example:

```text
DELETE /api/urls/a1b2c3d4
```

When the database authorizes the deletion, the API returns `200 OK`.

```json
{
  "message": "URL deleted successfully",
  "shortCode": "a1b2c3d4"
}
```

Possible errors:

- `404 Not Found`: Short URL does not exist.

```json
{
  "error": "Short URL not found"
}
```

- `500 Internal Server Error`: Failed to delete the URL.

```json
{
  "error": "Failed to delete URL"
}
```

**Note:** The DELETE endpoint is implemented in the backend. However, anonymous DELETE permission is currently disabled in the database, so deletion is not available with the current anonymous API configuration.

## Database Schema

The project uses a Supabase table named `public.urls`.

| Column | Description |
|---|---|
| `id` | Primary key, automatically generated |
| `long_url` | Original URL |
| `short_code` | Unique short code |
| `clicks` | Number of clicks |
| `created_at` | Record creation timestamp |

The database uses Row Level Security (RLS) to control access to table operations.

The redirect functionality uses a Supabase database function named `increment_url_clicks` to update click counts and retrieve the original URL.

The database setup is provided in `schema.sql`.

## Testing with Postman

The following test cases are used to verify the API:

| Test | Expected Result |
|---|---|
| Create a valid short URL | `201 Created` |
| Submit an invalid URL | `400 Bad Request` |
| Submit a request without the URL field | `400 Bad Request` |
| Retrieve all URLs | `200 OK` |
| Redirect using a valid short code | `302 Found` |
| Verify click tracking | Click count increases |
| Use an unknown short code | `404 Not Found` |
| Redirect using an unknown short code | `404 Not Found` |
| Delete an existing URL (previously tested) | `200 OK` |
| Delete a non-existing URL (previously tested) | `404 Not Found` |

**Note:** The DELETE endpoint was tested successfully before anonymous DELETE permission was revoked. It is currently unavailable under the database permissions documented above.

## Security

- Keep `.env` out of version control.
- Never commit Supabase secret keys, passwords, or credentials.
- Keep privileged Supabase keys server-side only.
- Enable Row Level Security (RLS).
- Restrict database permissions to the minimum required.
- Anonymous users can insert and select URLs.
- Anonymous UPDATE and DELETE permissions are disabled.
- The current API does not implement user authentication or per-user URL ownership.
- Additional authentication and authorization controls are required before public production deployment.

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

## Author

Developed as a backend engineering project using Node.js, Express.js, and Supabase.

## Repository

[URL Shortener API – GitHub](https://github.com/hindal3mri/url-shortener-api)

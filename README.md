# URL Shortener API

A backend URL shortener built with **Node.js**, **Express**, and
**Supabase**.

## Features

-   Create short URLs from valid HTTP/HTTPS links.
-   Generate short codes automatically.
-   Prevent duplicate short codes.
-   Retrieve all stored short URLs.
-   Redirect short URLs to their original destinations.
-   Track the number of clicks for each short URL.
-   Validate submitted URLs.

## Tech Stack

-   Node.js
-   Express
-   Supabase (PostgreSQL)
-   Postman

## Prerequisites

Make sure you have the following installed or configured:

-   [Node.js](https://nodejs.org/)
-   npm
-   A Supabase project
-   [Postman](https://www.postman.com/) (for API testing)

## Installation

1.  Clone the repository:

    ``` bash
    git clone YOUR_GITHUB_REPOSITORY_URL
    ```

2.  Navigate to the project directory:

    ``` bash
    cd url-shortenerapi
    ```

3.  Install dependencies:

    ``` bash
    npm install
    ```

4.  Create a `.env` file in the project root:

    ``` env
    SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
    PORT=3000
    ```

    Replace the placeholder values with your own Supabase project
    settings. Never commit `.env` or expose secret keys in source code
    or a public repository.

## Run the Server

Start the backend:

``` bash
node index.js
```

When the server starts successfully, it should be available at:

``` text
http://localhost:3000
```

## API Endpoints

### 1. Health Check

**GET** `/`

Returns a message confirming that the API is running.

### 2. Create a Short URL

**POST** `/api/urls`

Request body (`raw` → `JSON` in Postman):

``` json
{
  "longUrl": "https://www.example.com/"
}
```

On success, the API returns `201 Created` with the original URL,
generated short code, and short URL.

### 3. Get All Short URLs

**GET** `/api/urls`

Returns the total number of stored URLs and an array containing each
URL's original address, short code, and click count.

### 4. Redirect to the Original URL

**GET** `/:shortCode`

Replace `:shortCode` with a code returned by the create endpoint.

-   If the code exists, the API redirects to the original URL and
    increments its click count.
-   If the code does not exist, the API should return `404 Not Found`.

## Database Schema

The project uses a Supabase table named `public.urls`.

  Column         Description
  -------------- ---------------------------
  `id`           Primary key
  `long_url`     Original URL
  `short_code`   Unique short code
  `clicks`       Number of clicks
  `created_at`   Record creation timestamp

Row Level Security (RLS) should be enabled and configured with policies
that allow only the intended database operations. API keys do not
replace database access policies.

## Testing with Postman

Use Postman to test the API endpoints.

Recommended checks include:

-   `POST /api/urls` returns `201 Created`.
-   The response includes a success message, `shortCode`, and
    `shortUrl`.
-   `GET /api/urls` returns `200 OK`, a numeric `count`, and a `urls`
    array.
-   Each URL record includes `long_url`, `short_code`, and `clicks`.
-   Opening a valid short URL redirects to the original destination.
-   The click count increases after a redirect.
-   An unknown short code returns `404 Not Found`.

Add automated checks under **Scripts → After response** in Postman.

## Security

-   Keep `.env` out of version control.
-   Never commit Supabase secret keys, passwords, or other credentials.
-   Configure Supabase RLS policies according to the operations your
    backend needs.
-   Use the appropriate Supabase key for the backend and keep privileged
    secret keys server-side only.

## Git Ignore

Make sure your `.gitignore` includes:

``` gitignore
node_modules/
.env
```

## Project Structure

``` text
url-shortenerapi/
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Notes

Review this README against the final versions of `index.js`,
`package.json`, and your Supabase policies before submitting the
project. Update the repository URL and any setup details if they differ
from your local configuration.

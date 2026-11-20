# Shortly URL Shortener

Shortly is a full-stack URL shortener. Its React frontend lets visitors create, copy, and manage short links, while the Express API stores links in Supabase PostgreSQL, redirects short codes, and tracks successful redirects.

## Features

- Create short links from valid HTTP or HTTPS URLs.
- Generate an eight-character hexadecimal short code and retry if a code collides.
- Open a short link to redirect to its destination and increment its click count.
- View all saved links, their destinations, creation dates, and click counts.
- Copy a short link from the creation result or dashboard.
- Delete a link after confirming the action.
- View dashboard totals and the most-clicked link.
- Sort dashboard links by click count; the default list is newest first.
- Switch the interface between English and Arabic, with left-to-right and right-to-left layout respectively.
- Use a responsive interface with home and dashboard views.

## Technologies

**Frontend**

- React 19 and JavaScript
- Vite 8
- CSS

**Backend and database**

- Node.js 22 or later
- Express 5
- Supabase JavaScript client and Supabase PostgreSQL
- dotenv for backend environment configuration

## Project structure

```text
.
├── backend/
│   ├── index.js             # Express API and redirect handler
│   ├── schema.sql           # Supabase table, policies, and click function
│   ├── package.json
│   └── .env                 # Create locally; do not commit
├── frontend/
│   ├── public/              # Logo and favicon
│   ├── src/
│   │   ├── components/      # Dashboard, link card, and empty state
│   │   ├── services/        # Frontend API requests
│   │   ├── App.jsx          # Home view and application navigation
│   │   ├── translations.js  # English and Arabic interface text
│   │   └── *.css            # Application styles
│   ├── package.json
│   └── vite.config.js       # Development proxy for /api
└── README.md
```

## Prerequisites

- Node.js 22 or later and npm
- A Supabase project with access to its project URL and anon/publishable API key

## Installation and configuration

1. Create a Supabase project.
2. In its SQL Editor, run [`backend/schema.sql`](backend/schema.sql) to create the `public.urls` table, its row-level security policies, and the click-tracking function.
3. Create `backend/.env` with your own project settings:

   ```env
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
   PORT=3000
   BASE_URL=http://localhost:3000
   ```

   `SUPABASE_URL` and `SUPABASE_KEY` are required by the backend. `PORT` defaults to `3000`; `BASE_URL` defaults to `http://localhost:<PORT>`. Keep the `.env` file private and do not commit real credentials. Use the anon/publishable key with the policies in the schema, not a service-role key.

4. Install dependencies in each application directory:

   ```bash
   cd backend
   npm install
   ```

   In a separate terminal, from the project root:

   ```bash
   cd frontend
   npm install
   ```

## Run locally

Start the backend from `backend/`:

```bash
npm run dev
```

For a regular start, use `npm start` instead. The backend listens on port `3000` by default.

Start the Vite frontend from `frontend/` in another terminal:

```bash
npm run dev
```

Open the local address printed by Vite (typically `http://localhost:5173`). During development, Vite forwards `/api` requests to `http://localhost:3000`. Keep the backend on port `3000` for this proxy configuration. Short URLs use `BASE_URL`, so set it to the public origin when deploying.

## API

The backend exposes public endpoints; no authentication is implemented.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/urls` | Validate and create a short URL |
| `GET` | `/api/urls` | List saved URLs, newest first |
| `DELETE` | `/api/urls/:shortCode` | Delete a URL |
| `GET` | `/:shortCode` | Increment clicks and redirect |

### Health check

`GET /` returns `200 OK`:

```json
{
  "message": "URL Shortener API is running!"
}
```

### Create a short URL

`POST /api/urls` requires a JSON body containing an HTTP or HTTPS URL:

```json
{
  "longUrl": "https://www.example.com/"
}
```

On success, the API returns `201 Created`:

```json
{
  "message": "URL shortened successfully",
  "longUrl": "https://www.example.com/",
  "shortCode": "a1b2c3d4",
  "shortUrl": "http://localhost:3000/a1b2c3d4"
}
```

Invalid or missing URLs return `400 Bad Request`. A storage failure or inability to find a unique code returns `500 Internal Server Error`.

### List URLs

`GET /api/urls` returns `200 OK`. Records are ordered by `created_at` descending:

```json
{
  "count": 1,
  "urls": [
    {
      "longUrl": "https://www.example.com/",
      "shortCode": "a1b2c3d4",
      "shortUrl": "http://localhost:3000/a1b2c3d4",
      "clicks": 3,
      "createdAt": "2026-11-20T12:00:00.000Z"
    }
  ]
}
```

### Delete a URL

`DELETE /api/urls/a1b2c3d4` returns `200 OK` when a link is deleted:

```json
{
  "message": "URL deleted successfully",
  "shortCode": "a1b2c3d4"
}
```

An unknown short code returns `404 Not Found`.

### Redirect and track clicks

`GET /a1b2c3d4` increments the matching record's `clicks` value and responds with `302 Found`, redirecting to its original URL. An unknown short code returns `404 Not Found`.

## Database

The schema in `backend/schema.sql` creates `public.urls`:

| Column | Type | Details |
|---|---|---|
| `id` | `BIGINT` | Identity primary key |
| `long_url` | `TEXT` | Original destination |
| `short_code` | `VARCHAR(20)` | Unique code generated by the API |
| `clicks` | `INTEGER` | Non-null; defaults to `0` |
| `created_at` | `TIMESTAMPTZ` | Non-null; defaults to the current time |

Row Level Security is enabled. The schema grants the `anon` role insert, select, and delete access. Its `increment_url_clicks` SQL function increments a matching row and returns its destination for the redirect handler. The schema also removes a legacy `user_id` column if present. There is no user ownership or authentication in the current implementation.

Because listing, creation, and deletion are public, anyone able to reach the API can view or delete stored links. Review the access model before exposing this setup to production traffic.

## Frontend behavior and languages

- **Home:** Submit a URL to create a short link. The frontend displays the result and offers a copy action.
- **Dashboard:** Shows total links, total clicks, the most-clicked link, and each saved link. Link cards show the original and short URL, click count, copy and delete actions. Deletion requires browser confirmation.
- **Ordering:** The dashboard initially uses the API's newest-first order. The sort button switches to descending click-count order; pressing it again restores the default order.
- **Language and direction:** The language switcher toggles between English and Arabic. The page and dashboard use LTR for English and RTL for Arabic. The selected language is held in application state and is not persisted across reloads.

## Validation and testing

The frontend package provides lint and production-build checks. Run them from `frontend/`:

```bash
npm run lint
npm run build
```

No automated test script is currently defined in the frontend or backend package. To manually check the API, start the backend and try the health, create, list, redirect, and delete requests described above. A redirect to an unknown code and a delete request for a missing code should return `404 Not Found`.

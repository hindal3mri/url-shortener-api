# Shortly — URL Shortener

A full-stack URL Shortener application that transforms long URLs into short, shareable links.

## Overview

Shortly provides a simple and efficient way to shorten long URLs, manage shortened links, and redirect users to their original destinations.

The project includes a RESTful backend API and a responsive frontend interface.

## Features

- Generate unique short URLs automatically.
- Validate submitted URLs.
- Redirect users to original URLs.
- Track link clicks.
- View and manage shortened URLs.
- Copy shortened links with one click.
- Loading and error states.
- Arabic and English language support.
- Responsive user interface.

## Tech Stack

### Backend

- Node.js
- Express.js
- Supabase (PostgreSQL)
- JavaScript

### Frontend

- React
- Vite
- JavaScript
- CSS

## Project Structure

```text
url-shortener-project/
├── backend/
│   ├── index.js
│   ├── schema.sql
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/hindal3mri/url-shortener-api.git
cd url-shortener-api
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and configure your Supabase credentials.

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
BASE_URL=http://localhost:3000
```

Run the backend:

```bash
npm start
```

### 3. Set up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Endpoints

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/`                    | Check API status             |
| POST   | `/api/urls`            | Create a short URL           |
| GET    | `/api/urls`            | Retrieve URLs                |
| GET    | `/:shortCode`          | Redirect to the original URL |
| DELETE | `/api/urls/:shortCode` | Delete a shortened URL       |

## Security

Environment variables are used to keep database credentials out of the source code. The `.env` file should never be committed to Git.

## Author

**Hind Alamri**


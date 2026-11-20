# Shortly — Frontend

The frontend of Shortly, a responsive URL Shortener application built with React and Vite.

## Features

- Shorten long URLs through the backend API.
- Display generated short links.
- Copy shortened URLs with one click.
- Validate URL input and display error messages.
- Show loading feedback while processing requests.
- Support Arabic and English languages.
- Responsive design for different screen sizes.

## Tech Stack

- React
- JavaScript
- Vite
- CSS

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

From the project root, navigate to the frontend folder:

```bash
cd frontend
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## Backend Connection

The frontend communicates with the Shortly backend API.

Make sure the backend server is running locally on port `3000` before testing URL shortening.

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── translations.js
├── index.html
├── package.json
└── vite.config.js
```

## Author

Hind Alamri
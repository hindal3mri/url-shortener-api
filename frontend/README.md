# Shortly Frontend

The Shortly frontend is a responsive React application for creating and managing shortened URLs. It provides a home view for submitting URLs and a dashboard for reviewing and managing links stored by the backend.

## Technologies

- React 19 and React DOM
- JavaScript (ES modules)
- Vite 8
- CSS with custom properties

## Frontend structure

```text
frontend/
├── public/
│   ├── favicon.svg
│   └── shortly-logo.png
├── src/
│   ├── components/
│   │   ├── ConfirmModal.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EmptyState.jsx
│   │   └── LinkCard.jsx
│   ├── services/
│   │   └── urls.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   ├── theme.css
│   └── translations.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 22 or later and npm
- The Shortly backend running locally at `http://localhost:3000` for URL creation and dashboard API requests

## Install and run

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). To create a production build, run `npm run build`. Run `npm run lint` to check the frontend with ESLint.

## Environment configuration

The frontend does not define or require its own environment variables. In development, [`vite.config.js`](vite.config.js) proxies requests under `/api` to `http://localhost:3000`. Keep the backend on that port unless you also update the Vite proxy configuration.

The backend has its own Supabase and URL configuration; see the project-level and backend documentation for those settings.

## UI and functionality

The application has two in-app views controlled by the Navbar; it does not use a separate URL route for the dashboard.

### Home

- Enter a URL and submit the form to request a short link.
- The frontend trims the input and checks that it parses as a URL, uses HTTP or HTTPS, has a hostname containing a dot, and does not include username or password credentials. The backend performs its own validation as well.
- While the request is in progress, the form shows loading feedback and disables submission. Validation, API, and connection failures are shown in the interface.
- On success, the page displays the returned short URL and a button to copy it using the browser Clipboard API.
- The Navbar links switch between Home and Dashboard; the brand button returns to Home.

### Dashboard

The dashboard loads links from the backend and shows total link count, total clicks, and the most-clicked link. Each link card displays its original URL, short URL, and click count.

- Short URL and original URL links can be opened in a new tab.
- The copy action copies the short URL using the browser Clipboard API and reports copy failures.
- The delete action opens the reusable [`ConfirmModal.jsx`](src/components/ConfirmModal.jsx) before sending a delete request. The modal identifies the selected short URL, provides Cancel and Delete actions, and supports Escape and focus navigation. Cancel or backdrop dismissal closes the modal without deleting. While a deletion request is in progress, confirmation controls are disabled.
- Successful deletion removes that card from the current view.
- The initial order is newest first, as returned by the API. The sort button switches to descending click-count order and can be pressed again to restore the initial order. Sorting is disabled when fewer than two links are available.
- When loading succeeds and no links exist, the dashboard displays an empty state. Loading and request errors are also displayed.
- A “New Link” action returns to the Home view.

## API integration

The frontend uses relative API paths so Vite can proxy them to the local backend:

| Request | Purpose |
|---|---|
| `POST /api/urls` | Submit `{ "longUrl": "https://example.com/" }`; on success, display the returned `shortUrl` |
| `GET /api/urls` | Load dashboard links and click counts |
| `DELETE /api/urls/:shortCode` | Delete a selected link after confirmation |

URL data is normalized in [`src/services/urls.js`](src/services/urls.js). `getLinks()` validates the `GET /api/urls` response, maps each backend record to the frontend fields `longUrl`, `shortCode`, `shortUrl`, `clicks`, and `createdAt`, and converts missing short URLs to an empty string and click counts to numbers. The Dashboard uses this normalized result directly. It does not add a second response mapping layer.

After a successful creation, the frontend updates its dashboard refresh state so the list is reloaded when the Dashboard view is opened. Short URL links point to the backend host included in the API response, where the backend handles redirection and click tracking.

## Language and text direction

The language switcher toggles between English and Arabic. Interface labels and messages for the home view, navigation, dashboard, and confirmation modal are defined in [`src/translations.js`](src/translations.js). The selection is held in React state and is not saved across page reloads.

The application sets its page direction to LTR for English and RTL for Arabic. Dashboard content and link cards follow the selected direction; URL anchors are explicitly kept LTR so links remain readable.

## Styling and theme

- [`src/theme.css`](src/theme.css) defines shared CSS custom properties for colors, typography, spacing, layout widths, radii, shadows, and transitions.
- [`src/index.css`](src/index.css) provides global sizing and focus styles and imports the Cairo font.
- [`src/App.css`](src/App.css) contains Navbar, home, dashboard, link-card, confirmation modal, and responsive layout styles.

The same theme variables and shared styles are used by both application views.

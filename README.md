# PokerTracker

A modern web app for tracking live poker sessions. Log sessions, locations, stakes, and notes; visualize winnings and hourly rate; and analyze results with flexible filters and a calendar view.

## Features

- 🔐 Email/password authentication (JWT)
- 📊 Interactive dashboard with winnings-over-time chart
- 📈 Performance analytics: total winnings, hours, hourly rate, best/worst sessions
- 🗂️ Flexible filters: location, variation, blinds/stakes, location type, date range
- 🗓️ Calendar to view and manage sessions by date
- ✉️ Contact Support modal that emails feedback to the maintainer
- ⚡ Deployed as a full-stack app on Vercel (React frontend + Node/Express API)

## Stack

- React, Tailwind CSS, Recharts, Lucide React
- Node/Express, PostgreSQL (e.g. Neon), JWT auth
- Vercel (static frontend + serverless API functions)

## Prerequisites

- Node.js 16+
- A PostgreSQL database (e.g., Neon)
- Vercel account (for hosting)

## Environment Variables

Set these in Vercel Project Settings (Production/Preview/Development), and locally in a `.env` file if running the server yourself:

- `DATABASE_URL` – Postgres connection string
- `JWT_SECRET` – long random secret for JWT signing
- `SMTP_HOST` – SMTP host for support emails
- `SMTP_PORT` – SMTP port (587 or 465)
- `SMTP_SECURE` – `true` for 465, otherwise `false`
- `SMTP_USER` – SMTP username
- `SMTP_PASS` – SMTP password
- `FROM_EMAIL` – From address for emails (e.g., `no-reply@yourdomain`)
- `SUPPORT_EMAIL` – Destination for support emails (default: owner’s email)
- `REACT_APP_API_URL` – Optional. In production leave unset (frontend uses `/api`). In local dev you can leave unset to default to `http://localhost:5000/api`.

## Development

Run the API and frontend locally (two terminals):

```bash
# Terminal 1 – API
node server.js

# Terminal 2 – Frontend (CRA dev server)
PORT=3000 npm start
```

By default the frontend will point to `http://localhost:5000/api` in development unless `REACT_APP_API_URL` is set.

## Build

```bash
npm run build
```
This produces a production build of the React app in `build/`.

## Deploy (Vercel)

This repo contains a `vercel.json` that:
- Builds `server.js` with `@vercel/node` (served under `/api/*`)
- Builds the CRA frontend with `@vercel/static-build` (output `build/`)
- Routes `/api/*` to the server, everything else to the frontend

Steps:
1. Push the repo to GitHub.
2. Import the repo into Vercel (New Project → Import Git Repository).
3. Set environment variables listed above.
4. Deploy. The app will be available at your Vercel domain.

## Project Structure

```
pokertracker/
├── public/
│   └── index.html            # HTML template
├── src/
│   ├── components/
│   │   ├── Dashboard.js      # Dashboard + filters + chart
│   │   ├── Calendar.js       # Calendar view / session mgmt
│   │   ├── SessionPanel.js   # Add/Edit session panel
│   │   ├── SessionList.js    # Recent sessions list
│   │   ├── AuthForm.js       # Login/Register form
│   │   └── SupportModal.js   # Contact Support modal
│   ├── services/
│   │   └── api.js            # API client
│   ├── index.js              # React entry
│   └── index.css             # Global styles
├── server.js                 # Express API (Postgres, auth, sessions, support)
├── vercel.json               # Vercel build & routing
├── package.json
└── README.md
```

## Usage

1. Sign in (or register) with email/password.
2. Add new sessions (date, location, variation, blinds, amounts, duration, notes).
3. View analytics on the dashboard; filter by location, variation, blinds, location type, and date range.
4. Use the Calendar to manage sessions by date.
5. Send feedback from “Contact Support” (sends email to the maintainer).

## License

MIT

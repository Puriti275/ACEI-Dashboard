# ACEI Dashboard (Administrative Data Dashboard)

Internal administrative dashboard for the [Anderson Center for Entrepreneurship](https://haslam.utk.edu/anderson-center/),
built to help department leadership visualize student engagement and
demographic trends across 5+ years of historical data.

## What it does
- **Frontend** — React/Next.js interface for browsing and filtering a
  multi-year historical dataset
- **Backend** — Node.js integration layer pooling data from Airtable's API
- **Data visualization** — Python scripts (Matplotlib) generating charts from
  the underlying dataset
- **Auth** — JWT-based authentication restricting access to department
  leadership only

## Tech Stack
- TypeScript, React, Next.js
- Node.js (Airtable API integration)
- Python (Matplotlib for data viz)
- JWT auth

## Status
🚧 Active development — extending into automation scripts and a
recommendation system based on engagement trends.

## Note
Handles internal student engagement/demographic data — repo access and any
screenshots are limited to non-sensitive views only.

## Running Locally
```bash
git clone https://github.com/Puriti275/ACEI-Dashboard.git
cd ACEI-Dashboard
npm install
# add your actual env setup / run command
npm run dev
```

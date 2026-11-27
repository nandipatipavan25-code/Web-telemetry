# Web Telemetry SRE Monitor — Frontend Console

A real-time SRE website auditing and incident management console built with React 18, Tailwind CSS, Recharts, and Vite.

---

## 🚀 Features

- **Real-Time SRE Dashboard**: Instant uptime metrics, TTFB response trends, and server health gauges.
- **Interactive Charting**: Latency curves and historical check metrics visualized with Recharts.
- **SSL & Domain Expiry Dashboard**: Visual countdowns, validity checks, and domain registrar details.
- **WordPress Diagnostics View**: Live status of core versions, active/inactive plugins, and known vulnerability warnings.
- **SEO & Performance Auditor**: In-depth page analysis, meta tag checks, Lighthouse metrics, and image optimization insights.
- **Live Incident Alerts**: Real-time push updates via WebSocket (Socket.io) with sound and visual badge triggers.
- **Dark/Light Mode**: Full custom-styled SRE dark theme.

---

## 📁 Repository Structure

```
frontend/
├── src/
│   ├── components/            # Specialized SRE dashboard views
│   │   ├── AdminDashboard.jsx
│   │   ├── DomainExpiryDashboard.jsx
│   │   ├── EmailAlertSettings.jsx
│   │   ├── ImageOptimizationAnalyzer.jsx
│   │   ├── MalwareReport.jsx
│   │   ├── SeoDashboard.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── SiteAnalysisDashboard.jsx
│   │   ├── SSLMonitor.jsx
│   │   ├── UptimeDashboard.jsx
│   │   ├── WebsiteDetail.jsx
│   │   ├── WebsitesCatalog.jsx
│   │   └── WordPressDashboard.jsx
│   ├── apiConfig.js           # Centralized API and WebSocket URL resolver
│   ├── App.jsx                # Main portal view and routing container
│   ├── index.css              # Global Tailwind styles
│   └── main.jsx               # Application entry point
├── index.html                 # HTML template
├── package.json               # Frontend dependencies (React, Vite, Tailwind, Recharts)
├── postcss.config.js          # PostCSS compiler configuration
├── tailwind.config.js         # Tailwind theme customizations
├── vercel.json                # Vercel deployment & rewrite proxy rules
└── vite.config.js             # Vite dev server and proxy configuration
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of `frontend/`:
```env
# URL of your backend API (omit to use Vite local proxy during development)
VITE_API_URL=http://localhost:5000
```
*Note: In development, Vite automatically proxies `/api` and `/socket.io` to `http://localhost:5000`.*

### 4. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 5. Building for Production
```bash
npm run build
```
Build outputs are written to `dist/` (and mirrored to `build/` for deployment host compatibility).

---

## 🚢 Deployment

### Deploy to Vercel
This repository is pre-configured with [`vercel.json`](./vercel.json):
1. Connect this frontend repository to **Vercel**.
2. Set the build command to `npm run build` and output directory to `build`.
3. Add the environment variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com`).

---

## 📦 Pushing to Git

To push this folder to its own Git repository:
```bash
cd frontend
git init
git add .
git commit -m "feat: initial commit for frontend console SPA"
git branch -M main
git remote add origin <YOUR_FRONTEND_REPO_URL>
git push -u origin main
```

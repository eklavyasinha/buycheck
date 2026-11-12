# BuyCheck

🌐 **Live Website:** https://spry-piano-ofd2b3r.tmp.now/
🔗 **Backend:** https://buycheck-server.onrender.com
# BuyCheck — AI Shopping Intelligence & Payment Protection Platform

> **Shop smarter. Pay with confidence.**

BuyCheck is a full-stack, production-quality consumer protection platform that helps online shoppers understand the real cost, hidden commitments, and dark patterns of purchases before paying.

Users can submit product URLs, checkout screenshots, or pasted merchant terms. BuyCheck analyzes the information with Google Gemini, computes a deterministic True Cost calculation, audits merchant terms against user-defined purchasing rules, and allows consumers to proceed through a controlled PayPal Sandbox checkout.

---

## 🌟 Key Features

1. **Multi-Modal Purchase Ingestion**
   - **Product URL Analysis**: SSRF-protected web scraper with IP blocklists and private CIDR filtering.
   - **Screenshot & Image Uploads**: Visual OCR and pricing table understanding using Gemini Vision.
   - **Pasted Terms & Cart Text**: Direct auditing of terms, refund conditions, and fine print.

2. **Deterministic True Cost Calculator**
   - Separates confirmed charges from conditional or unverified fees.
   - Mathematically calculates base price + shipping + taxes + mandatory handling fees.
   - Projects recurring monthly and annual costs separately from initial checkout totals.
   - Interactive visual cost composition chart using Recharts.

3. **Dark Pattern & Trap Detector**
   - Detects hidden recurring subscriptions, pre-checked opt-ins, and artificial urgency.
   - Backed by verbatim merchant evidence quotes and consumer impact explanations.

4. **Personal Purchase Rules Engine**
   - Define custom purchasing rules (e.g. maximum price, return window, no subscriptions).
   - Natural language rule interpreter powered by Gemini.

5. **Deterministic Conditional Checkout Engine**
   - **AI never authorizes payments independently.**
   - Backend deterministic rule evaluator determines outcome: `APPROVED`, `BLOCKED`, `NEEDS_REVIEW`, or `UNABLE_TO_VERIFY`.
   - Requires explicit user review and locks authorized funds before creating payment sessions.

6. **Official PayPal Sandbox Integration**
   - Server-side order creation (`/v2/checkout/orders`).
   - Server-side capture and amount verification.
   - Webhook signature verification and idempotent transaction storage.

7. **PayPal Buyer Protection Informational Evaluator**
   - Evaluates physical goods, intangible digital items, and recurring billing agreement exclusions based on official PayPal User Agreement criteria.

8. **Contextual AI Purchase Assistant**
   - In-report conversational assistant strictly grounded in verified report facts.

9. **Guest Demo Mode**
   - One-click exploration with realistic sample datasets without requiring API keys.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v7, Framer Motion, Recharts, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, Zod, Mongoose, Axios, Cheerio, Multer, bcryptjs, JWT, Helmet, CORS, Rate Limiting |
| **AI** | Google Gemini API via official `@google/genai` SDK (`gemini-3.8-flash`) |
| **Database** | MongoDB Atlas with Mongoose (with In-Memory Local Persistence fallback) |
| **Payments** | PayPal Developer Sandbox (REST Orders API v2 & Webhook Verification) |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js >= 18.x (Node 20+ recommended)
- npm >= 9.x

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/buycheck.git
cd buycheck

# Install dependencies across all workspaces
npm install
```

### 2. Configure Environment Variables

Copy the example environment files:

```bash
cp .env.example server/.env
```

Edit `server/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Optional: MongoDB Atlas URI (leave empty for automatic In-Memory Local Persistence)
MONGODB_URI=

# Optional: Google Gemini API Key (Get at https://aistudio.google.com/)
# If left empty, BuyCheck runs in Honest Demonstration Analysis Mode
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash

# Optional: PayPal Sandbox Credentials (Get at https://developer.paypal.com/)
# If left empty, BuyCheck runs in Sandbox Simulation Mode
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
```

### 3. Run the Development Server

You can run both backend and frontend concurrently:

```bash
# From the root directory:
npm run dev
```

Or run them individually:

```bash
# Terminal 1: Backend API (runs on http://localhost:5001)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:3000)
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

BuyCheck includes automated test suites covering the True Cost Calculator, Rule Engine decisions, SSRF prevention, and Zod schema validations:

```bash
# Run backend test suite
npm run test:server

# Run frontend TypeScript & lint check
npm run test:client

# Run complete test suite
npm test
```

---

## 🛡️ Security Architecture

- **SSRF Prevention**: The URL scraping engine blocks internal IP spaces (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`), link-local metadata endpoints (`169.254.169.254`), and non-HTTP protocols.
- **Strict Data Isolation**: Every analysis, rule, and transaction is scoped strictly to the authenticated user ID.
- **Server-Side Payment Lock**: PayPal order amounts and currencies are created and captured server-side, preventing client-side price tampering.
- **Secret Hygiene**: API keys and secrets are loaded exclusively in the Node.js backend and never bundled into frontend assets.

---

## 🚢 Production Deployment Guide

### Frontend (Vercel)
1. Link the `client` directory to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend (Render)
1. Deploy the `server` directory as a Web Service.
2. Build command: `npm run build`
3. Start command: `node dist/app.js`
4. Set environment variables: `MONGODB_URI`, `GEMINI_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.

---

## 📄 Documentation

- [Technical Architecture](docs/ARCHITECTURE.md)
- [3-Minute Demo Video Script](docs/DEMO_SCRIPT.md)

---

## ⚖️ License

Distributed under the [MIT License](LICENSE).

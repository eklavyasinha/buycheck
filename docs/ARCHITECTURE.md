# BuyCheck Technical Architecture & Specification

## 1. System Overview

BuyCheck is an AI shopping intelligence and payment protection platform. It converts complex product pages, ambiguous checkout fees, fine-print terms, and screenshots into transparent, evidence-grounded purchase reports.

Before payment is made, a deterministic conditional checkout engine evaluates merchant claims against user-defined purchasing rules and enforces authorization limits before connecting with PayPal Sandbox.

```
                  ┌───────────────────────────────────────────────┐
                  │                 USER CLIENT                   │
                  │   (React 18 + Vite + Tailwind + Framer)       │
                  └───────┬───────────────────────────────▲───────┘
                          │ HTTP / JSON                   │
                          ▼                               │
                  ┌───────────────────────────────────────┴───────┐
                  │              EXPRESS BACKEND                  │
                  │        (Node.js + TypeScript + Zod)           │
                  └───┬─────────────┬─────────────┬───────────┬───┘
                      │             │             │           │
       ┌──────────────┴─┐    ┌──────┴──────┐ ┌────┴─────┐ ┌───┴───────────────┐
       │ SSRF Protected │    │   Gemini    │ │   Rule   │ │ PayPal Sandbox    │
       │ Scraper        │    │ AI Service  │ │  Engine  │ │ Orders API v2     │
       │ (Cheerio)      │    │ (@google/   │ │ (Determ- │ │ (Create, Capture, │
       │                │    │  genai)     │ │  inistic)│ │  Verify Webhooks) │
       └────────────────┘    └─────────────┘ └──────────┘ └───────────────────┘
                                    │
                             ┌──────┴──────┐
                             │ Persistence │
                             │ (MongoDB /  │
                             │  In-Memory) │
                             └─────────────┘
```

## 2. Core Architecture Pipelines

### A. Input Ingestion & SSRF Protection
- **URL Analysis**: Validates destination protocol (HTTP/HTTPS only). Resolves host DNS and inspects all returned IP addresses. Explicitly denies loopbacks (`127.0.0.1`), link-local metadata services (`169.254.169.254`), and private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `fc00::/7`).
- **Image Analysis**: Accepts JPG, PNG, and WEBP files up to 10MB using memory buffers. Sends image data directly to Gemini Vision for OCR and visual fee detection.
- **Pasted Text Analysis**: Directly parses user-provided Terms of Service, cart summaries, or pricing tables.

### B. Gemini AI Structured Analysis Engine
- Model: `gemini-3.8-flash` (configurable through `GEMINI_MODEL`).
- Client: Official `@google/genai` TypeScript SDK.
- Output Enforcement: Zod schema validation on backend. Nullable fields for unstated terms (no fabricated defaults).
- Honest Fallback: When `GEMINI_API_KEY` is not present, the system activates a deterministic heuristic demo analyzer with realistic consumer protection benchmarks, clearly flagged as `isDemoAnalysis: true`.

### C. True Cost Calculator
- Mathematically computes the total upfront purchase price:
  `Confirmed Total = Advertised Base Price + Confirmed Shipping + Confirmed Taxes + Confirmed Fees`
- Keeps possible/conditional fees (restocking fees, return shipping deductions) separate from confirmed totals.
- Projects monthly and annual subscription totals separately from initial checkout.

### D. Deterministic Conditional Checkout Engine
The AI never authorizes payments independently. A backend deterministic evaluator compares extracted terms against user rules:
- `APPROVED`: All mandatory user rules are satisfied by verified evidence.
- `BLOCKED`: A known condition violates a mandatory rule (e.g. price exceeded, subscription detected).
- `NEEDS_REVIEW`: High-severity warnings or uncertain items require explicit user acknowledgment.
- `UNABLE_TO_VERIFY`: Crucial facts (such as return window) are undisclosed.

### E. PayPal Sandbox Integration
- Server-side order creation (`/v2/checkout/orders`) with pre-approved price lock.
- User authorization via PayPal approval flow.
- Server-side capture and verification (`/v2/checkout/orders/{id}/capture`).
- Amount and currency validation ensuring captured funds match approved parameters.
- Idempotent transaction recording in MongoDB / repository.
- Webhook signature verification (`/v1/notifications/verify-webhook-signature`).

## 3. Storage Layer
Dual-mode repository abstraction:
- When `MONGODB_URI` is provided, connects via Mongoose to MongoDB Atlas.
- When `MONGODB_URI` is empty, runs in-memory persistence with pre-seeded demo records for guest exploration.

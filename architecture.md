# Rijal.in — System Architecture
> Version 1.0 · May 2026
> Stack: Static HTML + Cloudflare Pages + Cloudflare Workers + Razorpay + Resend

---

## 1. Overview

Rijal.in is a premium D2C grooming & apparel brand (Kashmir, India). The website is a **multi-page static HTML site** hosted on **Cloudflare Pages**, with serverless **Cloudflare Workers** handling all sensitive backend operations (order creation, payment verification, email dispatch, contact forms). No Node.js server, no database — all state is transient and passed through the checkout flow.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE PAGES (CDN)                           │
│  index.html  shop.html  about.html  contact.html  checkout.html         │
│  order-success.html  /product/*.html                                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ fetch()
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE WORKERS (API)                           │
│  POST /api/create-order      → Razorpay: create order                  │
│  POST /api/verify-payment    → Verify HMAC · Send emails via Resend     │
│  POST /api/contact           → Send inquiry email to owner              │
│  POST /api/notify-me         → Send stock alert email to owner          │
└──────────────┬──────────────────────────────────┬───────────────────────┘
               │                                  │
               ▼                                  ▼
    ┌──────────────────┐               ┌───────────────────┐
    │   RAZORPAY API   │               │    RESEND API      │
    │  (order create,  │               │  (transactional    │
    │   verification)  │               │   email service)   │
    └──────────────────┘               └───────────────────┘
```

---

## 2. File & Folder Structure

```
rijal/
├── public/                         ← Cloudflare Pages root
│   ├── index.html                  ← Home page (DONE)
│   ├── shop.html                   ← Online shop / product grid
│   ├── about.html                  ← About page
│   ├── contact.html                ← Contact page (form + WhatsApp)
│   ├── checkout.html               ← Order form → summary → Razorpay
│   ├── order-success.html          ← Post-payment confirmation page
│   ├── product/
│   │   ├── beard-oil.html          ← Product detail: Beard Oil
│   │   ├── combo.html              ← Product detail: Beard Oil + Comb Combo
│   │   ├── comb.html               ← Product detail: Wooden Comb
│   │   ├── cap-black.html          ← Product detail: Cap Black (OOS)
│   │   ├── cap-grey.html           ← Product detail: Cap Grey (OOS)
│   │   ├── hoodie-beige.html       ← Product detail: Hoodie Beige (OOS)
│   │   └── hoodie-black.html       ← Product detail: Hoodie Black (OOS)
│   └── assets/
│       ├── bottle.glb              ← 3D bottle model (existing)
│       └── favicon.ico
│
├── workers/                        ← Cloudflare Workers (deployed separately)
│   ├── create-order.js             ← POST /api/create-order
│   ├── verify-payment.js           ← POST /api/verify-payment
│   ├── contact.js                  ← POST /api/contact
│   └── notify-me.js                ← POST /api/notify-me
│
└── wrangler.toml                   ← Cloudflare config (routes, secrets)
```

---

## 3. Pages — Specification

### 3.1 `index.html` — Home ✅ (Exists)
Already built. No changes needed.

---

### 3.2 `shop.html` — Online Shop
**Purpose:** Product catalogue with all 7 products. Filter by category. In-stock items lead to checkout; out-of-stock items show an "Enquire" / "Notify Me" modal.

**Sections:**
- Page hero: "The Collection" headline + category filter tabs (All · Grooming · Apparel)
- Product grid (3 columns desktop, 2 tablet, 1 mobile)
  - IN STOCK cards: Product image, name, price (strikethrough + sale), "Buy Now" button → `/checkout.html?product=<id>`
  - OUT OF STOCK cards: Same layout but greyed overlay + "Notify Me" button → triggers inline modal
- Footer (same as all pages)

**Product IDs (used in query string):**
| ID | Product | Price | Stock |
|---|---|---|---|
| `beard-oil` | Rijal Beard Oil | ₹399 | ✅ |
| `combo` | Beard Oil + Comb Combo | ₹499 | ✅ |
| `comb` | Rijal Wooden Comb | ₹199 | ✅ |
| `cap-black` | Premium Cap — Black | ₹249 | ❌ |
| `cap-grey` | Premium Cap — Grey | ₹249 | ❌ |
| `hoodie-beige` | Premium Hoodie — Beige | ₹999 | ❌ |
| `hoodie-black` | Premium Hoodie — Black | ₹999 | ❌ |

---

### 3.3 `about.html` — About
**Purpose:** Brand story, founder, mission, values.

**Sections:**
- Hero: "We are Passionate About Our Work" + about-us.jpg hero image
- About copy (3 paragraphs from content-1.md §5)
- Core Values grid (6 cards)
- Mission section with 4 pillars
- Founder quote: Abdul Hanan, CEO
- Footer

---

### 3.4 `contact.html` — Contact
**Purpose:** Two contact methods — email inquiry form + WhatsApp CTA.

**Sections:**
- Hero: "Let's Connect"
- **Inquiry Form** (sends to `/api/contact`):
  - Name (text, required)
  - Email (email, required)
  - Phone (tel, optional)
  - Message (textarea, required)
  - Submit button
  - On success: inline toast "Message sent! We'll reply within 24 hours."
  - On error: inline error message
- **WhatsApp CTA block:** Large button linking to `https://wa.me/919103998116?text=Hi%20Rijal%2C%20I%27d%20like%20to%20enquire%20about%20your%20products.`
- **Contact details:** Phone, Email, Address, Instagram
- Footer

---

### 3.5 `product/<slug>.html` — Product Detail Pages (7 pages)
**Purpose:** Full product page for each SKU.

**Sections:**
- Breadcrumb: Home → Shop → Product Name
- Product hero: image gallery (3 images, click to switch main image) + product info
  - Product name, tagline
  - Pricing (strikethrough MRP + sale price) + "Free Shipping" badge
  - Stock badge: "In Stock ✓" or "Out of Stock" 
  - For IN STOCK: Quantity selector (1–5) + "Buy Now" button → `/checkout.html?product=<id>&qty=<n>`
  - For OUT OF STOCK: "Notify Me When Available" → inline email capture form → `/api/notify-me`
  - WhatsApp order button: `wa.me/919103998116` with pre-filled product message
- Product description (full copy from content-1.md)
- Key benefits / features list
- Ingredients table (Beard Oil only)
- How to use (Beard Oil only)
- Related products (2–3 other products from the catalogue)
- Footer

---

### 3.6 `checkout.html` — Checkout Flow
**Purpose:** Multi-step order flow: Customer Details → Order Summary → Razorpay Payment.

**This is the most critical page.** It operates as a 3-step wizard with no page reloads.

#### Step 1 — Customer Details Form
Fields collected:
- Full Name (text, required)
- Mobile Number (tel, 10-digit Indian, required)
- Email Address (email, required — for order confirmation)
- Delivery Address (textarea, required)
- City (text, required)
- State (select — all Indian states, required)
- Pincode (text, 6-digit, required)

On "Continue →": validate all fields client-side, then advance to Step 2.

#### Step 2 — Order Summary
Displayed from URL query params (`?product=beard-oil&qty=2`) and localStorage cart:
- Product name, image thumbnail, quantity, unit price, line total
- Subtotal
- Shipping: **FREE** (always)
- **Grand Total** (bold)
- Customer details summary (Name, Phone, Address — editable via "← Edit" button)
- "Confirm & Pay ₹XXX" button → triggers Step 3

#### Step 3 — Razorpay Payment
On "Confirm & Pay":
1. Frontend calls `POST /api/create-order` with `{ amount, productId, qty, customer }` (JSON)
2. Worker returns `{ razorpay_order_id, amount, currency }` or error
3. Frontend opens **Razorpay Checkout SDK** modal with:
   - `key`: Razorpay Key ID (public, safe in frontend)
   - `order_id`: from Worker response
   - `amount`, `currency: "INR"`
   - `name: "Rijal Store"`
   - `description`: product name
   - `prefill`: customer name, email, phone
   - `theme.color`: `#6D2932` (brand burgundy)
4. On payment success callback: call `POST /api/verify-payment` with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature, customer, cart }`
5. Worker verifies HMAC-SHA256 signature
6. On verification success: Worker sends emails (owner + customer) via Resend
7. Frontend redirects to `/order-success.html?order_id=<id>`
8. On any failure: show error message inline, allow retry

**State management:** All cart & customer data lives in `sessionStorage` during the checkout flow. Nothing is persisted after the session.

---

### 3.7 `order-success.html` — Order Success
**Purpose:** Confirm the order and guide next steps.

**Sections:**
- Large checkmark animation
- "Order Placed Successfully!" heading
- Order ID (from URL query param)
- "A confirmation email has been sent to [email]"
- WhatsApp CTA: "Track your order or ask questions on WhatsApp"
- "Continue Shopping" button → `/shop.html`
- Footer

---

## 4. Cloudflare Workers — API Specification

All workers are deployed under the same Cloudflare Pages project using the `_worker.js` pattern or via `wrangler.toml` routing.

### 4.1 `POST /api/create-order`

**Purpose:** Create a Razorpay order server-side (keeps Key Secret off the frontend).

**Request body:**
```json
{
  "amount": 39900,        // in paise (₹399 × 100)
  "currency": "INR",
  "productId": "beard-oil",
  "qty": 1,
  "customer": {
    "name": "Arsalan Khan",
    "email": "arsalan@example.com",
    "phone": "9876543210"
  }
}
```

**Worker logic:**
```
1. Validate inputs (amount > 0, currency === "INR", required customer fields)
2. POST to https://api.razorpay.com/v1/orders
   with Basic Auth (key_id:key_secret)
   body: { amount, currency, receipt: "rijal_<timestamp>", notes: { productId, qty } }
3. Return { razorpay_order_id, amount, currency } to frontend
4. On error: return { error: "Order creation failed" } with HTTP 500
```

**Secrets required (Cloudflare env):**
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

---

### 4.2 `POST /api/verify-payment`

**Purpose:** Verify Razorpay payment signature (HMAC-SHA256), then send confirmation emails.

**Request body:**
```json
{
  "razorpay_payment_id": "pay_XXXX",
  "razorpay_order_id":   "order_XXXX",
  "razorpay_signature":  "HMAC_SIGNATURE",
  "customer": {
    "name": "Arsalan Khan",
    "email": "arsalan@example.com",
    "phone": "9876543210",
    "address": "123 Main Street, Baramulla, J&K 193101"
  },
  "cart": {
    "productName": "Rijal Beard Oil",
    "qty": 1,
    "price": 39900
  }
}
```

**Worker logic:**
```
1. Construct expected signature:
   HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
2. Compare with razorpay_signature using crypto.subtle (constant-time)
3. If mismatch: return HTTP 400 { error: "Payment verification failed" }
4. If match:
   a. Send email to owner (rijalstore1212@gmail.com) via Resend — order details
   b. Send email to customer (customer.email) via Resend — confirmation receipt
   c. Return HTTP 200 { success: true }
```

**Secrets required:**
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `OWNER_EMAIL` = `rijalstore1212@gmail.com`

**Owner email template (plain text):**
```
Subject: 🛒 New Order — [Product Name] × [Qty] — ₹[Amount]
Body: New order received on Rijal Store.
Order ID: [razorpay_order_id]
Payment ID: [razorpay_payment_id]
Product: [productName] × [qty]
Amount Paid: ₹[amount/100]
---
Customer:
Name: [name]
Phone: [phone]
Email: [email]
Address: [address]
---
Please fulfil and ship within 2 business days.
```

**Customer email template:**
```
Subject: Your Rijal Order is Confirmed! 🎉
Body: Assalamu Alaikum [name],
Your order has been placed successfully.
Order ID: [razorpay_order_id]
Product: [productName] × [qty]
Amount Paid: ₹[amount/100] (Free Shipping)
---
Delivery Address: [address]
---
We'll dispatch your order within 2 business days.
For queries: WhatsApp us at +91-9103998116 or email rijalstore1212@gmail.com
Jazakallah Khair,
Team Rijal
```

---

### 4.3 `POST /api/contact`

**Purpose:** Handle contact form submission. Send inquiry email to owner.

**Request body:**
```json
{
  "name": "Naseem",
  "email": "naseem@example.com",
  "phone": "9876543210",
  "message": "I want to know more about the beard oil."
}
```

**Worker logic:**
```
1. Validate name, email, message are non-empty
2. Send email to OWNER_EMAIL via Resend
   Subject: 💬 Website Inquiry from [name]
   Body: name, email, phone, message
3. Return HTTP 200 { success: true }
```

**Secrets required:** `RESEND_API_KEY`, `OWNER_EMAIL`

---

### 4.4 `POST /api/notify-me`

**Purpose:** Capture email for out-of-stock product restock alert.

**Request body:**
```json
{
  "email": "customer@example.com",
  "productId": "cap-black",
  "productName": "Premium Cap — Black"
}
```

**Worker logic:**
```
1. Validate email
2. Send email to OWNER_EMAIL via Resend
   Subject: 🔔 Restock Request — [productName]
   Body: [email] wants to be notified when [productName] is back in stock.
3. Return HTTP 200 { success: true }
```

---

## 5. Environment Variables & Secrets

All secrets stored in Cloudflare dashboard under **Workers & Pages → Settings → Environment Variables** (encrypted).

| Variable | Where Used | Value |
|---|---|---|
| `RAZORPAY_KEY_ID` | create-order, frontend (public) | `rzp_live_XXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | create-order, verify-payment | Never exposed to frontend |
| `RESEND_API_KEY` | verify-payment, contact, notify-me | `re_XXXXXXXXXXXXXXXX` |
| `OWNER_EMAIL` | verify-payment, contact, notify-me | `rijalstore1212@gmail.com` |
| `RESEND_FROM_EMAIL` | all email workers | `orders@rijal.in` (verify domain with Resend) |

**Frontend-safe variables (can be in JS):**
- `RAZORPAY_KEY_ID` — Required by the Razorpay checkout SDK. Safe to expose.

---

## 6. Payment Flow — Sequence Diagram

```
Customer                Frontend              /api/create-order     Razorpay        /api/verify-payment    Resend
    │                      │                         │                  │                    │                 │
    │  Click "Confirm &    │                         │                  │                    │                 │
    │  Pay ₹399"           │                         │                  │                    │                 │
    │─────────────────────▶│                         │                  │                    │                 │
    │                      │  POST /api/create-order  │                  │                    │                 │
    │                      │─────────────────────────▶│                  │                    │                 │
    │                      │                         │  POST /v1/orders  │                    │                 │
    │                      │                         │─────────────────▶│                    │                 │
    │                      │                         │  { order_id }     │                    │                 │
    │                      │                         │◀─────────────────│                    │                 │
    │                      │  { razorpay_order_id }   │                  │                    │                 │
    │                      │◀─────────────────────────│                  │                    │                 │
    │                      │                         │                  │                    │                 │
    │  Razorpay modal      │                         │                  │                    │                 │
    │  opens ──────────────│                         │                  │                    │                 │
    │  (customer pays)     │                         │                  │                    │                 │
    │                      │                         │                  │                    │                 │
    │                      │  payment_id, order_id,  │                  │                    │                 │
    │                      │  signature (callback)   │                  │                    │                 │
    │                      │─────────────────────────────────────────────────────────────────▶                 │
    │                      │                         │                  │  Verify HMAC        │                 │
    │                      │                         │                  │  Send emails ───────────────────────▶│
    │                      │                         │                  │                    │  Owner email    │
    │                      │                         │                  │                    │  Customer email │
    │                      │  { success: true }       │                  │                    │                 │
    │                      │◀─────────────────────────────────────────────────────────────────                 │
    │  Redirect to         │                         │                  │                    │                 │
    │  /order-success.html │                         │                  │                    │                 │
    │◀─────────────────────│                         │                  │                    │                 │
```

---

## 7. Security Considerations

| Threat | Mitigation |
|---|---|
| Fake payment confirmation | HMAC-SHA256 signature verified server-side in Worker before any order action |
| Key secret exposure | `RAZORPAY_KEY_SECRET` lives only in Cloudflare env vars, never in frontend JS |
| CSRF on API endpoints | Workers check `Content-Type: application/json`; all state is per-request |
| Amount tampering | Frontend sends `productId + qty`; Worker calculates canonical amount from server-side product catalog — does NOT trust frontend `amount` |
| Email spam via contact form | Basic rate limiting via Cloudflare's built-in request limits + honeypot field |
| XSS | All user data is sanitised before inserting into email templates |

**Critical note on amount:** The `/api/create-order` worker must maintain its own product price table:
```js
const PRICES = {
  'beard-oil': 39900,   // ₹399 in paise
  'combo':     49900,   // ₹499
  'comb':      19900,   // ₹199
};
// Amount is computed server-side: PRICES[productId] * qty
// NEVER trust the amount sent by the frontend
```

---

## 8. Razorpay Setup Checklist

- [ ] Create Razorpay account at razorpay.com
- [ ] Complete KYC (PAN + Bank account for Abdul Hanan / Rijal Store)
- [ ] Get Live API Key ID and Key Secret from Dashboard → Settings → API Keys
- [ ] Set Webhook URL: `https://rijal.in/api/verify-payment` in Razorpay Dashboard → Webhooks
- [ ] Webhook secret: set a `RAZORPAY_WEBHOOK_SECRET` if using webhooks (optional — this arch uses client-side callback + server verify instead)
- [ ] Add Razorpay checkout SDK to checkout.html: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

---

## 9. Resend Email Setup Checklist

- [ ] Create Resend account at resend.com
- [ ] Add and verify domain `rijal.in` (add DNS records provided by Resend)
- [ ] Create sending address: `orders@rijal.in`
- [ ] Get API Key and store as `RESEND_API_KEY` in Cloudflare
- [ ] Free tier: 3,000 emails/month (sufficient for early growth)

---

## 10. Cloudflare Deployment Checklist

- [ ] Connect GitHub repo to Cloudflare Pages
- [ ] Set build output directory: `public/`
- [ ] Add all environment secrets in Cloudflare dashboard
- [ ] Deploy Workers via `wrangler deploy` or Cloudflare dashboard
- [ ] Add custom domain `rijal.in` in Cloudflare Pages settings
- [ ] Enable HTTPS (automatic with Cloudflare)
- [ ] Test full checkout flow end-to-end in Razorpay **test mode** before going live

---

## 11. WhatsApp Integration

WhatsApp is used in two places:

**1. Contact page — Primary CTA:**
```
https://wa.me/919103998116?text=Hi%20Rijal%2C%20I%27d%20like%20to%20enquire%20about%20your%20products.
```

**2. Product pages — Quick order option:**
```
https://wa.me/919103998116?text=Hi%2C%20I%27d%20like%20to%20order%20[PRODUCT_NAME].%20Please%20share%20details.
```
(Product name is URL-encoded and injected dynamically per page)

**3. Order success page — Post-purchase support:**
```
https://wa.me/919103998116?text=Hi%2C%20my%20Rijal%20order%20ID%20is%20[ORDER_ID].%20I%20need%20help.
```

WhatsApp number: **+91-9103998116** (Abdul Hanan)

---

## 12. Design System (for consistency across all pages)

All pages must match `index.html` exactly in visual language.

| Token | Value |
|---|---|
| `--bg` | `#1a0508` |
| `--ink` | `#E8D8C4` |
| `--amber` | `#6D2932` |
| Font — Headings | `Instrument Serif` (Google Fonts) |
| Font — Body | `Barlow` 300/400/500/600 (Google Fonts) |
| CSS Framework | Tailwind CDN (same config as index.html) |
| Scroll animation | GSAP + ScrollTrigger (CDN) |
| Glass effect | `.liquid-glass` and `.liquid-glass-strong` classes (copy from index.html) |
| Reveal animation | `.reveal` class with IntersectionObserver (copy from index.html) |
| Canvas background | Three.js particle/ambient background (copy canvas setup from index.html) |
| Buttons | `.btn-primary` (white) and `.btn-amber` (burgundy gradient) |

**Shared components to copy verbatim across every page:**
- `<head>` block (fonts, Tailwind config, CSS variables, all utility classes)
- `<header>` navigation bar
- `<footer>` block
- Canvas background (`<canvas id="bg">` + Three.js setup)
- Scroll reveal IntersectionObserver script

---

## 13. Navigation Structure

```
Header nav (all pages):
  RIJAL [logo/wordmark] · Home · Shop · About · Contact · [Cart icon]

Footer nav:
  Home · Online Shop · About · Contact
  © 2026 Rijal · Instagram @rijal.store1
```

Active page link should have an underline or subtle highlight indicator.

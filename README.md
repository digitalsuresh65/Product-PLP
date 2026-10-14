# A&A Fashion Boutique — Cash On Delivery funnel

A production-oriented local Next.js funnel for the **Hand-Embroidered One-Piece Dress**. It includes:

- Product landing page with responsive image gallery and live quantity total
- Cash On Delivery checkout with validation and duplicate-submit protection
- Server-side Google Sheets order storage
- Business order email and customer confirmation email
- Thank-you page with order summary
- Environment-based credentials suitable for Vercel

No online payment integration is included. No reel section is included because no reel links were supplied.

> The current Nepali-name testimonials are explicitly marked as sample copy. Replace them with genuine, verified customer feedback before publishing.

## Recommended stack and order flow

- **Next.js App Router + TypeScript** for the pages and server API in one deployable project
- **Tailwind CSS** for responsive styling
- **Zod** for server-side input validation
- **Google Sheets API** with a service account for order storage
- **Nodemailer + Gmail SMTP** for both HTML emails

When a customer submits the checkout form:

1. The browser sends the customer details, product ID, quantity, and a stable request ID to `POST /api/order`.
2. The server validates every field and recalculates the trusted price from `lib/product.ts`. Browser-supplied prices are never trusted.
3. The server generates an order ID and appends the order to Google Sheets.
4. It sends the business notification email.
5. It sends the customer confirmation email.
6. Only after all three required operations succeed does the API return success and the browser redirects to `/thank-you`.

The request ID makes retries idempotent for the spreadsheet row. While emails are being processed, the Notes cell temporarily records notification progress; it is cleared after both emails succeed. This prevents a retry from creating a second sheet row or resending an email that was already recorded as sent.

## Local setup

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The pages can be previewed without credentials. A real checkout submission requires the Google and SMTP values below.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://your-domain.com` |
| `FRONTEND_URL` | Allowed browser origin; normally the same public URL |
| `BUSINESS_EMAIL` | Receives new-order notifications |
| `EMAIL_FROM` | Sender address shown to customers |
| `BRAND_NAME` | Brand shown in emails |
| `GOOGLE_SHEET_ID` | ID from the Google Sheet URL |
| `GOOGLE_SHEET_TAB_NAME` | Exact tab name, e.g. `Orders` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email address |
| `GOOGLE_PRIVATE_KEY` | Service-account private key with `\n` line breaks |
| `SMTP_HOST` | Gmail uses `smtp.gmail.com` |
| `SMTP_PORT` | Gmail SSL uses `465` |
| `SMTP_USER` | Gmail/Google Workspace account |
| `SMTP_PASS` | Google App Password, not the normal account password |
| `EMAIL_SERVICE_API_KEY` | Reserved if SMTP is later replaced by Resend/Brevo/SendGrid |

For local development, either leave `FRONTEND_URL` blank or set it to `http://localhost:3000`. On Vercel, set both URL variables to the final HTTPS origin.

## Google Spreadsheet setup

### 1. Create the spreadsheet and tab

1. Create a Google Spreadsheet.
2. Rename the intended tab, for example to `Orders`.
3. Put that exact tab name in `GOOGLE_SHEET_TAB_NAME`.

If row 1 is empty, the API creates and formats these columns automatically:

```text
Order ID | Date & Time | Customer Name | Phone Number | Email Address | Exact Location | Product Name | Quantity | Price Per Piece | Total Price | Payment Method | Order Status | Notes
```

It also freezes the header row, applies header styling, adds filters, auto-sizes columns, and adds the Order Status dropdown. If you create the header manually, spell and order every column exactly as above.

### 2. Add filters manually if needed

Select row 1, then choose **Data → Create a filter**. The API adds this automatically only when it creates an empty header row.

### 3. Add the Order Status dropdown manually if needed

Select column `L` from row 2 downward, choose **Data → Data validation → Dropdown**, and add:

- New Order
- Order Confirmed
- Order Ongoing
- Delivered
- Cancelled

### 4. Get the Sheet ID

For a URL such as:

```text
https://docs.google.com/spreadsheets/d/1AbCExampleKeyXYZ/edit
```

the Sheet ID is `1AbCExampleKeyXYZ`.

### 5. Create Google service-account credentials

1. Open Google Cloud Console and create or select a project.
2. Enable **Google Sheets API**.
3. Go to **IAM & Admin → Service Accounts** and create a service account.
4. Create a JSON key for that account and download it securely.
5. Copy `client_email` to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Copy `private_key` to `GOOGLE_PRIVATE_KEY`. In Vercel it may be pasted with the literal `\n` sequences; the server converts them to real line breaks.
7. Open the Google Sheet and share it with the service-account email as **Editor**.

Never commit the JSON key or `.env.local`.

## Gmail SMTP setup

1. Turn on two-step verification for the Gmail/Google Workspace account.
2. Create a Google **App Password** for Mail.
3. Use `smtp.gmail.com`, port `465`, the Gmail address as `SMTP_USER`, and the 16-character App Password as `SMTP_PASS`.
4. Set `EMAIL_FROM` to that same account unless your Workspace account has a verified sender alias.

The business email contains the complete customer, product, payment, and status details. The customer email contains the order summary, Cash On Delivery notice, support address, and confirmation-call message. Both use responsive, inline-CSS HTML that works in Gmail.

## Testing a complete order

1. Fill every value in `.env.local` and restart `npm run dev`.
2. Open the landing page and change the quantity.
3. Click an order button and verify the product, quantity, unit price, and total are prefilled.
4. Submit a real test name, phone, email, and exact location.
5. Confirm the button changes to **Submitting Order...** and cannot be clicked twice.
6. Confirm a new row appears in the Sheet with `New Order` status.
7. Confirm `BUSINESS_EMAIL` receives the new-order message.
8. Confirm the customer address receives the order-received message.
9. Confirm the browser redirects to `/thank-you` and shows the same order ID, quantity, and total.

If any required operation fails, the page stays on checkout and displays an error. Server details are logged only on the server. Correct the configuration and submit again; the stable request ID lets the API resume the same order rather than append a duplicate row.

## Verification commands

```bash
npm run typecheck
npm run build
```

## Deploying to Vercel later

1. Push this folder to a Git repository.
2. Import it in Vercel as a Next.js project.
3. Add every value from `.env.example` under **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to the final production URL.
5. Deploy, then submit one test order and verify the Sheet and both inboxes.
6. If a custom domain is added later, update both URL variables and redeploy.

The `/api/order` route uses the Node.js runtime and is compatible with Vercel serverless functions.

## Editing product content

The product name, prices, benefits, delivery note, and image paths live in `lib/product.ts`. Landing-page testimonials and FAQs live near the top of `app/page.tsx`. The shared website logo is `public/brand/aa-fashion-boutique-logo.png`. Server pricing always comes from `lib/product.ts`, so changing the offer price there updates the landing page, checkout, emails, and Sheet totals together.

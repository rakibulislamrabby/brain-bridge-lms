# Stripe Payment Setup Guide

## Quick Fix for "Stripe Configuration Error"

### Step 1: Check your `.env.local` file

Make sure your `.env.local` file is in the **root directory** of your project (same level as `package.json`).

### Step 2: Add the Stripe Publishable Key

Add this line to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important:**
- The variable name **must** start with `NEXT_PUBLIC_` (this is required for Next.js client-side access)
- Replace `pk_test_your_key_here` with your actual Stripe publishable key
- The key should start with `pk_test_` for test mode or `pk_live_` for live mode

### Step 3: Restart Your Development Server

**This is critical!** After adding or modifying environment variables:

1. Stop your current dev server (Ctrl+C)
2. Start it again: `npm run dev`

Environment variables are only loaded when the server starts.

### Step 4: Verify It's Working

1. Open your browser console (F12)
2. Look for the message: `🔍 Stripe Environment Variable Check:`
3. You should see `✓ Found` next to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Example `.env.local` file:

```env
NEXT_PUBLIC_MAIN_BASE_URL=http://your-api-url.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
# ... other variables
```

### Troubleshooting

- **Still not working?** Check the browser console for the debug message
- **Variable not found?** Make sure there are no spaces around the `=` sign
- **Server not restarted?** Environment variables only load on server start
- **Wrong location?** `.env.local` must be in the project root, not in `src/` folder

### Get Your Stripe Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)


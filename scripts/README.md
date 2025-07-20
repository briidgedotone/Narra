# Webhook Testing Guide

This directory contains scripts for testing webhook integrations.

## Quick Start

Run the webhook testing script:

```bash
npm run test:webhooks
```

## What the Script Tests

1. **Environment Variables** - Checks all required webhook secrets are set
2. **Database Connection** - Verifies Supabase connection
3. **Webhook Tables** - Checks users, subscriptions, webhook_events tables
4. **Recent Events** - Shows webhook events from last 24 hours
5. **Clerk Integration** - Lists recent user creations
6. **Stripe Integration** - Lists recent subscriptions
7. **Common Issues** - Checks for duplicate events and orphaned records

## Manual Testing

### Test Clerk Webhook

1. Create a new account in your app
2. Check the script output for the new user
3. Or use Clerk Dashboard > Webhooks > Test

### Test Stripe Webhooks

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Trigger test events:
   ```bash
   # Test payment success
   stripe trigger checkout.session.completed

   # Test payment failed
   stripe trigger invoice.payment_failed

   # Test subscription updated
   stripe trigger customer.subscription.updated
   ```

## Webhook Event Flow

### User Creation (Clerk)
1. User signs up → Clerk sends `user.created` event
2. `/api/webhook/clerk` receives event
3. User record created/updated in database

### Payment Success (Stripe)
1. User completes checkout → Stripe sends `checkout.session.completed`
2. `/api/stripe/webhook` receives event
3. Subscription record created in database
4. User's plan_id and subscription_status updated

### Payment Failed (Stripe)
1. Payment fails → Stripe sends `invoice.payment_failed`
2. `/api/stripe/webhook` receives event
3. Currently only logs (needs implementation)

## Troubleshooting

- **"No webhook events"** - Normal if you haven't triggered any events yet
- **"Database connection failed"** - Check SUPABASE_SERVICE_ROLE_KEY
- **"Missing environment variables"** - Add to `.env.local`
- **Stripe events not received** - Ensure `stripe listen` is running
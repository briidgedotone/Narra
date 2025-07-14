# Comprehensive Stripe Integration Analysis & Implementation Plan

## Current State Analysis

### ✅ **Already Exists (No Action Needed)**

1. **Database Schema**: `subscriptions` table already exists in schema.sql with proper structure
2. **Webhook Infrastructure**: `webhook_events` table exists for idempotency
3. **User Model**: `subscription_status` field already in users table
4. **Payment UI**: Select plan page exists (non-functional)
5. **Database Service**: Singleton pattern already implemented

### ❌ **Missing Components (Need Implementation)**

1. **Stripe SDK**: Not installed
2. **Environment Variables**: No Stripe keys configured
3. **API Routes**: No Stripe-specific endpoints
4. **Server Actions**: No payment processing logic
5. **Plan Limits**: Code references missing `plans` table
6. **Webhook Handling**: No actual Stripe webhook processing

## Implementation Plan with Verification

### **STEP 1: Package Installation & Environment Setup**

**Status**: ❌ **REQUIRED**

- **Install**: `npm install stripe @stripe/stripe-js`
- **Add to .env.local**:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- **Verification**: Check package.json shows no Stripe dependencies

### **STEP 2: Database Migration - Restore Plans Table**

**Status**: ❌ **REQUIRED**

- **Issue**: Code references `plans` table (discovery.ts:44, transcript route) but was removed in migration 009
- **Action**: Create new migration to add `plans` table:
  ```sql
  CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    stripe_price_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    limits JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- **Verification**: Current code fails when checking plan limits

### **STEP 3: API Routes Implementation**

**Status**: ❌ **REQUIRED**

#### **3.1 Checkout Session API** - `src/app/api/stripe/create-checkout-session/route.ts`

- **Purpose**: Create Stripe checkout sessions for plan selection
- **Integration**: Replace TODO in `select-plan/page.tsx:81`

#### **3.2 Stripe Webhook Handler** - `src/app/api/stripe/webhook/route.ts`

- **Purpose**: Handle subscription events from Stripe
- **Events**: `customer.subscription.created`, `updated`, `deleted`, `invoice.payment_succeeded`
- **Integration**: Update user subscription_status in database

#### **3.3 Customer Portal API** - `src/app/api/stripe/create-portal-session/route.ts`

- **Purpose**: Billing management for existing customers
- **Integration**: Add to dashboard for subscription management

### **STEP 4: Server Actions Update**

**Status**: 🔄 **PARTIAL** (users.ts missing, referenced in file structure)

#### **4.1 Create Missing Server Actions File**

- **File**: `src/app/actions/stripe.ts`
- **Functions**:
  - `createCheckoutSession(priceId, userId)`
  - `createCustomer(userId, email)`
  - `updateSubscriptionStatus(userId, status, subscriptionId)`

#### **4.2 Update Existing Actions**

- **File**: `src/app/actions/discovery.ts`
- **Issue**: Lines 32-47 reference missing `plans` table
- **Fix**: Update to use new plans table structure

### **STEP 5: Frontend Integration**

**Status**: 🔄 **PARTIAL** (UI exists but non-functional)

#### **5.1 Update Select Plan Page**

- **File**: `src/app/select-plan/page.tsx`
- **Current**: Shows alert message (line 85-87)
- **Update**: Replace handleSelectPlan function with actual Stripe checkout

#### **5.2 Add Payment Success/Cancel Pages**

- **Files**: `src/app/payment/success/page.tsx`, `src/app/payment/cancel/page.tsx`
- **Purpose**: Handle Stripe redirect URLs

#### **5.3 Add Billing Management**

- **File**: `src/app/dashboard/billing/page.tsx`
- **Purpose**: Customer portal access for existing subscribers

### **STEP 6: Middleware Integration**

**Status**: 🔄 **NEEDS UPDATE**

#### **6.1 Plan Validation Logic**

- **File**: `src/middleware.ts`
- **Current**: Only checks admin role (lines 54-57)
- **Add**: Subscription status and plan limit validation
- **Integration**: Cache plan data alongside user data

### **STEP 7: Database Service Extensions**

**Status**: 🔄 **NEEDS EXTENSION**

#### **7.1 Add Stripe Methods to DatabaseService**

- **File**: `src/lib/database.ts` (currently 1003 lines)
- **Add Methods**:
  - `createSubscription(subscriptionData)`
  - `updateSubscription(subscriptionId, updates)`
  - `getSubscriptionByUserId(userId)`
  - `createPlan(planData)`
  - `getPlanById(planId)`

### **STEP 8: Plan Limits Enforcement**

**Status**: ❌ **BROKEN** (References non-existent tables)

#### **8.1 Fix Discovery Limits**

- **File**: `src/app/actions/discovery.ts:38-47`
- **Issue**: References missing `plan_id` and `plans` table
- **Fix**: Implement proper plan checking logic

#### **8.2 Fix Transcript Limits**

- **File**: `src/app/api/transcript/route.ts`
- **Issue**: Same plan table references
- **Fix**: Update to use subscription-based limits

### **STEP 9: Usage Tracking Implementation**

**Status**: ❌ **MISSING**

#### **9.1 Add Usage Fields to Users Table**

- **Migration**: Add monthly counters for discoveries, transcripts, follows
- **Reset Logic**: Monthly usage reset mechanism

#### **9.2 Usage Enforcement Middleware**

- **Integration**: Check limits before API calls
- **Upgrade Prompts**: When limits exceeded

### **STEP 10: Type Definitions Update**

**Status**: 🔄 **NEEDS UPDATE**

#### **10.1 Update Database Types**

- **File**: `src/types/database.ts`
- **Add**: Stripe-related interfaces for subscriptions, plans, webhook events

### **STEP 11: Error Handling & Security**

**Status**: ❌ **MISSING**

#### **11.1 Webhook Signature Verification**

- **Implementation**: Verify Stripe webhook signatures
- **Security**: Prevent webhook replay attacks

#### **11.2 Payment Error Boundaries**

- **Components**: Graceful payment failure handling
- **Retry Logic**: Failed payment recovery

## Priority Implementation Order

### **Phase 1 (Critical - App Currently Broken)**

1. Create plans table migration (fixes existing code failures)
2. Install Stripe packages
3. Add environment variables
4. Fix discovery.ts and transcript.ts plan references

### **Phase 2 (Core Payment Flow)**

1. Create checkout session API
2. Update select-plan page
3. Add webhook handler
4. Add success/cancel pages

### **Phase 3 (Management & Polish)**

1. Customer portal integration
2. Billing management dashboard
3. Usage tracking and limits
4. Error handling and security

## Files to Create/Modify

### **New Files**

- `database/migrations/010_restore_plans_table.sql`
- `src/app/api/stripe/create-checkout-session/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/stripe/create-portal-session/route.ts`
- `src/app/actions/stripe.ts`
- `src/app/payment/success/page.tsx`
- `src/app/payment/cancel/page.tsx`
- `src/app/dashboard/billing/page.tsx`

### **Files to Modify**

- `package.json` (add Stripe dependencies)
- `src/app/select-plan/page.tsx` (implement actual payment)
- `src/app/actions/discovery.ts` (fix plan references)
- `src/app/api/transcript/route.ts` (fix plan references)
- `src/middleware.ts` (add subscription validation)
- `src/lib/database.ts` (add Stripe methods)
- `src/types/database.ts` (add Stripe types)

## Detailed Implementation Specifications

### **Stripe Configuration**

Based on the existing plan structure in `select-plan/page.tsx`:

#### **Plan Configuration**

- **Inspiration Plan**: $24.99/month, $210/year

  - 100 profile discoveries/month
  - 20 profile follows
  - 100 transcript views/month

- **Growth Plan**: $49.99/month, $419.99/year

  - 300 profile discoveries/month
  - 50 profile follows
  - 300 transcript views/month

- **Enterprise Plan**: Custom pricing
  - Custom limits

#### **Database Schema Updates**

```sql
-- Plans table structure
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  stripe_price_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  monthly_price DECIMAL(10,2),
  yearly_price DECIMAL(10,2),
  limits JSONB NOT NULL DEFAULT '{
    "profile_discoveries": 0,
    "profile_follows": 0,
    "transcript_views": 0
  }',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add usage tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES plans(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_profile_discoveries INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_transcripts_viewed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_reset_date TIMESTAMPTZ DEFAULT NOW();
```

### **Critical Code Fixes**

#### **discovery.ts Fix**

Current broken code (lines 32-47):

```typescript
// Check user's plan and current follow count
const { data: userData } = await supabase
  .from("users")
  .select("plan_id")
  .eq("id", userId)
  .single();

if (!userData?.plan_id) {
  throw new Error("No active plan. Please select a plan to continue.");
}

// Get plan limits
const { data: planData } = await supabase
  .from("plans")
  .select("limits")
  .eq("id", userData.plan_id)
  .single();
```

**Fix Required**: Update to check subscription status and plan limits properly.

#### **Webhook Handler Structure**

```typescript
// src/app/api/stripe/webhook/route.ts
export async function POST(request: Request) {
  const sig = headers().get("stripe-signature")!;
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      // Update database with subscription status
      break;
  }

  return NextResponse.json({ received: true });
}
```

## Security Considerations

### **Environment Variables**

- Use test keys during development
- Implement proper key rotation
- Store webhook secrets securely

### **Webhook Security**

- Verify webhook signatures
- Implement idempotency using webhook_events table
- Rate limiting on webhook endpoints

### **Payment Security**

- Never store card details
- Use Stripe.js for PCI compliance
- Implement proper error handling

## Testing Strategy

### **Development Testing**

1. Use Stripe test mode
2. Stripe CLI for webhook testing
3. Test all subscription lifecycle events

### **Integration Testing**

1. Test checkout flow end-to-end
2. Verify webhook event handling
3. Test plan limit enforcement

## Conclusion

This plan addresses the current broken state (missing plans table) while building a complete Stripe integration that follows the existing architecture patterns and handles the three subscription plans defined in the select-plan page. The implementation should be done in phases to ensure the app is functional at each stage.

# Narra Codebase Cleanup Plan

## Overview

This document outlines a comprehensive cleanup plan for the Narra project based on senior software engineering analysis. The plan is organized by priority to ensure production readiness and code quality improvements.

**Total Estimated Time:** 29 hours  
**Critical Issues:** 12 files for immediate removal, 1 major component refactor  
**Risk Level:** High (production blockers present)

---

## 🔥 Phase 1: Production Blockers (High Priority)

**Estimated Time:** 2 hours  
**Status:** Not Started

### Task 1.1: Remove Test API Endpoints

**Time:** 30 minutes  
**Priority:** Critical  
**Risk:** Security & Performance

```bash
# Remove these files:
rm src/app/api/test-cache/route.ts
rm src/app/api/test-discovery/route.ts
rm src/app/api/test-scrapecreators/route.ts
rm src/app/api/test-tiktok-embed/route.ts
rm src/app/api/test-transcript/route.ts
```

**Reason:** Test endpoints expose internal API structure and external service integration details

### Task 1.2: Remove Development Pages

**Time:** 15 minutes  
**Priority:** Critical  
**Risk:** Production

```bash
# Remove entire development directory:
rm -rf src/app/(dev)
```

**Files being removed:**

- `test-auth/page.tsx`
- `test-colors/page.tsx`
- `test-database/page.tsx`
- `test-sync/page.tsx`
- `test-theme/page.tsx`
- `test-tiktok-embed/page.tsx`
- `test-ui/page.tsx`

### Task 1.3: Fix Missing API Route

**Time:** 30 minutes  
**Priority:** High  
**Risk:** Runtime Error

**Issue:** `/src/app/api/upload-thumbnail/` directory exists but no `route.ts` file  
**Action:** Either create proper implementation or remove directory

### Task 1.4: Consolidate Image Proxy Routes

**Time:** 1 hour  
**Priority:** High  
**Risk:** Code Duplication

**Issue:** Two duplicate implementations:

- `src/app/api/image-proxy/route.ts`
- `src/app/api/proxy-image/route.ts`

**Action:** Choose one implementation and remove duplicate

### Task 1.5: Fix Directory Typo

**Time:** 15 minutes  
**Priority:** Medium  
**Risk:** Organization

```bash
# Fix typo in screenshots directory
mv screesnhots screenshots
```

---

## ⚠️ Phase 2: Technical Debt (Medium Priority)

**Estimated Time:** 12 hours  
**Status:** Not Started

### Task 2.1: Refactor Massive Component

**Time:** 8 hours  
**Priority:** High  
**Risk:** Performance & Maintainability

**Issue:** `discovery-content.tsx.original` is 2,044 lines  
**Problems:**

- Violates single responsibility principle
- Difficult to maintain
- Poor performance
- Direct DOM manipulation in React

**Action Plan:**

1. Break into 10-15 smaller components
2. Implement proper state management
3. Remove direct DOM manipulation
4. Add proper error boundaries
5. Implement lazy loading

**Suggested Component Breakdown:**

- `DiscoveryHeader.tsx`
- `SearchFilters.tsx`
- `ProfileCard.tsx`
- `PostGrid.tsx`
- `PostModal.tsx`
- `TranscriptSection.tsx`
- `SavePostModal.tsx`

### Task 2.2: Improve Type Safety

**Time:** 4 hours  
**Priority:** Medium  
**Risk:** Development Velocity

**Issues:**

- Excessive `any` usage in discovery component
- Missing shared type definitions
- Inline interfaces that could be shared

**Actions:**

1. Replace all `any` types with proper interfaces
2. Create shared type definitions in `/src/types/`
3. Add proper generic constraints
4. Consolidate duplicate interfaces

---

## 🟡 Phase 3: Quality Improvements (Low Priority)

**Estimated Time:** 15 hours  
**Status:** Not Started

### Task 3.1: Add Security Headers

**Time:** 1 hour  
**Priority:** Medium  
**Risk:** Security

**Action:** Add security headers to `next.config.ts`:

```javascript
headers: async () => [
  {
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  },
];
```

### Task 3.2: Increase Test Coverage

**Time:** 12 hours  
**Priority:** Low  
**Risk:** Code Quality

**Current State:** Only 1 test file exists  
**Target:** Comprehensive testing coverage

**Actions:**

1. Add unit tests for all utilities (4 hours)
2. Add integration tests for API routes (4 hours)
3. Add component testing for critical flows (4 hours)

**Priority Test Areas:**

- `src/lib/utils/` - All utility functions
- `src/app/actions/` - All server actions
- `src/components/` - Critical user flows
- API routes for error handling

### Task 3.3: Clean Up Dependencies

**Time:** 30 minutes  
**Priority:** Low  
**Risk:** Bundle Size

**Unused Dependencies to Remove:**

```bash
npm uninstall react-transition-group tw-animate-css
```

### Task 3.4: Database Cleanup

**Time:** 30 minutes  
**Priority:** Low  
**Risk:** Organization

**Files to Remove:**

```bash
rm database/debug_instagram_posts.sql
rm database/schema_fix.sql
rm database/schema_fix_corrected.sql
```

### Task 3.5: Environment Variable Cleanup

**Time:** 1 hour  
**Priority:** Low  
**Risk:** Configuration

**Action:** Replace hardcoded Supabase domain in `next.config.ts` with environment variable

---

## 🚀 Implementation Strategy

### Week 1: Critical Fixes

- [ ] Complete Phase 1 (Production Blockers)
- [ ] Test deployment pipeline
- [ ] Verify all test endpoints removed

### Week 2: Major Refactoring

- [ ] Start Phase 2 (Technical Debt)
- [ ] Focus on component refactoring
- [ ] Improve type safety

### Week 3: Quality Improvements

- [ ] Complete Phase 3 (Quality Improvements)
- [ ] Add comprehensive testing
- [ ] Security hardening

---

## 📋 Validation Checklist

### Pre-Production Deployment

- [ ] All test API routes removed
- [ ] All development pages removed
- [ ] No console.log statements in production code
- [ ] No hardcoded API keys or sensitive data
- [ ] All TypeScript errors resolved
- [ ] Build process completes successfully

### Post-Cleanup Verification

- [ ] Bundle size reduced
- [ ] No runtime errors
- [ ] All features still functional
- [ ] Performance improvements measurable
- [ ] Type safety improved

---

## 🔧 Tools & Commands

### Useful Commands for Cleanup

```bash
# Find all test files
find src -name "*test*" -type f

# Find all console.log statements
grep -r "console.log" src/

# Find all 'any' type usage
grep -r ": any" src/

# Check bundle size
npm run build && npm run analyze

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Pre-commit Hooks Recommendation

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run type-check"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 📊 Success Metrics

### Before Cleanup

- **Bundle Size:** TBD (measure current)
- **TypeScript Errors:** TBD (count current)
- **Test Coverage:** ~5% (1 test file)
- **Performance Score:** TBD (lighthouse)

### After Cleanup Targets

- **Bundle Size:** 20% reduction
- **TypeScript Errors:** 0
- **Test Coverage:** 60%+
- **Performance Score:** 90+ lighthouse

---

## 🔄 Maintenance Plan

### Weekly Tasks

- [ ] Review for new test code in production builds
- [ ] Monitor bundle size changes
- [ ] Check for new TypeScript `any` usage

### Monthly Tasks

- [ ] Dependency security audit
- [ ] Performance monitoring review
- [ ] Code quality metrics review

### Quarterly Tasks

- [ ] Major dependency updates
- [ ] Architecture review
- [ ] Test coverage analysis

---

**Last Updated:** 2025-01-11  
**Next Review:** 2025-01-18  
**Responsible:** Development Team

# 🧪 Use Narra - Complete Testing Guide

## 🚀 **Testing Priority & Order**

Based on your project's current state (Phase 7 - Content Discovery), here's the **exact order** to test:

### **Priority 1: API Foundation (Critical)**

1. ✅ Environment variables setup
2. ✅ ScrapeCreators API connectivity
3. ✅ Response parsing and error handling
4. ✅ Rate limiting and caching

### **Priority 2: Core Functionality**

5. ✅ Instagram profile fetching
6. ✅ Instagram posts fetching
7. ✅ Search and filtering
8. ✅ Data persistence to database

### **Priority 3: UI Integration**

9. ✅ Discovery page rendering
10. ✅ Post grid display
11. ✅ Search functionality
12. ✅ Responsive design

---

## 🔧 **1. API Integration Testing (Start Here)**

### **A. Environment Setup Test**

Create `.env.local` first:

```bash
# Copy from ENVIRONMENT_SETUP.md
SCRAPECREATORS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### **B. API Connectivity Test**

```bash
# 1. Start your dev server
npm run dev

# 2. Test the API endpoint
curl -X GET "http://localhost:3000/api/test-scrapecreators" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "ScrapeCreators API is working",
  "data": { ... }
}
```

### **C. Direct API Testing Script**

Create `test-api.js` in your root directory:

```javascript
// Simple API test without Next.js complications
const https = require("https");

const SCRAPECREATORS_API_KEY = "your_api_key_here";
const BASE_URL = "https://api.scrapecreators.com/v1";

async function testInstagramProfile() {
  const testHandle = "instagram"; // Known public handle
  const endpoint = `/instagram/profile?handle=${testHandle}`;

  const options = {
    hostname: "api.scrapecreators.com",
    port: 443,
    path: endpoint,
    method: "GET",
    headers: {
      "x-api-key": SCRAPECREATORS_API_KEY,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          console.log("✅ API Response:", JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (e) {
          console.error("❌ Parse Error:", e);
          reject(e);
        }
      });
    });

    req.on("error", error => {
      console.error("❌ Request Error:", error);
      reject(error);
    });

    req.end();
  });
}

// Run the test
testInstagramProfile()
  .then(() => console.log("🎉 Test completed successfully"))
  .catch(error => console.error("💥 Test failed:", error));
```

**Run the test:**

```bash
node test-api.js
```

---

## 🎨 **2. UI Component Testing**

### **A. Manual Component Testing**

**Test each component individually:**

1. **SearchBar Component**

   - Navigate to `/dashboard/discovery`
   - Type in search box
   - Check autocomplete/suggestions
   - Test keyboard navigation (arrows, enter, escape)

2. **PostGrid Component**

   - Verify Pinterest-style layout
   - Check responsive design (mobile/desktop)
   - Test lazy loading
   - Verify hover states

3. **ProfileCard Component**
   - Check profile data display
   - Verify follow/unfollow buttons
   - Test mobile responsiveness

### **B. Automated Component Tests**

Install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

Create `__tests__/components/SearchBar.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '@/components/discovery/SearchBar';

describe('SearchBar Component', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={jest.fn()} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls onSearch when submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test_handle' } });
    fireEvent.submit(input.closest('form')!);

    expect(mockOnSearch).toHaveBeenCalledWith('test_handle');
  });
});
```

---

## 🔄 **3. Integration Testing**

### **A. Full Discovery Flow Test**

**Manual Test Steps:**

1. **Start Fresh Session**

   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

2. **Login Flow**

   - Click "Sign In" → Should redirect to Clerk
   - Complete authentication
   - Should redirect to `/dashboard`

3. **Discovery Page Test**

   - Navigate to Discovery tab (`/discovery`)
   - Search for: `instagram` (known handle)
   - Verify profile loads with correct data:
     - Profile picture
     - Handle (@instagram)
     - Follower count
     - Bio text

4. **Posts Loading Test**

   - After profile loads, check posts grid
   - Verify posts show:
     - Embed previews
     - Like/comment counts
     - Date posted
     - Caption preview

5. **Post Detail Test**
   - Click on any post
   - Verify modal opens with:
     - Embed player
     - Full caption
     - Metrics
     - Save button

### **B. Error Handling Test**

**Test these scenarios:**

1. **Invalid Handle**

   - Search for: `nonexistent_handle_12345`
   - Should show: "Profile not found" message

2. **Network Error Simulation**

   - Disconnect internet
   - Try searching
   - Should show: "Connection error" message

3. **Rate Limit Test**
   - Make 60+ requests quickly
   - Should show: "Rate limit exceeded" message

---

## 📱 **4. Device & Browser Testing**

### **A. Responsive Design Test**

**Test on these viewport sizes:**

- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1200px width

**Key areas to check:**

- Navigation menu (hamburger on mobile)
- Post grid layout (1 column → 2 columns → 3+ columns)
- Search bar positioning
- Modal/popup sizing

### **B. Browser Compatibility Test**

**Test on:**

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

---

## 💾 **5. Database Integration Testing**

### **A. Profile Storage Test**

```typescript
// Test script: test-database.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testProfileStorage() {
  const testProfile = {
    handle: "test_profile",
    platform: "instagram",
    followers: 1000,
    bio: "Test bio",
  };

  // Insert test profile
  const { data, error } = await supabase
    .from("profiles")
    .insert(testProfile)
    .select();

  if (error) {
    console.error("❌ Database insert failed:", error);
  } else {
    console.log("✅ Profile stored successfully:", data);
  }
}
```

### **B. Data Sync Test**

1. Search for a profile via API
2. Verify it's stored in database
3. Search again - should load from cache
4. Check timestamps are updated correctly

---

## 🏃‍♂️ **6. Performance Testing**

### **A. Load Time Test**

```bash
# Install lighthouse for performance testing
npm install -g lighthouse

# Run performance audit
lighthouse http://localhost:3000/dashboard/discovery --output=html --output-path=./lighthouse-report.html
```

**Target Scores:**

- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >80

### **B. API Response Time Test**

Monitor these metrics:

- Profile fetch: <2 seconds
- Posts fetch: <3 seconds
- Search response: <1 second
- Cache hit response: <100ms

---

## 🚨 **7. Error Handling Testing**

### **A. Network Errors**

Test these scenarios:

- Slow network (3G simulation)
- Intermittent connectivity
- Complete network failure
- Timeout scenarios

### **B. API Errors**

Test these error responses:

- 401 Unauthorized (invalid API key)
- 429 Too Many Requests (rate limit)
- 500 Server Error
- Invalid JSON response

---

## 📋 **Testing Checklist**

### **Pre-Launch Checklist**

- [ ] Environment variables properly set
- [ ] ScrapeCreators API connectivity confirmed
- [ ] Profile fetching working for 3+ different handles
- [ ] Post loading working with proper pagination
- [ ] Search functionality working with filters
- [ ] Error messages displaying correctly
- [ ] Responsive design working on mobile
- [ ] Database storage and retrieval working
- [ ] Rate limiting functioning properly
- [ ] Caching working (faster subsequent requests)
- [ ] Loading states displaying properly
- [ ] Authentication flow working end-to-end

### **Daily Testing Routine**

1. **Quick Smoke Test (5 minutes)**

   - Load discovery page
   - Search for one known handle
   - Verify posts load
   - Check one post detail

2. **Weekly Full Test (30 minutes)**
   - Run all automated tests
   - Test on mobile device
   - Test error scenarios
   - Check performance metrics

---

## 🔧 **Automated Testing Setup**

### **A. Install Testing Dependencies**

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  jest-environment-jsdom
```

### **B. Create Jest Configuration**

Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage"
  },
  "jest": {
    "testEnvironment": "jest-environment-jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"]
  }
}
```

### **C. Run Tests Before Each Commit**

```bash
# Add to your git hooks or run manually
npm run test
npm run build
npm run lint
```

---

## 🎯 **What to Test First (Your Next Steps)**

1. **RIGHT NOW**: Create `.env.local` with your actual ScrapeCreators API key
2. **STEP 1**: Run the direct API test script above
3. **STEP 2**: Test the `/api/test-scrapecreators` endpoint
4. **STEP 3**: Navigate to `/discovery` and test search
5. **STEP 4**: Test on mobile device
6. **STEP 5**: Run a profile search and verify database storage

**Expected Time:** 30 minutes for basic functionality testing

This gives you a complete testing strategy from API integration to UI testing, with both automated and manual approaches as you prefer! 🚀

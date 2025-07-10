# Following Page Optimization - Implementation Plan

## **PHASE 1: Database Foundation (Week 1)**

### **Goal**: Set up database schema to support batch processing

#### **Tasks:**

1. **Create `followed_posts` table**

   - Store daily fetched posts separate from saved posts
   - Include user_id, profile_id, embed_url, caption, metrics
   - Add unique constraint to prevent duplicates per user

2. **Modify `follows` table**

   - Add `last_refreshed` timestamp column
   - Track when each follow relationship was last updated

3. **Create performance indexes**
   - Index on followed_posts(user_id, date_posted) for fast retrieval
   - Index on follows(last_refreshed) for batch processing

**Success Criteria:**

- Database migration runs successfully
- Tables created with proper constraints
- Existing data preserved

---

## **PHASE 2: Edge Function Development (Week 1-2)**

### **Goal**: Build the daily batch processing system

#### **Tasks:**

1. **Create Supabase Edge Function**

   - Set up `refresh-followed-posts` function
   - Configure environment variables and API keys

2. **Implement core logic**

   - Query all follow relationships
   - Fetch posts from ScrapeCreators API
   - Transform and save posts to database
   - Update last_refreshed timestamps

3. **Add robust error handling**
   - Retry mechanism for failed API calls
   - Skip problematic creators without stopping entire process
   - Log detailed error information

**Success Criteria:**

- Function can process all follow relationships
- Posts are correctly saved and deduplicated
- Errors are handled gracefully

---

## **PHASE 3: Frontend Updates (Week 2)**

### **Goal**: Make Following page use database instead of live API calls

#### **Tasks:**

1. **Update Following page data fetching**

   - Remove real-time API calls
   - Query followed_posts table instead
   - Maintain existing UI components and layout

2. **Add user feedback elements**
   - "Last updated" timestamp display
   - Loading states for initial page load
   - Empty state handling

**Success Criteria:**

- Following page loads instantly (<200ms)
- All existing functionality preserved
- Users can see when content was last refreshed

---

## **PHASE 4: Scheduling Setup (Week 2)**

### **Goal**: Automate daily batch processing

#### **Tasks:**

1. **Configure Supabase cron job**

   - Schedule function to run at 5 AM daily
   - Set up proper authentication and permissions

2. **Test scheduling**
   - Verify function runs automatically
   - Confirm posts are updated daily
   - Monitor execution logs

**Success Criteria:**

- Cron job runs reliably every day at 5 AM
- Posts are refreshed without manual intervention
- System handles timezone correctly

---

## **PHASE 5: Monitoring & Maintenance (Week 3)**

### **Goal**: Ensure system reliability and performance

#### **Tasks:**

1. **Add comprehensive monitoring**

   - Track API usage and costs
   - Monitor function execution time
   - Log success/failure rates per creator

2. **Implement data cleanup**
   - Automatically remove posts older than 30 days
   - Clean up failed processing records
   - Optimize database performance

**Success Criteria:**

- Complete visibility into system performance
- Automatic maintenance keeps database optimized
- Cost tracking shows expected 90% savings

---

## **PHASE 6: Testing & Validation (Week 3)**

### **Goal**: Verify system works correctly with real users

#### **Tasks:**

1. **Gradual rollout**

   - Test with 10% of users initially
   - Monitor for any issues or edge cases
   - Collect user feedback

2. **Performance validation**
   - Measure actual load times vs targets
   - Verify cost savings in practice
   - Test edge cases (new users, heavy followers)

**Success Criteria:**

- Page load times consistently under 200ms
- No degradation in user experience
- Cost reduction meets 90% target

---

## **PHASE 7: Full Deployment (Week 4)**

### **Goal**: Roll out to all users

#### **Tasks:**

1. **Complete migration**

   - Enable optimization for all users
   - Remove old API calling code
   - Update documentation

2. **Final monitoring**
   - Track system-wide performance
   - Monitor for any scaling issues
   - Prepare support for any user questions

**Success Criteria:**

- All users experiencing optimized performance
- System handles full load without issues
- Documentation updated for maintenance

---

## **SUCCESS METRICS**

### **Performance Targets:**

- Following page load time: <200ms (vs 2-3 seconds)
- API cost reduction: 90% savings
- System uptime: 99.9%
- User satisfaction: No complaints about speed

### **Cost Targets:**

- Per user monthly cost: <$1 (vs $7.20)
- Total API calls: 1 per user per day (vs 10+ per day)
- Infrastructure cost: Minimal increase

### **User Experience:**

- Instant page loads
- Fresh content (updated daily)
- Clear "last updated" indicators
- No degradation in functionality

## **RISK MITIGATION**

### **Rollback Plan:**

- Keep existing API code as backup
- Feature flag to switch between systems
- Database rollback scripts ready

### **Monitoring Alerts:**

- Function execution failures
- API cost spikes
- Database performance issues
- User complaints

This plan transforms the Following page from an expensive, slow system into a fast, cost-effective solution while maintaining all existing functionality and improving user experience.

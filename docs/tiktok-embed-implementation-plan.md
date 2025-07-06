# TikTok Embed Implementation Plan

## Problem Statement
TikTok CDN URLs expire after some time, making saved TikTok posts unusable. Users see "Image could not be loaded" errors for older saved posts, breaking the core functionality of the platform.

## Solution Overview
Replace expired TikTok thumbnail/video URLs with dynamic TikTok embed generation using original post URLs. This provides:
- Never-expiring content (embeds don't expire)
- Better user experience (full TikTok player)
- Native TikTok functionality (comments, sharing, etc.)

## Implementation Strategy

### Phase 1: Database Schema Changes
**Goal**: Add field to store original TikTok URLs

**Changes Required**:
1. Add `original_url` column to `posts` table
   ```sql
   ALTER TABLE posts ADD COLUMN original_url TEXT;
   ```

2. Update TypeScript interfaces in `/src/types/database.ts`
   ```typescript
   export interface Post {
     // ... existing fields
     original_url?: string;  // New field for original TikTok post URL
   }
   ```

**Migration Strategy**:
- Add column as optional (nullable)
- New posts will have original URLs
- Existing posts will gradually get URLs during updates
- No breaking changes to existing functionality

### Phase 2: Backend Updates
**Goal**: Capture and store original TikTok URLs during post saving

**Files to Update**:
1. `/src/app/actions/posts.ts`
   - Modify `SavePostData` interface to include `originalUrl`
   - Update `savePostToBoard` action to store original URL
   - Ensure original URL is captured from scraping APIs

2. `/src/lib/database.ts`
   - Update `createPost` function to accept `original_url`
   - Modify post transformation logic
   - Update all post queries to select new field

**Data Flow Changes**:
```
Current: Scrape API → Store CDN URL → URL expires
New: Scrape API → Store original URL + CDN URL → Generate embed dynamically
```

### Phase 3: Frontend Updates (Minimal UI Changes)
**Goal**: Use TikTok embeds while maintaining existing UI design

**Files to Update**:
1. `/src/components/shared/post-card.tsx`
   - Add embed generation logic for TikTok posts
   - Maintain existing layout and styling
   - Keep fallback to current video/thumbnail display

**UI Changes (Minimal)**:
- Same card layout and dimensions
- Same hover effects and interactions
- Same modal trigger behavior
- Replace thumbnail/video content with TikTok embed player

**Display Logic**:
```typescript
// Pseudo-code for PostCard logic
if (post.platform === "tiktok" && post.original_url) {
  // Generate TikTok embed HTML
  const embedHtml = await getTikTokEmbed(post.original_url);
  // Render embed in same container
} else {
  // Keep existing thumbnail/video display
}
```

2. Post Modal Updates
   - Update `/src/app/boards/[id]/board-page-content.tsx`
   - Render TikTok embed in modal view
   - Maintain responsive design
   - Keep existing modal styling

### Phase 4: Clutter Removal
**Goal**: Remove unnecessary code related to TikTok URL expiration handling

**Code to Remove**:
1. Complex video/thumbnail switching logic in PostCard
2. TikTok-specific image proxy complications
3. Expiration handling attempts
4. Redundant fallback strategies

**Code to Keep**:
- Instagram functionality (works fine)
- Basic post structure and types
- Existing UI components and styling
- Error handling for failed embeds

### Phase 5: Testing & Validation
**Goal**: Ensure new system works reliably

**Testing Strategy**:
1. **New TikTok Posts**: Save new posts and verify embed generation
2. **Existing Posts**: Ensure backward compatibility
3. **Edge Cases**: Test with various TikTok URL formats
4. **Performance**: Verify embed loading doesn't slow down UI
5. **Responsive**: Test embeds across different screen sizes

## Technical Details

### TikTok Embed Generation
**Existing Infrastructure** (already working):
- `/src/lib/api/tiktok-embed.ts` - Complete embed utilities
- `/src/app/api/test-tiktok-embed/route.ts` - Working API endpoint
- Supports both oEmbed API and iframe fallback

**Integration Points**:
- Use existing `getTikTokEmbed()` function
- Leverage working API endpoint
- Implement caching for embed HTML (optional)

### Data Compatibility
**Backward Compatibility**:
- Posts without `original_url` continue to work with current display
- Gradual migration of existing posts
- No breaking changes to existing functionality

**Forward Compatibility**:
- New posts get better embed experience
- System ready for future TikTok API changes
- Extensible for other platforms

## Implementation Timeline

### Week 1: Database & Backend
- [ ] Add `original_url` column to posts table
- [ ] Update TypeScript interfaces
- [ ] Modify post saving logic
- [ ] Test new post creation with original URLs

### Week 2: Frontend Integration
- [ ] Update PostCard component for TikTok embeds
- [ ] Modify post modal rendering
- [ ] Implement fallback logic
- [ ] Test embed display and responsiveness

### Week 3: Cleanup & Testing
- [ ] Remove unnecessary TikTok-specific code
- [ ] Comprehensive testing across devices
- [ ] Performance optimization
- [ ] Edge case handling

### Week 4: Production & Monitoring
- [ ] Deploy to production
- [ ] Monitor embed generation success rates
- [ ] Collect user feedback
- [ ] Performance monitoring

## Success Metrics

### Functional Success
- [ ] New TikTok posts save with original URLs
- [ ] Embeds generate successfully (>95% success rate)
- [ ] No "Image could not be loaded" errors for new posts
- [ ] Existing posts continue to work

### User Experience Success
- [ ] Maintained UI consistency (approved design unchanged)
- [ ] Improved content experience (full TikTok player)
- [ ] No performance degradation
- [ ] Responsive across all devices

### Technical Success
- [ ] Reduced code complexity (clutter removal)
- [ ] Backward compatibility maintained
- [ ] No database migration issues
- [ ] Reliable embed generation

## Risk Mitigation

### Technical Risks
1. **TikTok API Changes**: Use fallback iframe method
2. **Performance Issues**: Implement embed caching
3. **Responsive Issues**: Test across devices thoroughly
4. **Data Migration**: Gradual rollout with fallbacks

### User Experience Risks
1. **UI Inconsistency**: Maintain exact same styling
2. **Loading Performance**: Lazy load embeds
3. **Error States**: Graceful fallbacks to current display
4. **Accessibility**: Ensure embeds are accessible

## Rollback Plan
If issues occur:
1. Database column can remain unused (no harm)
2. Frontend can fall back to current display logic
3. New posts will still save successfully
4. No data loss or corruption risk

## Future Enhancements
- Caching embed HTML for performance
- Analytics on embed engagement
- Support for other social media embed improvements
- Automated migration of existing posts
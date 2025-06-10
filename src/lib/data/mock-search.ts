export interface SearchSuggestion {
  id: string;
  type: "creator" | "hashtag" | "trending";
  value: string;
  description?: string;
  platform?: "instagram" | "tiktok";
}

export const MOCK_SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  // Popular Creators
  {
    id: "1",
    type: "creator",
    value: "@charlidamelio",
    description: "104.5M followers • Dance & Lifestyle",
    platform: "tiktok",
  },
  {
    id: "2",
    type: "creator",
    value: "@therock",
    description: "347M followers • Actor & Fitness",
    platform: "instagram",
  },
  {
    id: "3",
    type: "creator",
    value: "@mrbeast",
    description: "59.2M followers • Challenges & Giveaways",
    platform: "tiktok",
  },
  {
    id: "4",
    type: "creator",
    value: "@selenagomez",
    description: "425M followers • Music & Beauty",
    platform: "instagram",
  },
  {
    id: "5",
    type: "creator",
    value: "@zachking",
    description: "69.8M followers • Magic & Illusions",
    platform: "tiktok",
  },
  {
    id: "6",
    type: "creator",
    value: "@kyliejenner",
    description: "396M followers • Beauty & Lifestyle",
    platform: "instagram",
  },

  // Trending Hashtags
  {
    id: "7",
    type: "hashtag",
    value: "#fyp",
    description: "2.1B posts • For You Page",
  },
  {
    id: "8",
    type: "hashtag",
    value: "#viral",
    description: "847M posts • Trending content",
  },
  {
    id: "9",
    type: "hashtag",
    value: "#aesthetic",
    description: "432M posts • Lifestyle & Design",
  },
  {
    id: "10",
    type: "hashtag",
    value: "#smallbusiness",
    description: "89M posts • Entrepreneurship",
  },
  {
    id: "11",
    type: "hashtag",
    value: "#fitness",
    description: "567M posts • Health & Wellness",
  },
  {
    id: "12",
    type: "hashtag",
    value: "#cooking",
    description: "234M posts • Food & Recipes",
  },

  // Trending Topics
  {
    id: "13",
    type: "trending",
    value: "AI Content Creation",
    description: "Hot topic • 45K mentions this week",
  },
  {
    id: "14",
    type: "trending",
    value: "Sustainability Tips",
    description: "Growing trend • 23K mentions this week",
  },
  {
    id: "15",
    type: "trending",
    value: "Remote Work Setup",
    description: "Popular topic • 67K mentions this week",
  },
  {
    id: "16",
    type: "trending",
    value: "Mental Health Awareness",
    description: "Trending • 89K mentions this week",
  },
  {
    id: "17",
    type: "trending",
    value: "DIY Home Projects",
    description: "Rising trend • 34K mentions this week",
  },
  {
    id: "18",
    type: "trending",
    value: "Plant-Based Recipes",
    description: "Hot topic • 56K mentions this week",
  },
];

// Search result categories
export const SEARCH_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Creators", value: "creators" },
  { label: "Hashtags", value: "hashtags" },
  { label: "Trending", value: "trending" },
];

// Recent searches (would be stored in localStorage/database)
export const MOCK_RECENT_SEARCHES: SearchSuggestion[] = [
  {
    id: "recent1",
    type: "creator",
    value: "@garyvee",
    description: "Recent search",
    platform: "instagram",
  },
  {
    id: "recent2",
    type: "hashtag",
    value: "#marketing",
    description: "Recent search",
  },
  {
    id: "recent3",
    type: "trending",
    value: "Content Strategy",
    description: "Recent search",
  },
];

// Filter search suggestions based on query
export function filterSuggestions(
  query: string,
  limit: number = 8
): SearchSuggestion[] {
  if (!query.trim()) {
    return MOCK_RECENT_SEARCHES.slice(0, limit);
  }

  const filtered = MOCK_SEARCH_SUGGESTIONS.filter(
    suggestion =>
      suggestion.value.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Sort by relevance (exact matches first)
  const sorted = filtered.sort((a, b) => {
    const aStartsWith = a.value.toLowerCase().startsWith(query.toLowerCase());
    const bStartsWith = b.value.toLowerCase().startsWith(query.toLowerCase());

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });

  return sorted.slice(0, limit);
}

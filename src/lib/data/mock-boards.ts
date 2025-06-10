import type { Board } from "@/types/content";

export const mockBoards: Board[] = [
  {
    id: "1",
    name: "Marketing Inspiration",
    description:
      "Creative marketing campaigns and content that caught my attention. Perfect examples of storytelling and brand engagement.",
    folderId: "marketing",
    postCount: 47,
    isPublic: true,
    publicId: "mkt-inspiration-abc123",
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-12-14"),
  },
  {
    id: "2",
    name: "Design Trends 2024",
    description:
      "Latest design trends, color palettes, and visual inspiration for upcoming projects.",
    folderId: "design",
    postCount: 89,
    isPublic: false,
    createdAt: new Date("2024-10-22"),
    updatedAt: new Date("2024-12-13"),
  },
  {
    id: "3",
    name: "TikTok Growth Tactics",
    description:
      "Viral content strategies and growth hacks from successful TikTok creators. Studying what works in 2024.",
    folderId: "social-media",
    postCount: 156,
    isPublic: true,
    publicId: "tiktok-growth-xyz789",
    createdAt: new Date("2024-09-08"),
    updatedAt: new Date("2024-12-12"),
  },
  {
    id: "4",
    name: "Brand Storytelling",
    description:
      "Compelling brand stories and emotional marketing that creates genuine connections with audiences.",
    folderId: "marketing",
    postCount: 34,
    isPublic: false,
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-11"),
  },
  {
    id: "5",
    name: "Content Creator Tools",
    description:
      "Must-have tools, apps, and resources for content creators. From editing software to productivity hacks.",
    folderId: "tools",
    postCount: 23,
    isPublic: true,
    publicId: "creator-tools-def456",
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-12-10"),
  },
  {
    id: "6",
    name: "Instagram Reels Ideas",
    description:
      "Creative concepts and formats for Instagram Reels that drive engagement and reach.",
    folderId: "social-media",
    postCount: 67,
    isPublic: false,
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-12-09"),
  },
  {
    id: "7",
    name: "Startup Marketing",
    description:
      "Bootstrapped marketing strategies and growth tactics for early-stage startups with limited budgets.",
    folderId: "startup",
    postCount: 78,
    isPublic: true,
    publicId: "startup-marketing-ghi789",
    createdAt: new Date("2024-08-20"),
    updatedAt: new Date("2024-12-08"),
  },
  {
    id: "8",
    name: "UI/UX Inspiration",
    description:
      "Beautiful interface designs, user experience patterns, and interaction design examples.",
    folderId: "design",
    postCount: 124,
    isPublic: false,
    createdAt: new Date("2024-07-12"),
    updatedAt: new Date("2024-12-07"),
  },
  {
    id: "9",
    name: "Personal Branding",
    description:
      "How creators and entrepreneurs build authentic personal brands that stand out in crowded markets.",
    folderId: "personal",
    postCount: 45,
    isPublic: true,
    publicId: "personal-brand-jkl012",
    createdAt: new Date("2024-09-30"),
    updatedAt: new Date("2024-12-06"),
  },
  {
    id: "10",
    name: "Video Editing Techniques",
    description:
      "Advanced editing techniques, transitions, and effects that make content more engaging and professional.",
    folderId: "tools",
    postCount: 91,
    isPublic: false,
    createdAt: new Date("2024-06-18"),
    updatedAt: new Date("2024-12-05"),
  },
];

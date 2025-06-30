import { render, screen } from "@testing-library/react";

import type { SavedPost } from "@/types/board";

import { PostGrid } from "../PostGrid";

// Mock PostCard component
jest.mock("../PostCard", () => ({
  PostCard: ({ post }: { post: SavedPost }) => (
    <div data-testid={`post-card-${post.id}`}>{post.caption}</div>
  ),
}));

const mockPosts: SavedPost[] = [
  {
    id: "post-1",
    platform: "tiktok" as const,
    embedUrl: "https://tiktok.com/embed/1",
    caption: "TikTok post 1",
    thumbnail: "https://example.com/thumb1.jpg",
    metrics: { views: 1000, likes: 100, comments: 10, shares: 5 },
    datePosted: "2024-01-15T10:30:00Z",
    isCarousel: false,
    profile: {
      handle: "user1",
      displayName: "User 1",
      avatarUrl: "https://example.com/avatar1.jpg",
      verified: false,
    },
  },
  {
    id: "post-2",
    platform: "instagram" as const,
    embedUrl: "https://instagram.com/embed/2",
    caption: "Instagram post 2",
    thumbnail: "https://example.com/thumb2.jpg",
    metrics: { views: 2000, likes: 200, comments: 20, shares: 10 },
    datePosted: "2024-01-10T10:30:00Z",
    isCarousel: false,
    profile: {
      handle: "user2",
      displayName: "User 2",
      avatarUrl: "https://example.com/avatar2.jpg",
      verified: true,
    },
  },
];

const defaultProps = {
  posts: mockPosts,
  isLoading: false,
  isSharedView: false,
  activeFilter: "all",
  onPostClick: jest.fn(),
  onRemovePost: jest.fn(),
  getCarouselIndex: jest.fn(() => 0),
  onCarouselNext: jest.fn(),
  onCarouselPrev: jest.fn(),
};

describe("PostGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all posts when filter is "all"', () => {
    render(<PostGrid {...defaultProps} />);

    expect(screen.getByTestId("post-card-post-1")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-post-2")).toBeInTheDocument();
    expect(screen.getByText("TikTok post 1")).toBeInTheDocument();
    expect(screen.getByText("Instagram post 2")).toBeInTheDocument();
  });

  it('filters TikTok posts when filter is "tiktok"', () => {
    render(<PostGrid {...defaultProps} activeFilter="tiktok" />);

    expect(screen.getByTestId("post-card-post-1")).toBeInTheDocument();
    expect(screen.queryByTestId("post-card-post-2")).not.toBeInTheDocument();
  });

  it('filters Instagram posts when filter is "instagram"', () => {
    render(<PostGrid {...defaultProps} activeFilter="instagram" />);

    expect(screen.queryByTestId("post-card-post-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("post-card-post-2")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(<PostGrid {...defaultProps} isLoading={true} />);

    const skeletons = screen.getAllByRole("status", { name: "Loading post" });
    expect(skeletons).toHaveLength(8);
  });

  it("shows empty state when no posts match filter", () => {
    render(<PostGrid {...defaultProps} posts={[]} />);

    expect(screen.getByText("No posts found")).toBeInTheDocument();
    expect(
      screen.getByText(/This board doesn't have any posts yet/)
    ).toBeInTheDocument();
  });

  it("shows correct empty message for different filters", () => {
    render(<PostGrid {...defaultProps} posts={[]} activeFilter="tiktok" />);

    expect(screen.getByText("No posts found")).toBeInTheDocument();
    expect(
      screen.getByText("No tiktok posts found in this board.")
    ).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<PostGrid {...defaultProps} />);

    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("aria-label", "2 posts in all filter");
  });
});

import { render, screen } from "@testing-library/react";

import type { SavedPost } from "@/types/board";

import { PostCard } from "../PostCard";

// Simple mock data for testing
const mockPost: SavedPost = {
  id: "test-post-1",
  platform: "tiktok" as const,
  embedUrl: "https://www.tiktok.com/embed/123",
  caption: "Test caption for TikTok video",
  thumbnail: "https://example.com/thumbnail.jpg",
  metrics: {
    views: 1500000,
    likes: 50000,
    comments: 2500,
    shares: 1200,
  },
  datePosted: "2024-01-15T10:30:00Z",
  isCarousel: false,
  profile: {
    handle: "testuser",
    displayName: "Test User",
    avatarUrl: "https://example.com/avatar.jpg",
    verified: true,
  },
};

const defaultProps = {
  post: mockPost,
  isSharedView: false,
  onPostClick: jest.fn(),
  onRemovePost: jest.fn(),
  getCarouselIndex: jest.fn(() => 0),
  onCarouselNext: jest.fn(),
  onCarouselPrev: jest.fn(),
};

describe("PostCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders post card component", () => {
    render(<PostCard {...defaultProps} />);

    // Just check that the component renders without crashing
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("displays post caption", () => {
    render(<PostCard {...defaultProps} />);

    expect(
      screen.getByText("Test caption for TikTok video")
    ).toBeInTheDocument();
  });

  it("displays profile information", () => {
    render(<PostCard {...defaultProps} />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("does not show remove button in shared view", () => {
    render(<PostCard {...defaultProps} isSharedView={true} />);

    expect(
      screen.queryByLabelText("Remove post from board")
    ).not.toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";

import type { SavedPost } from "@/types/board";

import { PostModal } from "../PostModal";

const mockPost: SavedPost = {
  id: "test-post-1",
  platform: "tiktok" as const,
  embedUrl: "https://www.tiktok.com/embed/123",
  caption: "Test TikTok video caption",
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
  selectedPost: mockPost,
  activeTab: "overview" as const,
  transcript: null,
  isLoadingTranscript: false,
  transcriptError: null,
  onTabChange: jest.fn(),
  onCopyTranscript: jest.fn(),
  onClose: jest.fn(),
};

describe("PostModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when selectedPost is null", () => {
    render(<PostModal {...defaultProps} selectedPost={null} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal with post details", () => {
    render(<PostModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Post Details")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("shows TikTok iframe for TikTok posts", () => {
    render(<PostModal {...defaultProps} />);

    const iframe = screen.getByTitle("TikTok video by Test User");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://www.tiktok.com/embed/123");
  });

  it("shows verified badge for verified profiles", () => {
    render(<PostModal {...defaultProps} />);

    const verifiedBadge = screen.getByTitle("Verified account");
    expect(verifiedBadge).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<PostModal {...defaultProps} />);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      "modal-title"
    );
  });
});

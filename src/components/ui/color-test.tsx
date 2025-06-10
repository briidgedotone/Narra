"use client";

import { useState } from "react";

import { BoardCard, type BoardData } from "./board-card";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ConfirmDialog } from "./confirm-dialog";
import { ErrorMessage } from "./error-message";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSubmit,
  FormErrorSummary,
  useNarraForm,
  contactFormSchema,
  profileSearchSchema,
  boardCreateSchema,
  type ContactFormData,
  type ProfileSearchData,
  type BoardCreateData,
} from "./form";
import { Loading } from "./loading";
import { Modal } from "./modal";
import { PostGrid, type PostGridItem } from "./post-grid";
import { ProfileCard, ProfileAvatar, type ProfileData } from "./profile-card";
import {
  SearchBar,
  FilterPanel,
  SearchResultsHeader,
  type SearchFilters,
  type SearchSuggestion,
} from "./search-filter";

export function ColorTest() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form examples
  const contactForm = useNarraForm(contactFormSchema, {
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const searchForm = useNarraForm(profileSearchSchema, {
    handle: "",
  });

  const boardForm = useNarraForm(boardCreateSchema, {
    name: "",
    description: "",
    folderId: undefined,
  });

  const handleContactSubmit = (data: ContactFormData) => {
    console.log("Contact form submitted:", data);
    // Simulate API call
    setTimeout(() => {
      alert("Message sent successfully!");
      contactForm.reset();
    }, 1000);
  };

  const handleSearchSubmit = (data: ProfileSearchData) => {
    console.log("Search form submitted:", data);
    // Simulate search
    setTimeout(() => {
      alert(`Searching for ${data.handle} on ${data.platform}`);
      searchForm.reset();
    }, 1000);
  };

  const handleBoardSubmit = (data: BoardCreateData) => {
    console.log("Board form submitted:", data);
    // Simulate board creation
    setTimeout(() => {
      alert(`Board "${data.name}" created successfully!`);
      boardForm.reset();
    }, 1000);
  };

  // Mock data for specialized components
  const mockPosts: PostGridItem[] = [
    {
      id: "1",
      embedUrl: "https://example.com/post1",
      thumbnail: "https://picsum.photos/300/400?random=1",
      platform: "tiktok",
      metrics: { likes: 1200, comments: 45, views: 5400 },
      datePosted: "2024-01-15",
      aspectRatio: 9 / 16,
    },
    {
      id: "2",
      embedUrl: "https://example.com/post2",
      thumbnail: "https://picsum.photos/300/500?random=2",
      platform: "instagram",
      metrics: { likes: 890, comments: 23 },
      datePosted: "2024-01-14",
      aspectRatio: 4 / 5,
    },
    {
      id: "3",
      embedUrl: "https://example.com/post3",
      thumbnail: "https://picsum.photos/300/350?random=3",
      platform: "tiktok",
      metrics: { likes: 2100, comments: 87, views: 12000 },
      datePosted: "2024-01-13",
      aspectRatio: 9 / 16,
    },
    {
      id: "4",
      embedUrl: "https://example.com/post4",
      thumbnail: "https://picsum.photos/300/450?random=4",
      platform: "instagram",
      metrics: { likes: 654, comments: 12 },
      datePosted: "2024-01-12",
      aspectRatio: 1 / 1,
    },
  ];

  const mockProfiles: ProfileData[] = [
    {
      id: "1",
      handle: "@creativecoder",
      displayName: "Creative Coder",
      bio: "Building amazing digital experiences • Tech content creator • React & TypeScript enthusiast",
      avatar: "https://picsum.photos/100/100?random=10",
      platform: "tiktok",
      metrics: { followers: 12500, following: 450, posts: 89 },
      verified: true,
      isFollowing: false,
    },
    {
      id: "2",
      handle: "@designguru",
      displayName: "Design Guru",
      bio: "UI/UX Designer sharing design tips and inspiration",
      avatar: "https://picsum.photos/100/100?random=11",
      platform: "instagram",
      metrics: { followers: 8900, following: 230, posts: 156 },
      verified: false,
      isFollowing: true,
    },
    {
      id: "3",
      handle: "@techreviewer",
      displayName: "Tech Reviewer",
      bio: "Honest tech reviews and tutorials for everyone",
      platform: "tiktok",
      metrics: { followers: 45600, following: 120, posts: 234 },
      verified: true,
      isFollowing: false,
    },
  ];

  const mockBoards: BoardData[] = [
    {
      id: "1",
      name: "Tech Inspiration",
      description:
        "Amazing tech content and coding tutorials from top creators",
      postCount: 24,
      isPublic: true,
      previewPosts: [
        {
          id: "1",
          thumbnail: "https://picsum.photos/150/200?random=20",
          platform: "tiktok",
        },
        {
          id: "2",
          thumbnail: "https://picsum.photos/150/200?random=21",
          platform: "instagram",
        },
        {
          id: "3",
          thumbnail: "https://picsum.photos/150/200?random=22",
          platform: "tiktok",
        },
        {
          id: "4",
          thumbnail: "https://picsum.photos/150/200?random=23",
          platform: "instagram",
        },
      ],
      createdAt: "2024-01-10",
      updatedAt: "2024-01-15",
      folderId: "work",
      folderName: "Work Projects",
    },
    {
      id: "2",
      name: "Design Trends",
      description: "Latest UI/UX design trends and inspiration",
      postCount: 18,
      isPublic: false,
      previewPosts: [
        {
          id: "5",
          thumbnail: "https://picsum.photos/150/200?random=24",
          platform: "instagram",
        },
        {
          id: "6",
          thumbnail: "https://picsum.photos/150/200?random=25",
          platform: "tiktok",
        },
      ],
      createdAt: "2024-01-08",
      updatedAt: "2024-01-14",
      folderId: "personal",
      folderName: "Personal",
    },
    {
      id: "3",
      name: "Marketing Ideas",
      description: "Creative marketing campaigns and strategies",
      postCount: 31,
      isPublic: true,
      previewPosts: [
        {
          id: "7",
          thumbnail: "https://picsum.photos/150/200?random=26",
          platform: "tiktok",
        },
        {
          id: "8",
          thumbnail: "https://picsum.photos/150/200?random=27",
          platform: "instagram",
        },
        {
          id: "9",
          thumbnail: "https://picsum.photos/150/200?random=28",
          platform: "tiktok",
        },
      ],
      createdAt: "2024-01-05",
      updatedAt: "2024-01-13",
    },
  ];

  const mockSuggestions: SearchSuggestion[] = [
    { id: "1", text: "@creativecoder", type: "handle", count: 12500 },
    { id: "2", text: "@designguru", type: "handle", count: 8900 },
    { id: "3", text: "#webdev", type: "hashtag", count: 45600 },
    { id: "4", text: "#uidesign", type: "hashtag", count: 23400 },
    { id: "5", text: "react tutorial", type: "keyword", count: 1200 },
    { id: "6", text: "figma tips", type: "keyword", count: 890 },
  ];

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({
    query: "",
    platform: "all",
    dateRange: "all",
    sortBy: "recent",
  });

  return (
    <div className="content-spacing">
      <Card>
        <CardHeader>
          <CardTitle>Use Narra Design System Test</CardTitle>
        </CardHeader>
        <CardContent className="content-spacing">
          {/* Primary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Primary (Purple/Violet)</h3>
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <div className="w-16 h-16 bg-primary rounded-md"></div>
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Secondary (Blue)</h3>
            <div className="flex gap-2">
              <Button variant="secondary">Secondary Button</Button>
              <div className="w-16 h-16 bg-secondary rounded-md"></div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Accent (Yellow/Orange)</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                SCHEDULED
              </div>
              <div className="w-16 h-16 bg-accent rounded-md"></div>
            </div>
          </div>

          {/* Typography System */}
          <div className="space-y-2">
            <h3 className="font-semibold">Typography System</h3>
            <div className="p-4 bg-muted rounded-md space-y-3">
              <h1>Heading 1 - Main Titles</h1>
              <h2>Heading 2 - Section Titles</h2>
              <h3>Heading 3 - Subsections</h3>
              <h4>Heading 4 - Small Headers</h4>
              <p>
                Regular paragraph text with proper line height and spacing for
                comfortable reading.
              </p>
              <p className="text-small">Small text for secondary information</p>
              <p className="text-caption">Caption text for labels</p>
            </div>
          </div>

          {/* Spacing System */}
          <div className="space-y-2">
            <h3 className="font-semibold">Spacing & Layout System</h3>
            <div className="bg-muted rounded-md card-spacing">
              <h4>Card Spacing Example</h4>
              <p className="text-small">
                This card uses the card-spacing utility for consistent padding.
              </p>
            </div>
            <div className="bg-muted rounded-md p-4">
              <div className="content-spacing">
                <h4>Content Spacing Example</h4>
                <p className="text-small">
                  Multiple items with content-spacing utility.
                </p>
                <p className="text-small">
                  Creates consistent vertical rhythm.
                </p>
              </div>
            </div>
          </div>

          {/* Loading & Error States */}
          <div className="space-y-2">
            <h3 className="font-semibold">Loading & Error Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-md p-4">
                <h4 className="mb-2">Loading State</h4>
                <div className="bg-background rounded-md">
                  <Loading size="sm" text="Loading data..." />
                </div>
              </div>
              <div className="bg-muted rounded-md p-4">
                <h4 className="mb-2">Error State</h4>
                <div className="bg-background rounded-md">
                  <ErrorMessage
                    title="Test Error"
                    message="This is a sample error message"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Form Components with Validation</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Form Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form form={contactForm} onSubmit={handleContactSubmit}>
                    <FormErrorSummary />
                    <FormInput
                      name="name"
                      label="Your Name"
                      placeholder="Enter your full name"
                      required
                    />
                    <FormInput
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                    <FormInput
                      name="subject"
                      label="Subject"
                      placeholder="What is this about?"
                      required
                    />
                    <FormTextarea
                      name="message"
                      label="Message"
                      placeholder="Tell us more..."
                      rows={4}
                      required
                    />
                    <FormSubmit>Send Message</FormSubmit>
                  </Form>
                </CardContent>
              </Card>

              {/* Profile Search Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form form={searchForm} onSubmit={handleSearchSubmit}>
                    <FormErrorSummary />
                    <FormSelect
                      name="platform"
                      label="Platform"
                      placeholder="Select platform..."
                      options={[
                        { value: "tiktok", label: "TikTok" },
                        { value: "instagram", label: "Instagram" },
                      ]}
                      required
                    />
                    <FormInput
                      name="handle"
                      label="Profile Handle"
                      placeholder="@username or profile link"
                      description="Enter the username or paste the profile URL"
                      required
                    />
                    <FormSubmit>Search Profile</FormSubmit>
                  </Form>
                </CardContent>
              </Card>

              {/* Board Creation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form form={boardForm} onSubmit={handleBoardSubmit}>
                    <FormErrorSummary />
                    <FormInput
                      name="name"
                      label="Board Name"
                      placeholder="My awesome board"
                      required
                    />
                    <FormTextarea
                      name="description"
                      label="Description"
                      placeholder="Describe what this board is for..."
                      rows={3}
                    />
                    <FormSelect
                      name="folderId"
                      label="Folder"
                      placeholder="Select folder (optional)..."
                      options={[
                        { value: "work", label: "Work Projects" },
                        { value: "personal", label: "Personal" },
                        { value: "inspiration", label: "Inspiration" },
                      ]}
                    />
                    <FormSubmit>Create Board</FormSubmit>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Modal & Dialog Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Modal & Dialog Components</h3>
            <div className="flex gap-2">
              <Modal
                trigger={<Button variant="outline">Open Modal</Button>}
                title="Example Modal"
                description="This is a sample modal dialog"
              >
                <div className="space-y-4">
                  <p>
                    This is the modal content area. You can put any content
                    here.
                  </p>
                  <div className="flex justify-end">
                    <Button>Done</Button>
                  </div>
                </div>
              </Modal>

              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Delete Action
              </Button>
            </div>
          </div>

          {/* Background Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Background & Text</h3>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-foreground">
                Primary text on muted background
              </p>
              <p className="text-muted-foreground">Secondary text color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          // Handle delete action
          console.log("Item deleted");
        }}
      />

      {/* Phase 4.3: Specialized Components */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Phase 4.3: Specialized Components
          </CardTitle>
          <p className="text-muted-foreground">
            Content-specific UI components for Use Narra
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Pinterest-style Post Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Pinterest-style Post Grid</h3>
            <PostGrid
              posts={mockPosts}
              onPostClick={post => alert(`Clicked post: ${post.id}`)}
              onSavePost={post => alert(`Saved post: ${post.id}`)}
              className="max-w-4xl"
            />
          </div>

          {/* Loading Post Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Loading State</h3>
            <PostGrid posts={[]} loading={true} className="max-w-4xl" />
          </div>

          {/* Profile Cards */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Profile Cards</h3>

            {/* Default Profile Cards */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Default Variant</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
                {mockProfiles.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onFollow={profile => alert(`Followed: ${profile.handle}`)}
                    onUnfollow={profile =>
                      alert(`Unfollowed: ${profile.handle}`)
                    }
                    onViewProfile={profile =>
                      alert(`View profile: ${profile.handle}`)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Compact Profile Cards */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Compact Variant</h4>
              <div className="space-y-2 max-w-md">
                {mockProfiles.map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    variant="compact"
                    onFollow={profile => alert(`Followed: ${profile.handle}`)}
                    onUnfollow={profile =>
                      alert(`Unfollowed: ${profile.handle}`)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Profile Avatars */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Profile Avatars</h4>
              <div className="flex items-center space-x-6">
                {mockProfiles.map(profile => (
                  <div key={profile.id} className="text-center space-y-2">
                    <ProfileAvatar profile={profile} size="lg" />
                    <p className="text-sm text-muted-foreground">
                      {profile.handle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Board Cards */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Board Cards</h3>

            {/* Default Board Cards */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Default Variant</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
                {mockBoards.map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onViewBoard={board => alert(`View board: ${board.name}`)}
                    onEditBoard={board => alert(`Edit board: ${board.name}`)}
                    onShareBoard={board => alert(`Share board: ${board.name}`)}
                    onDeleteBoard={board =>
                      alert(`Delete board: ${board.name}`)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Compact Board Cards */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Compact Variant</h4>
              <div className="space-y-2 max-w-md">
                {mockBoards.map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    variant="compact"
                    onViewBoard={board => alert(`View board: ${board.name}`)}
                    onEditBoard={board => alert(`Edit board: ${board.name}`)}
                    onShareBoard={board => alert(`Share board: ${board.name}`)}
                    onDeleteBoard={board =>
                      alert(`Delete board: ${board.name}`)
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Search and Filter Components */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">
              Search & Filter Components
            </h3>

            {/* Search Bar */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">
                Search Bar with Suggestions
              </h4>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={query => alert(`Searching for: ${query}`)}
                suggestions={mockSuggestions}
                className="max-w-lg"
              />
            </div>

            {/* Filter Panel */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Filter Panel</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <FilterPanel
                    filters={searchFilters}
                    onChange={setSearchFilters}
                    onReset={() =>
                      setSearchFilters({
                        query: "",
                        platform: "all",
                        dateRange: "all",
                        sortBy: "recent",
                      })
                    }
                  />
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-muted rounded-lg p-4">
                    <h5 className="font-medium mb-2">Current Filters:</h5>
                    <pre className="text-sm text-muted-foreground">
                      {JSON.stringify(searchFilters, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results Header */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium">Search Results Header</h4>
              <SearchResultsHeader
                query={searchQuery || "example search"}
                totalResults={1234}
                filters={searchFilters}
                onFiltersChange={setSearchFilters}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

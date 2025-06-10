"use client";

import { useState } from "react";

import { BoardCard } from "@/components/shared/board-card";
import { FilterChips } from "@/components/shared/filter-chips";
import {
  FilterPanel,
  type FilterState,
} from "@/components/shared/filter-panel";
import { PostCard } from "@/components/shared/post-card";
import {
  PostGrid,
  DiscoveryGrid,
  FollowingGrid,
  CollectionsGrid,
  BoardGrid,
} from "@/components/shared/post-grid";
import { ProfileCard } from "@/components/shared/profile-card";
import {
  SearchBar,
  type SearchSuggestion,
} from "@/components/shared/search-bar";
import { mockBoards } from "@/lib/data/mock-boards";
import { mockPosts } from "@/lib/data/mock-posts";
import { mockProfiles } from "@/lib/data/mock-profiles";
import { filterSuggestions } from "@/lib/data/mock-search";

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

export function ColorTest() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    customDateRange: { start: null, end: null },
    engagement: null,
    sortBy: "latest",
    platform: "all" as const,
  });

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

  // Search & Filter Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
    alert(`Searching for: ${query}`);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    console.log("Selected suggestion:", suggestion);
    alert(`Selected: ${suggestion.value} (${suggestion.type})`);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log("Filters changed:", newFilters);
  };

  const handleRemoveFilter = (filterType: keyof FilterState) => {
    const newFilters = { ...filters };
    switch (filterType) {
      case "dateRange":
        newFilters.dateRange = null;
        break;
      case "platform":
        newFilters.platform = "all";
        break;
      case "sortBy":
        newFilters.sortBy = "latest";
        break;
      case "engagement":
        newFilters.engagement = null;
        break;
    }
    setFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setFilters({
      dateRange: null,
      customDateRange: { start: null, end: null },
      engagement: null,
      sortBy: "latest",
      platform: "all",
    });
  };

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

              {/* Profile Search Form Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form form={searchForm} onSubmit={handleSearchSubmit}>
                    <FormErrorSummary />
                    <FormInput
                      name="handle"
                      label="Creator Handle"
                      placeholder="@username"
                      required
                    />
                    <FormSelect
                      name="platform"
                      label="Platform"
                      placeholder="Select platform"
                      options={[
                        { value: "instagram", label: "Instagram" },
                        { value: "tiktok", label: "TikTok" },
                      ]}
                      required
                    />
                    <FormSubmit>Search Profile</FormSubmit>
                  </Form>
                </CardContent>
              </Card>

              {/* Board Creation Form Example */}
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
                      placeholder="My Awesome Board"
                      required
                    />
                    <FormTextarea
                      name="description"
                      label="Description"
                      placeholder="What's this board about?"
                    />
                    <FormSelect
                      name="folderId"
                      label="Folder (Optional)"
                      placeholder="Select a folder"
                      options={[
                        { value: "1", label: "Marketing Campaigns" },
                        { value: "2", label: "Design Inspiration" },
                        { value: "3", label: "Content Ideas" },
                      ]}
                    />
                    <FormSubmit>Create Board</FormSubmit>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search & Filter Components */}
          <div className="space-y-4">
            <h3 className="font-semibold">Search & Filter Components</h3>

            {/* Search Bar */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Search Bar with Autocomplete
              </h4>
              <div className="max-w-2xl">
                <SearchBar
                  onSearch={handleSearch}
                  onSuggestionSelect={handleSuggestionSelect}
                  suggestions={filterSuggestions(searchQuery)}
                  placeholder="Search creators, hashtags, or paste profile links..."
                />
              </div>
            </div>

            {/* Filter Panel - Collapsed State */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Filter Panel (Collapsed)
              </h4>
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleClearAllFilters}
                isCollapsed={true}
                onToggleCollapse={() =>
                  setFilterPanelCollapsed(!filterPanelCollapsed)
                }
              />
            </div>

            {/* Filter Panel - Expanded State */}
            {!filterPanelCollapsed && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Filter Panel (Expanded)
                </h4>
                <div className="max-w-md">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleClearAllFilters}
                    isCollapsed={false}
                    onToggleCollapse={() => setFilterPanelCollapsed(true)}
                  />
                </div>
              </div>
            )}

            {/* Filter Chips */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Active Filter Chips
              </h4>
              <FilterChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
              {Object.values(filters).every(
                value => value === null || value === "all" || value === "latest"
              ) && (
                <p className="text-sm text-muted-foreground italic">
                  No active filters. Use the filter panel above to add some
                  filters.
                </p>
              )}
            </div>

            {/* Complete Search Interface Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Complete Search Interface
              </h4>
              <div className="p-6 bg-muted rounded-lg space-y-4">
                <SearchBar
                  onSearch={handleSearch}
                  onSuggestionSelect={handleSuggestionSelect}
                  suggestions={filterSuggestions(searchQuery)}
                />
                <FilterChips
                  filters={filters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={handleClearAllFilters}
                />
                <div className="flex justify-between items-start">
                  <div className="text-sm text-muted-foreground">
                    {searchQuery
                      ? `Showing results for "${searchQuery}"`
                      : "Enter a search term to see results"}
                  </div>
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleClearAllFilters}
                    isCollapsed={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Post Card Component */}
          <div className="space-y-2">
            <h3 className="font-semibold">Post Card Component</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockPosts.slice(0, 4).map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onSave={post =>
                    alert(`Saved post: ${post.caption?.slice(0, 30)}...`)
                  }
                  onViewDetails={post =>
                    alert(`View details for: ${post.profile.handle}`)
                  }
                />
              ))}
            </div>
          </div>

          {/* Profile Card Component */}
          <div className="space-y-4">
            <h3 className="font-semibold">Profile Card Component</h3>

            {/* Discovery Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Discovery Variant (Full Profile Cards)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mockProfiles.slice(0, 4).map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    variant="discovery"
                    onFollow={profile => alert(`Followed: @${profile.handle}`)}
                    onUnfollow={profile =>
                      alert(`Unfollowed: @${profile.handle}`)
                    }
                    onViewProfile={profile =>
                      alert(`View profile: @${profile.handle}`)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Following Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Following Variant (Management View)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProfiles
                  .filter(p => p.isFollowed)
                  .map(profile => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      variant="following"
                      onUnfollow={profile =>
                        alert(`Unfollowed: @${profile.handle}`)
                      }
                    />
                  ))}
              </div>
            </div>

            {/* Compact Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Compact Variant (List View)
              </h4>
              <div className="space-y-2 max-w-md">
                {mockProfiles.slice(0, 5).map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    variant="compact"
                    onFollow={profile => alert(`Followed: @${profile.handle}`)}
                    onUnfollow={profile =>
                      alert(`Unfollowed: @${profile.handle}`)
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Board Card Component */}
          <div className="space-y-4">
            <h3 className="font-semibold">Board Card Component</h3>

            {/* Grid Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Grid Variant (Default Collection View)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mockBoards.slice(0, 4).map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    variant="grid"
                    onView={board => alert(`View board: ${board.name}`)}
                    onShare={board => alert(`Share board: ${board.name}`)}
                    onEdit={board => alert(`Edit board: ${board.name}`)}
                    onDelete={board => alert(`Delete board: ${board.name}`)}
                  />
                ))}
              </div>
            </div>

            {/* List Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                List Variant (Management View)
              </h4>
              <div className="space-y-2 max-w-4xl">
                {mockBoards.slice(4, 8).map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    variant="list"
                    onView={board => alert(`View board: ${board.name}`)}
                    onShare={board => alert(`Share board: ${board.name}`)}
                    onEdit={board => alert(`Edit board: ${board.name}`)}
                    onDelete={board => alert(`Delete board: ${board.name}`)}
                  />
                ))}
              </div>
            </div>

            {/* Compact Variant */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Compact Variant (Sidebar/Dropdown)
              </h4>
              <div className="space-y-2 max-w-md">
                {mockBoards.slice(8, 10).map(board => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    variant="compact"
                    onView={board => alert(`View board: ${board.name}`)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pinterest Grid Component */}
          <div className="space-y-4">
            <h3 className="font-semibold">Pinterest Grid Component</h3>

            {/* Discovery Grid Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Discovery Grid (Up to 5 columns)
              </h4>
              <DiscoveryGrid
                posts={mockPosts.slice(0, 8)}
                onSavePost={post => alert(`Saved: ${post.profile.handle}`)}
                onViewPostDetails={post =>
                  alert(`View: ${post.profile.handle}`)
                }
                showLoadMore={true}
                onLoadMore={() => alert("Loading more posts...")}
              />
            </div>

            {/* Following Grid Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Following Grid (Up to 4 columns)
              </h4>
              <FollowingGrid
                posts={mockPosts.slice(2, 8)}
                onSavePost={post => alert(`Saved: ${post.profile.handle}`)}
                onViewPostDetails={post =>
                  alert(`View: ${post.profile.handle}`)
                }
              />
            </div>

            {/* Collections Grid Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Collections Grid (Up to 4 columns)
              </h4>
              <CollectionsGrid
                posts={mockPosts.slice(4, 10)}
                onSavePost={post => alert(`Saved: ${post.profile.handle}`)}
                onViewPostDetails={post =>
                  alert(`View: ${post.profile.handle}`)
                }
              />
            </div>

            {/* Board Grid Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Board Grid (Up to 3 columns)
              </h4>
              <BoardGrid
                posts={mockPosts.slice(6, 12)}
                onSavePost={post => alert(`Saved: ${post.profile.handle}`)}
                onViewPostDetails={post =>
                  alert(`View: ${post.profile.handle}`)
                }
              />
            </div>

            {/* Empty State Example */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Empty State
              </h4>
              <PostGrid
                posts={[]}
                variant="discovery"
                className="border rounded-lg p-4"
              />
            </div>
          </div>

          {/* Modal & Dialog Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Modal & Dialog Components</h3>
            <div className="flex gap-2">
              <Modal
                trigger={<Button variant="outline">Open Modal</Button>}
                title="Example Modal"
                description="This is an example modal with content."
              >
                <div className="space-y-4">
                  <p>
                    This is the modal content. You can put forms, images, or any
                    other content here.
                  </p>
                  <p>
                    Modals are great for focused interactions without leaving
                    the current page.
                  </p>
                </div>
              </Modal>

              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                Open Confirm Dialog
              </Button>

              <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirm Action"
                description="Are you sure you want to perform this action? This cannot be undone."
                onConfirm={() => {
                  alert("Action confirmed!");
                  setConfirmOpen(false);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Search and Filter Types
export interface SearchFilters {
  query: string;
  platform: "all" | "tiktok" | "instagram";
  dateRange: "all" | "today" | "week" | "month" | "year";
  sortBy: "recent" | "popular" | "oldest";
  minLikes?: number;
  minComments?: number;
  verified?: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: "handle" | "hashtag" | "keyword";
  count?: number;
}

// Main Search Component
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search profiles, hashtags, or keywords...",
  suggestions = [],
  loading = false,
  className,
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const filteredSuggestions = suggestions.filter(
    s => s.text.toLowerCase().includes(value.toLowerCase()) && s.text !== value
  );

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={placeholder}
            className="pl-10 pr-20"
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!value.trim() || loading}
              className="h-7"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <button
              key={suggestion.id}
              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center space-x-2">
                <SuggestionIcon type={suggestion.type} />
                <span className="text-sm">{suggestion.text}</span>
              </div>
              {suggestion.count && (
                <span className="text-xs text-muted-foreground">
                  {suggestion.count.toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Filter Panel Component
interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  className?: string;
  collapsed?: boolean;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  className,
  collapsed = false,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.platform !== "all" ||
      filters.dateRange !== "all" ||
      filters.sortBy !== "recent" ||
      filters.minLikes ||
      filters.minComments ||
      filters.verified
    );
  }, [filters]);

  return (
    <div
      className={cn("bg-background border border-border rounded-lg", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Filters</h3>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Platform Filter */}
          <div className="space-y-2">
            <Label>Platform</Label>
            <FormSelect
              value={filters.platform}
              onValueChange={value =>
                updateFilter("platform", value as SearchFilters["platform"])
              }
              options={[
                { value: "all", label: "All Platforms" },
                { value: "tiktok", label: "TikTok" },
                { value: "instagram", label: "Instagram" },
              ]}
            />
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <FormSelect
              value={filters.dateRange}
              onValueChange={value =>
                updateFilter("dateRange", value as SearchFilters["dateRange"])
              }
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
              ]}
            />
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <FormSelect
              value={filters.sortBy}
              onValueChange={value =>
                updateFilter("sortBy", value as SearchFilters["sortBy"])
              }
              options={[
                { value: "recent", label: "Most Recent" },
                { value: "popular", label: "Most Popular" },
                { value: "oldest", label: "Oldest First" },
              ]}
            />
          </div>

          {/* Engagement Filters */}
          <div className="space-y-3">
            <Label>Minimum Engagement</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Likes</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minLikes || ""}
                  onChange={e =>
                    updateFilter(
                      "minLikes",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  min="0"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Comments</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minComments || ""}
                  onChange={e =>
                    updateFilter(
                      "minComments",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Verified Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={filters.verified || false}
              onChange={e =>
                updateFilter("verified", e.target.checked || undefined)
              }
              className="rounded border-border"
            />
            <Label htmlFor="verified" className="text-sm">
              Verified accounts only
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick Filters Component
interface QuickFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  className?: string;
}

export function QuickFilters({
  filters,
  onChange,
  className,
}: QuickFiltersProps) {
  const quickFilters = [
    { key: "platform", value: "tiktok", label: "TikTok" },
    { key: "platform", value: "instagram", label: "Instagram" },
    { key: "dateRange", value: "week", label: "This Week" },
    { key: "dateRange", value: "month", label: "This Month" },
    { key: "sortBy", value: "popular", label: "Popular" },
    { key: "verified", value: true, label: "Verified" },
  ];

  const toggleFilter = (key: keyof SearchFilters, value: any) => {
    const currentValue = filters[key];
    const newValue =
      currentValue === value
        ? key === "platform"
          ? "all"
          : key === "dateRange"
            ? "all"
            : key === "sortBy"
              ? "recent"
              : undefined
        : value;
    onChange({ ...filters, [key]: newValue });
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {quickFilters.map((filter, index) => {
        const isActive =
          filters[filter.key as keyof SearchFilters] === filter.value;
        return (
          <Button
            key={index}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() =>
              toggleFilter(filter.key as keyof SearchFilters, filter.value)
            }
            className="h-8"
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}

// Search Results Header Component
interface SearchResultsHeaderProps {
  query: string;
  totalResults: number;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function SearchResultsHeader({
  query,
  totalResults,
  filters,
  onFiltersChange,
  className,
}: SearchResultsHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {query ? `Results for "${query}"` : "All Results"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalResults.toLocaleString()} results found
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Sort:</Label>
          <FormSelect
            value={filters.sortBy}
            onValueChange={value =>
              onFiltersChange({
                ...filters,
                sortBy: value as SearchFilters["sortBy"],
              })
            }
            options={[
              { value: "recent", label: "Most Recent" },
              { value: "popular", label: "Most Popular" },
              { value: "oldest", label: "Oldest First" },
            ]}
          />
        </div>
      </div>

      {/* Quick Filters */}
      <QuickFilters filters={filters} onChange={onFiltersChange} />
    </div>
  );
}

// Suggestion Icon Component
function SuggestionIcon({ type }: { type: SearchSuggestion["type"] }) {
  switch (type) {
    case "handle":
      return <UserIcon className="w-3 h-3 text-muted-foreground" />;
    case "hashtag":
      return <HashIcon className="w-3 h-3 text-muted-foreground" />;
    case "keyword":
      return <SearchIcon className="w-3 h-3 text-muted-foreground" />;
    default:
      return <SearchIcon className="w-3 h-3 text-muted-foreground" />;
  }
}

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const HashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-4 h-4", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
);

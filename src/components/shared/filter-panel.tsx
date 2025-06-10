"use client";

import {
  Filter,
  Calendar,
  TrendingUp,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRange {
  label: string;
  value: number; // days
}

interface SortOption {
  label: string;
  value: string;
}

interface EngagementFilter {
  minLikes: number;
  maxLikes: number;
  minComments: number;
  maxComments: number;
}

interface FilterState {
  dateRange: number | null; // days
  customDateRange: { start: Date | null; end: Date | null };
  engagement: EngagementFilter | null;
  sortBy: string;
  platform: "all" | "instagram" | "tiktok";
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DATE_RANGES: DateRange[] = [
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
  { label: "Last 90 days", value: 90 },
  { label: "Last 180 days", value: 180 },
  { label: "Last year", value: 365 },
];

const SORT_OPTIONS: SortOption[] = [
  { label: "Latest", value: "latest" },
  { label: "Most viewed", value: "most_viewed" },
  { label: "Most liked", value: "most_liked" },
  { label: "Most commented", value: "most_commented" },
  { label: "Best engagement", value: "best_engagement" },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  onReset,
  className,
  isCollapsed = false,
  onToggleCollapse,
}: FilterPanelProps) {
  const [showEngagementFilter, setShowEngagementFilter] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleEngagementChange = (updates: Partial<EngagementFilter>) => {
    const currentEngagement = filters.engagement || {
      minLikes: 0,
      maxLikes: 1000000,
      minComments: 0,
      maxComments: 100000,
    };

    updateFilters({
      engagement: { ...currentEngagement, ...updates },
    });
  };

  const clearEngagementFilter = () => {
    updateFilters({ engagement: null });
    setShowEngagementFilter(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== null) count++;
    if (filters.engagement !== null) count++;
    if (filters.platform !== "all") count++;
    if (filters.sortBy !== "latest") count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  if (isCollapsed) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="outline"
          onClick={onToggleCollapse}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </Button>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-lg border p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center space-x-2">
          <TrendingUp className="w-3 h-3" />
          <span>Sort by</span>
        </label>
        <select
          value={filters.sortBy}
          onChange={e => updateFilters({ sortBy: e.target.value })}
          className="w-full p-2 bg-background border border-input rounded-md text-sm"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Platform</label>
        <div className="flex space-x-2">
          {[
            { label: "All", value: "all" as const },
            { label: "📸 Instagram", value: "instagram" as const },
            { label: "🎵 TikTok", value: "tiktok" as const },
          ].map(platform => (
            <Button
              key={platform.value}
              variant={
                filters.platform === platform.value ? "default" : "outline"
              }
              size="sm"
              onClick={() => updateFilters({ platform: platform.value })}
              className="text-xs"
            >
              {platform.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center space-x-2">
          <Calendar className="w-3 h-3" />
          <span>Date range</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DATE_RANGES.map(range => (
            <Button
              key={range.value}
              variant={
                filters.dateRange === range.value ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                updateFilters({
                  dateRange:
                    filters.dateRange === range.value ? null : range.value,
                })
              }
              className="text-xs"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Engagement Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center space-x-2">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Engagement</span>
          </label>
          {filters.engagement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearEngagementFilter}
              className="h-6 text-xs text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {!showEngagementFilter && !filters.engagement ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEngagementFilter(true)}
            className="w-full text-xs"
          >
            Add engagement filters
          </Button>
        ) : (
          <div className="space-y-3 p-3 bg-muted rounded-md">
            {/* Likes Range */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Likes</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.engagement?.minLikes || ""}
                  onChange={e =>
                    handleEngagementChange({
                      minLikes: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 p-1 text-xs bg-background border border-input rounded"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.engagement?.maxLikes || ""}
                  onChange={e =>
                    handleEngagementChange({
                      maxLikes: parseInt(e.target.value) || 1000000,
                    })
                  }
                  className="flex-1 p-1 text-xs bg-background border border-input rounded"
                />
              </div>
            </div>

            {/* Comments Range */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Comments</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.engagement?.minComments || ""}
                  onChange={e =>
                    handleEngagementChange({
                      minComments: parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1 p-1 text-xs bg-background border border-input rounded"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.engagement?.maxComments || ""}
                  onChange={e =>
                    handleEngagementChange({
                      maxComments: parseInt(e.target.value) || 100000,
                    })
                  }
                  className="flex-1 p-1 text-xs bg-background border border-input rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export types for use in other components
export type { FilterState, EngagementFilter, DateRange, SortOption };

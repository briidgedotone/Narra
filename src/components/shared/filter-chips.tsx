"use client";

import { X, Calendar, TrendingUp, Hash, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatMetric } from "@/lib/utils/format";

import type { FilterState } from "./filter-panel";

interface FilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (filterType: keyof FilterState) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterChipsProps) {
  const getActiveFilters = () => {
    const active: Array<{
      type: keyof FilterState;
      label: string;
      icon: React.ReactNode;
    }> = [];

    // Date range filter
    if (filters.dateRange !== null) {
      const days = filters.dateRange;
      let label = "Custom date range";

      if (days === 30) label = "Last 30 days";
      else if (days === 60) label = "Last 60 days";
      else if (days === 90) label = "Last 90 days";
      else if (days === 180) label = "Last 180 days";
      else if (days === 365) label = "Last year";

      active.push({
        type: "dateRange",
        label,
        icon: <Calendar className="w-3 h-3" />,
      });
    }

    // Platform filter
    if (filters.platform !== "all") {
      const platformLabels = {
        instagram: "📸 Instagram",
        tiktok: "🎵 TikTok",
      };

      active.push({
        type: "platform",
        label: platformLabels[filters.platform],
        icon: <Hash className="w-3 h-3" />,
      });
    }

    // Sort filter (if not default)
    if (filters.sortBy !== "latest") {
      const sortLabels = {
        most_viewed: "Most viewed",
        most_liked: "Most liked",
        most_commented: "Most commented",
        best_engagement: "Best engagement",
      };

      active.push({
        type: "sortBy",
        label:
          sortLabels[filters.sortBy as keyof typeof sortLabels] ||
          filters.sortBy,
        icon: <TrendingUp className="w-3 h-3" />,
      });
    }

    // Engagement filter
    if (filters.engagement) {
      const eng = filters.engagement;
      const parts: string[] = [];

      if (eng.minLikes > 0 || eng.maxLikes < 1000000) {
        if (eng.minLikes > 0 && eng.maxLikes < 1000000) {
          parts.push(
            `${formatMetric(eng.minLikes)}-${formatMetric(eng.maxLikes)} likes`
          );
        } else if (eng.minLikes > 0) {
          parts.push(`${formatMetric(eng.minLikes)}+ likes`);
        } else {
          parts.push(`<${formatMetric(eng.maxLikes)} likes`);
        }
      }

      if (eng.minComments > 0 || eng.maxComments < 100000) {
        if (eng.minComments > 0 && eng.maxComments < 100000) {
          parts.push(
            `${formatMetric(eng.minComments)}-${formatMetric(eng.maxComments)} comments`
          );
        } else if (eng.minComments > 0) {
          parts.push(`${formatMetric(eng.minComments)}+ comments`);
        } else {
          parts.push(`<${formatMetric(eng.maxComments)} comments`);
        }
      }

      if (parts.length > 0) {
        active.push({
          type: "engagement",
          label: parts.join(", "),
          icon: <TrendingUp className="w-3 h-3" />,
        });
      }
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Active Filter Chips */}
      {activeFilters.map(filter => (
        <div
          key={filter.type}
          className="flex items-center space-x-1 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-sm"
        >
          {filter.icon}
          <span className="truncate">{filter.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(filter.type)}
            className="h-4 w-4 p-0 hover:bg-primary/20"
          >
            <X className="w-2 h-2" />
          </Button>
        </div>
      ))}

      {/* Clear All Button */}
      {activeFilters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          <Filter className="w-3 h-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}

"use client";

import { Search, X, TrendingUp, Hash, AtSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import type { SearchSuggestion } from "@/lib/data/mock-search";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  placeholder = "Search creators, hashtags, or paste profile links...",
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  isLoading = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.value.toLowerCase().includes(query.toLowerCase())
  );

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
          handleSuggestionSelect(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get icon for suggestion type
  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "creator":
        return <AtSign className="w-4 h-4 text-muted-foreground" />;
      case "hashtag":
        return <Hash className="w-4 h-4 text-muted-foreground" />;
      case "trending":
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-20 py-3 bg-background border border-input rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "placeholder:text-muted-foreground"
          )}
        />

        {/* Clear and Search Buttons */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!query.trim() || isLoading}
            className="h-8 px-3 text-xs"
          >
            {isLoading ? "..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted",
                "focus:outline-none focus:bg-muted",
                selectedIndex === index && "bg-muted"
              )}
            >
              {getSuggestionIcon(suggestion.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{suggestion.value}</span>
                  {suggestion.platform && (
                    <span className="text-xs text-muted-foreground">
                      {suggestion.platform === "instagram" ? "📸" : "🎵"}
                    </span>
                  )}
                </div>
                {suggestion.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {suggestion.description}
                  </p>
                )}
              </div>
              {suggestion.type === "trending" && (
                <TrendingUp className="w-3 h-3 text-orange-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export types for external use
export type { SearchSuggestion };

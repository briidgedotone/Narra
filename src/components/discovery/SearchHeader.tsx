"use client";

import { Search01Icon } from "hugeicons-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Platform } from "@/types/discovery";

interface SearchHeaderProps {
  searchQuery: string;
  selectedPlatform: Platform;
  onSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SearchHeader({
  searchQuery,
  selectedPlatform,
  onSearchQueryChange,
  onSearch,
  onKeyDown,
}: SearchHeaderProps) {
  return (
    <div className="relative flex items-center">
      <h1 className="text-base font-semibold text-[#171717]">
        Discover Content
      </h1>

      {/* Search Bar - Centered on entire screen */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="relative w-[600px]">
          <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              selectedPlatform === "instagram"
                ? "Search Instagram creators (e.g., @mrbeast, @cristiano)"
                : "Search TikTok creators (e.g., @iamsydneythomas, @khaby.lame)"
            }
            value={searchQuery}
            onChange={onSearchQueryChange}
            onKeyDown={onKeyDown}
            className="pl-10 w-[600px] h-[36px] bg-[#F3F3F3] border-[#DBDBDB] shadow-none text-[#707070] placeholder:text-[#707070]"
          />
          {searchQuery.trim() && (
            <Button
              onClick={() => onSearch(searchQuery.trim())}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-3 text-xs bg-[#2463EB] hover:bg-[#2463EB]/90"
            >
              Search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

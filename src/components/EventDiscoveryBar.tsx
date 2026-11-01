/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

interface EventDiscoveryBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  totalResults: number;
  onResetFilters: () => void;
}

export const EventDiscoveryBar: React.FC<EventDiscoveryBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedMode,
  onModeChange,
  selectedCategory,
  onCategoryChange,
  categories,
  totalResults,
  onResetFilters
}) => {
  const isFiltered = Boolean(searchQuery) || selectedMode !== 'all' || selectedCategory !== 'all';

  return (
    <div id="events-section" className="pt-6 pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </div>
          <input
            aria-label="Search events"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, colleges, cities..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000] text-xs sm:text-sm font-bold text-black placeholder-neutral-500 focus:outline-none focus:bg-[#FFFDF5]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-black"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filter events by participation mode"
            value={selectedMode}
            onChange={(e) => onModeChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-black focus:outline-none cursor-pointer"
          >
            <option value="all">All Modes (Online &amp; Offline)</option>
            <option value="Online">Online Events</option>
            <option value="Offline">Offline Events</option>
            <option value="Hybrid">Hybrid Events</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            aria-label="Filter events by category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-black focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs font-bold text-black">
        <span className="font-mono">
          {totalResults} {totalResults === 1 ? 'event' : 'events'} found
        </span>

        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-black hover:underline cursor-pointer font-bold"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

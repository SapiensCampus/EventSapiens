/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, RotateCcw } from 'lucide-react';
import type { EventItem } from '../types/event';
import { EventCard } from './EventCard';
import { filterEvents, groupEventsByMonth } from '../lib/event-utils';

interface PastEventsPageProps {
  archivedEvents: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onBackToHome: () => void;
  referenceDateStr?: string;
}

export const PastEventsPage: React.FC<PastEventsPageProps> = ({
  archivedEvents,
  onSelectEvent,
  onBackToHome,
  referenceDateStr
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    archivedEvents.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return Array.from(set).sort();
  }, [archivedEvents]);

  const filtered = useMemo(() => {
    return filterEvents(
      archivedEvents,
      searchQuery,
      selectedMode,
      selectedCategory,
      'all',
      referenceDateStr
    );
  }, [archivedEvents, searchQuery, selectedMode, selectedCategory, referenceDateStr]);

  const monthGroups = useMemo(() => {
    return groupEventsByMonth(filtered, referenceDateStr, 'desc');
  }, [filtered, referenceDateStr]);

  const isFiltered = Boolean(searchQuery) || selectedMode !== 'all' || selectedCategory !== 'all';

  const handleReset = () => {
    setSearchQuery('');
    setSelectedMode('all');
    setSelectedCategory('all');
  };

  return (
    <div className="py-8 bg-[#FFF8DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-[2.5px] border-black">
          <div>
            <div className="inline-block border-[1.5px] border-black bg-[#BAE6FD] px-2.5 py-0.5 text-xs font-mono font-black uppercase text-black mb-3 shadow-[1.5px_1.5px_0px_#000]">
              PAST EVENTS &amp; MEETUPS
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              See our meetups so far.
            </h1>

            <p className="mt-2 text-sm text-neutral-700 font-medium max-w-2xl">
              Every month students assemble across campuses to learn, share project demos, and network.
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Active Events</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-6">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <input
              aria-label="Search past events"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past events by name, college, city..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000] text-xs sm:text-sm font-bold text-black outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-black"
                aria-label="Clear past event search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter past events by participation mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000] text-xs font-bold text-black outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter past events by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000] text-xs font-bold text-black outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 text-xs font-bold text-black">
          <span className="font-mono">
            {filtered.length} {filtered.length === 1 ? 'past event' : 'past events'} found
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-10">
            {monthGroups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center justify-between border-b-[2px] border-black pb-2 mb-5">
                  <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                    {group.label}
                  </h2>
                  <span className="font-mono text-xs font-bold text-neutral-600">
                    {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSelectEvent={onSelectEvent}
                      referenceDateStr={referenceDateStr}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-[2.5px] border-black bg-white p-12 text-center my-6 shadow-[4px_4px_0px_#000]">
            <h3 className="text-lg font-black text-black">No past events match filters</h3>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

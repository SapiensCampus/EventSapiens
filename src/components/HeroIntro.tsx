/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  Zap,
  Users,
  Cpu,
  BookOpen,
  Music,
} from "lucide-react";

interface HeroIntroProps {
  onExploreClick: () => void;
  onSearch?: (query: string, city?: string) => void;
  onSelectCategory?: (category: string) => void;
  initialSearchQuery?: string;
  leftIllustrationSlot?: React.ReactNode;
  rightIllustrationSlot?: React.ReactNode;
}

const POPULAR_CHIPS = [
  { label: "Hackathons", icon: Zap, query: "Hackathon" },
  { label: "Workshops", icon: Users, query: "Workshop" },
  { label: "Tech Fests", icon: Cpu, query: "Tech Fest" },
  { label: "Symposiums", icon: BookOpen, query: "Symposium" },
  { label: "Cultural", icon: Music, query: "Cultural" },
];

const CITIES = [
  "Tamil Nadu",
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Vellore",
  "Tirunelveli",
  "Erode",
];

export const HeroIntro: React.FC<HeroIntroProps> = ({
  onExploreClick,
  onSearch,
  onSelectCategory,
  initialSearchQuery = "",
  leftIllustrationSlot,
  rightIllustrationSlot,
}) => {
  const [query, setQuery] = useState(initialSearchQuery);
  const [selectedCity, setSelectedCity] = useState("Tamil Nadu");

  useEffect(() => {
    setQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, selectedCity === "Tamil Nadu" ? undefined : selectedCity);
    } else {
      onExploreClick();
    }
  };

  const handleChipClick = (chipQuery: string) => {
    if (onSelectCategory) {
      onSelectCategory(chipQuery);
    } else if (onSearch) {
      onSearch(chipQuery);
    } else {
      onExploreClick();
    }
  };

  return (
    <section className="relative bg-[#FFF8DC] pt-8 pb-14 sm:pb-20 overflow-hidden select-none min-h-[580px] lg:min-h-[640px] flex items-center justify-center">
      {/* ================= Left Illustration (Temple Gopuram) ================= */}
      {leftIllustrationSlot ? (
        leftIllustrationSlot
      ) : (
        <div className="hidden lg:flex items-center justify-start absolute left-0 top-1/2 -translate-x-[25%] -translate-y-1/2 pointer-events-none select-none z-10 w-[300px] lg:w-[350px] xl:w-[420px] 2xl:w-[480px]">
          <img
            src={`${import.meta.env.BASE_URL}assets/images/left%20image.png`}
            alt="Tamil Nadu Heritage Temple Gopuram"
            className="w-full h-auto object-contain max-h-[500px] lg:max-h-[550px] xl:max-h-[620px] 2xl:max-h-[680px]"
            loading="eager"
          />
        </div>
      )}

      {/* ================= Right Illustration (Thiruvalluvar Statue) ================= */}
      {rightIllustrationSlot ? (
        rightIllustrationSlot
      ) : (
        <div className="hidden lg:flex items-center justify-end absolute right-0 top-1/2 translate-x-[25%] -translate-y-1/2 pointer-events-none select-none z-10 w-[300px] lg:w-[350px] xl:w-[420px] 2xl:w-[480px]">
          <img
            src={`${import.meta.env.BASE_URL}assets/images/right%20image.png`}
            alt="Thiruvalluvar Statue"
            className="w-full h-auto object-contain max-h-[500px] lg:max-h-[550px] xl:max-h-[620px] 2xl:max-h-[680px]"
            loading="eager"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        {/* Main Center Content */}
        <div className="max-w-2xl xl:max-w-3xl mx-auto text-center py-6 sm:py-8 lg:py-10">
          {/* Top Badge */}
          <div className="inline-block border-2 border-black bg-[#FFDE59] px-3.5 py-1 text-[11px] sm:text-xs font-mono font-black uppercase text-black mb-5 shadow-[2px_2px_0px_#000] tracking-wider">
            COLLEGE EVENT CALENDAR • TAMIL NADU
          </div>

          {/* Headline with Yellow Highlighter Stroke & Doodles */}
          <div className="relative inline-block mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-black tracking-tight leading-[1.05] sm:leading-[1.02]">
              <span className="relative inline-block">
                <span className="relative z-10">Namma ooru</span>

                {/* Doodle sparks positioned right at top-right of 'ooru' */}
                <span className="absolute -top-3 -right-6 sm:-top-4 sm:-right-8 text-[#FFDE59] pointer-events-none select-none">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    viewBox="0 0 36 36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  >
                    <line x1="8" y1="26" x2="3" y2="18" />
                    <line x1="18" y1="26" x2="18" y2="9" />
                    <line x1="28" y1="26" x2="33" y2="18" />
                  </svg>
                </span>

                {/* Highlighter underline */}
                <svg
                  className="absolute -bottom-1 sm:-bottom-1.5 left-0 w-full h-3 sm:h-4 text-[#FFDE59] pointer-events-none z-0"
                  viewBox="0 0 320 18"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M4 11 C 70 5, 160 12, 316 9"
                    stroke="#FFDE59"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="block">student events</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base md:text-lg text-black/85 font-medium leading-relaxed max-w-xl mx-auto px-2">
            Discover hackathons, workshops, tech fests, and college symposiums
            happening across Tamil Nadu. Curated by students, for students.
          </p>

          {/* Search & Location Bar */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 sm:mt-10 max-w-2xl mx-auto bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_#000] p-1.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all focus-within:shadow-[6px_6px_0px_#000]"
          >
            {/* Text Search Input */}
            <div className="flex-1 flex items-center pl-2.5 sm:pl-3 pr-2 py-1">
              <Search className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find hackathons, workshops, tech fests..."
                className="w-full pl-2.5 pr-2 py-1.5 text-xs sm:text-sm font-bold text-black placeholder-neutral-400 bg-transparent focus:outline-none"
                aria-label="Search events"
              />
            </div>

            {/* Vertical divider */}
            <div className="hidden sm:block h-7 w-[1.5px] bg-neutral-200" />

            {/* Location Selector */}
            <div className="relative flex items-center pl-2 sm:pl-0 pr-1 py-1">
              <MapPin className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-bold text-black focus:outline-none cursor-pointer py-1 pl-1.5 pr-6 appearance-none"
                aria-label="Filter by location"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="font-sans font-bold">
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-black pointer-events-none absolute right-2 stroke-[2.5]" />
            </div>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              aria-label="Search"
              className="bg-[#FFDE59] hover:bg-[#FFE680] text-black border-2 border-black rounded-xl p-2.5 sm:px-4 sm:py-2.5 flex items-center justify-center font-black cursor-pointer shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-7 sm:mt-8">
            <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto mb-3">
              <div className="h-[1.5px] bg-neutral-300 flex-1" />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-neutral-600 uppercase">
                POPULAR SEARCHES
              </span>
              <div className="h-[1.5px] bg-neutral-300 flex-1" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {POPULAR_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleChipClick(chip.query)}
                    className="border-2 border-black bg-white rounded-xl px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-black shadow-[2px_2px_0px_#000] hover:bg-[#FFDE59] hover:shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

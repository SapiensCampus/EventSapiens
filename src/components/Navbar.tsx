/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { Menu, Users, X } from 'lucide-react';
import { useGitHubContributors } from '../hooks/useGitHubContributors';
import { EventSapienMascot } from './EventSapienMascot';

const GITHUB_REPOSITORY_URL = 'https://github.com/SapiensCampus/EventSapiens';
const GITHUB_CONTRIBUTORS_URL = `${GITHUB_REPOSITORY_URL}/graphs/contributors`;

interface NavbarProps {
  currentView: 'home' | 'past-events';
  onNavigate: (view: 'home' | 'past-events') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const contributorsCount = useGitHubContributors();

  const handleNav = (view: 'home' | 'past-events') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };
  return (
    <header className="w-full bg-[#FFF8DC] pt-5 pb-3 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <a
          href={import.meta.env.BASE_URL}
          onClick={(e) => {
            e.preventDefault();
            handleNav('home');
          }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="shrink-0">
            <EventSapienMascot variant="logo" />
          </div>

          <span className="font-black text-2xl sm:text-3xl tracking-tight text-black leading-none">
            EventSapiens
          </span>
        </a>
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => handleNav(currentView === 'home' ? 'past-events' : 'home')}
            className="border-2 border-black bg-white/70 hover:bg-white text-black px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            {currentView === 'home' ? 'Past Events' : 'Active Events'}
          </button>

          <a
            href={GITHUB_CONTRIBUTORS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={`${contributorsCount} contributors on GitHub`}
            className="inline-flex items-center gap-1.5 border-2 border-black bg-[#FFDE59] hover:bg-[#FFE680] text-black px-3 py-2 rounded-xl text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <Users className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>{contributorsCount} Contributors</span>
          </a>

          <a
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-black text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            Contribute
          </a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <a
            href={GITHUB_CONTRIBUTORS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${contributorsCount} contributors on GitHub`}
            className="inline-flex items-center gap-1.5 border-2 border-black bg-[#FFDE59] px-2.5 py-1.5 rounded-lg text-xs font-black shadow-[2px_2px_0px_#000]"
          >
            <Users className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            <span>{contributorsCount}</span>
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="p-1.5 border-2 border-black bg-white rounded-lg shadow-[2px_2px_0px_#000]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-y-2 border-black bg-[#FFDE59] p-4 mt-3 space-y-2 text-sm font-bold shadow-[0_4px_0_#000]"
        >
          <button
            type="button"
            onClick={() => handleNav(currentView === 'home' ? 'past-events' : 'home')}
            className={`block w-full text-left py-2 px-3 border-2 border-black rounded-lg ${
              currentView === 'past-events' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            {currentView === 'home' ? 'Past Events' : 'Active Events'}
          </button>

          <a
            href={GITHUB_CONTRIBUTORS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between w-full py-2 px-3 border-2 border-black rounded-lg bg-white text-black"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              Contributors
            </span>
            <span className="bg-[#FFDE59] border-2 border-black px-2 py-0.5 text-xs font-mono font-black shadow-[1px_1px_0px_#000]">
              {contributorsCount}
            </span>
          </a>

          <a
            href={GITHUB_REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left py-2 px-3 border-2 border-black bg-black text-white rounded-lg"
          >
            Contribute
          </a>
        </div>
      )}
    </header>
  );
};

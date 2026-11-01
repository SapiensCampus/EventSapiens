/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useMemo, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroIntro } from './components/HeroIntro';
import { EventDiscoveryBar } from './components/EventDiscoveryBar';
import { MonthSection } from './components/MonthSection';
import { PastEventsPage } from './components/PastEventsPage';
import { EventDetailModal } from './components/EventDetailModal';
import { ContributeSection } from './components/ContributeSection';
import { ContributeModal } from './components/ContributeModal';
import { TamilNaduTechCard } from './components/TamilNaduTechCard';
import { Footer } from './components/Footer';
import { loadActiveEvents, loadArchivedEvents, getEventById } from './lib/events-loader';
import {
  filterEvents,
  getEffectiveDateString,
  groupEventsIntoThisMonthAndUpcoming
} from './lib/event-utils';
import type { EventItem } from './types/event';
import { Inbox } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'past-events'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const referenceDate = useMemo(() => getEffectiveDateString(), []);

  // Initialize filters from URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('search');
    const mode = params.get('mode');
    const cat = params.get('category');
    if (q) setSearchQuery(q);
    if (mode && ['Online', 'Offline', 'Hybrid'].includes(mode)) setSelectedMode(mode);
    if (cat) setSelectedCategory(cat);
  }, []);

  // Synchronize filter updates into URL query parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    if (searchQuery) url.searchParams.set('q', searchQuery);
    else url.searchParams.delete('q');

    if (selectedMode !== 'all') url.searchParams.set('mode', selectedMode);
    else url.searchParams.delete('mode');

    if (selectedCategory !== 'all') url.searchParams.set('category', selectedCategory);
    else url.searchParams.delete('category');

    window.history.replaceState(null, '', url.toString());
  }, [searchQuery, selectedMode, selectedCategory]);

  // Load events
  const activeEvents = useMemo(() => loadActiveEvents(), []);
  const archivedEvents = useMemo(() => loadArchivedEvents(), []);

  // Unique categories for active events
  const categories = useMemo(() => {
    const set = new Set<string>();
    activeEvents.forEach((ev) => {
      if (ev.category) set.add(ev.category);
    });
    return Array.from(set).sort();
  }, [activeEvents]);

  // Support URL hash deep-linking (e.g. #ssn-invente-hackathon)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'past-events') {
        setCurrentView('past-events');
      } else if (hash && hash !== 'contribute' && hash !== 'events-section') {
        const found = getEventById(hash);
        if (found) {
          setSelectedEvent(found);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    window.history.replaceState(null, '', `#${event.id}`);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    window.history.replaceState(
      null,
      '',
      currentView === 'past-events' ? '#past-events' : window.location.pathname
    );
  };

  const handleNavigate = (view: 'home' | 'past-events') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'past-events') {
      window.history.replaceState(null, '', '#past-events');
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Filter active events
  const filteredActiveEvents = useMemo(() => {
    return filterEvents(
      activeEvents,
      searchQuery,
      selectedMode,
      selectedCategory,
      'all',
      referenceDate
    );
  }, [activeEvents, referenceDate, searchQuery, selectedMode, selectedCategory]);

  // Group active events into this month and upcoming
  const monthGroups = useMemo(() => {
    return groupEventsIntoThisMonthAndUpcoming(filteredActiveEvents, referenceDate);
  }, [filteredActiveEvents, referenceDate]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMode('all');
    setSelectedCategory('all');
  };

  const handleExploreClick = () => {
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroSearch = (query: string, city?: string) => {
    let finalQuery = query.trim();
    if (city && city !== 'all' && city !== 'Tamil Nadu') {
      finalQuery = finalQuery ? `${finalQuery} ${city}` : city;
    }
    setSearchQuery(finalQuery);
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroCategorySelect = (category: string) => {
    const matched = categories.find((c) => c.toLowerCase() === category.toLowerCase());
    if (matched) {
      setSelectedCategory(matched);
      setSearchQuery('');
    } else {
      setSelectedCategory('all');
      setSearchQuery(category);
    }
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8DC] text-black flex flex-col font-sans selection:bg-[#FFDE59] selection:text-black">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            <HeroIntro
              onExploreClick={handleExploreClick}
              onSearch={handleHeroSearch}
              onSelectCategory={handleHeroCategorySelect}
              initialSearchQuery={searchQuery}
            />

            <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 pt-8">
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
                  Events around you!
                </h2>
              </div>

              <EventDiscoveryBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
                totalResults={filteredActiveEvents.length}
                onResetFilters={handleResetFilters}
              />

              {monthGroups.length > 0 ? (
                <div className="mt-4">
                  {monthGroups.map((group) => (
                    <MonthSection
                      key={group.key}
                      monthGroup={group}
                      onSelectEvent={handleSelectEvent}
                      referenceDateStr={referenceDate}
                    />
                  ))}
                </div>
              ) : (
                <div className="border-[2.5px] border-black bg-white shadow-[4px_4px_0px_#000] p-12 text-center my-8">
                  <div className="w-12 h-12 border-2 border-black bg-[#FFDE59] shadow-[2px_2px_0px_#000] flex items-center justify-center mx-auto text-black mb-3">
                    <Inbox className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-black">No events found</h3>
                  <p className="mt-1 text-xs text-neutral-600 max-w-sm mx-auto">
                    Try adjusting your search terms or filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>

            <TamilNaduTechCard />

            <ContributeSection onOpenContributeModal={() => setIsContributeModalOpen(true)} />
          </>
        ) : (
          <PastEventsPage
            archivedEvents={archivedEvents}
            onSelectEvent={handleSelectEvent}
            onBackToHome={() => handleNavigate('home')}
            referenceDateStr={referenceDate}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <EventDetailModal
        event={selectedEvent}
        onClose={handleCloseModal}
        referenceDateStr={referenceDate}
      />

      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
      />
    </div>
  );
}

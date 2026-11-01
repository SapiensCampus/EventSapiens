/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import type { MonthGroup, EventItem } from '../types/event';
import { EventCard } from './EventCard';

interface MonthSectionProps {
  monthGroup: MonthGroup;
  onSelectEvent: (event: EventItem) => void;
  referenceDateStr?: string;
}

export const MonthSection: React.FC<MonthSectionProps> = ({
  monthGroup,
  onSelectEvent,
  referenceDateStr
}) => {
  return (
    <section className="mb-12 last:mb-6">
      <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {monthGroup.key === 'this-month' || monthGroup.isThisMonth
              ? 'Registration closing this month'
              : monthGroup.key === 'upcoming'
              ? 'Upcoming'
              : monthGroup.label.charAt(0).toUpperCase() + monthGroup.label.slice(1)}
          </h2>
          {monthGroup.isThisMonth && (
            <span className="border-[1.5px] border-black bg-[#FFDE59] px-2 py-0.5 text-[11px] font-mono font-black uppercase text-black shadow-[1.5px_1.5px_0px_#000]">
              ACTIVE
            </span>
          )}
        </div>

        <span className="font-mono text-xs font-bold text-neutral-600">
          {monthGroup.events.length} {monthGroup.events.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthGroup.events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onSelectEvent={onSelectEvent}
            referenceDateStr={referenceDateStr}
          />
        ))}
      </div>
    </section>
  );
};

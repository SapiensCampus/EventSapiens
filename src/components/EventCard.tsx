/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { CalendarDays, Clock, ExternalLink, Layers, MapPin, Monitor } from 'lucide-react';
import type { EventItem } from '../types/event';
import {
  formatDeadlineCountdown,
  getDaysUntilDeadline,
  getRegistrationStatus,
  sanitizeExternalUrl
} from '../lib/event-utils';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  referenceDateStr?: string;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats YYYY-MM-DD as "09 Nov, 2026". */
function formatCardDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d} ${MONTH_SHORT[Number(m) - 1] ?? m}, ${y}`;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  referenceDateStr
}) => {
  const status = getRegistrationStatus(
    event.registration_deadline,
    event.event_date,
    referenceDateStr
  );
  const safeRegUrl = sanitizeExternalUrl(event.registration_url);
  const daysLeft = getDaysUntilDeadline(event.registration_deadline, referenceDateStr);

  // Registration box tone: red when closing soon, yellow when open, grey when closed
  const deadlineTone =
    status === 'Closed'
      ? 'bg-neutral-100 border-neutral-400 text-neutral-700'
      : status === 'Closing Soon'
      ? 'bg-[#FEE2E2] border-[#F87171] text-[#991B1B]'
      : 'bg-[#FEF9C3] border-[#FACC15] text-[#854D0E]';

  // Month tag color
  const monthName = new Date(event.event_date + 'T00:00:00Z').toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC'
  }).toUpperCase();

  const yearNum = event.event_date.split('-')[0];

  const venue = event.venue?.trim();
  const city = event.city?.trim();
  const location =
    venue && city && !venue.toLowerCase().includes(city.toLowerCase())
      ? `${venue}, ${city}`
      : venue || city;

  const ModeIcon = event.mode === 'Online' ? Monitor : MapPin;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View details for ${event.title}`}
      onClick={() => onSelectEvent(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectEvent(event);
        }
      }}
      className="group bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-black transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div className="bg-[#FFF8DC] border-b-[2px] border-black px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="border-[2px] border-black bg-[#FFDE59] px-2 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_#000]">
          {monthName} {yearNum}
        </div>

        <span
          className={`inline-flex items-center gap-1 border-[1.5px] border-black px-2 py-0.5 text-[11px] font-bold uppercase text-black ${
            event.mode === 'Online'
              ? 'bg-[#BAE6FD]'
              : event.mode === 'Offline'
              ? 'bg-[#BBF7D0]'
              : 'bg-[#FED7AA]'
          }`}
        >
          <ModeIcon className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
          {event.mode}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="inline-block border-[1.5px] border-black bg-white px-2 py-0.5 text-xs font-bold text-black mb-2 shadow-[1px_1px_0px_#000]">
            {event.organizer}
          </div>

          <h3 className="text-base sm:text-lg font-black text-black leading-snug group-hover:underline decoration-2 underline-offset-2">
            {event.title}
          </h3>

          <p className="mt-2 text-xs text-neutral-600 font-medium line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Event date vs. registration deadline, shown side by side */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-[#DBEAFE] border border-[#93C5FD] rounded-md px-2.5 py-2 text-[#1E3A8A]">
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Event Date</span>
            </div>
            <time dateTime={event.event_date} className="mt-1 block text-sm font-black text-black">
              {formatCardDate(event.event_date)}
            </time>
          </div>

          {event.registration_deadline && (
            <div className={`border rounded-md px-2.5 py-2 ${deadlineTone}`}>
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{status === 'Closed' ? 'Registration Closed' : 'Registration Closes'}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <time dateTime={event.registration_deadline} className="text-sm font-black">
                  {formatCardDate(event.registration_deadline)}
                </time>
                {status !== 'Closed' && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FEF08A] border border-[#EAB308] px-1.5 py-px text-[10px] font-bold text-[#854D0E] whitespace-nowrap">
                    <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                    {formatDeadlineCountdown(daysLeft)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          {location ? (
            <div className="flex items-start gap-1.5 text-neutral-600 font-medium min-w-0">
              <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </div>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            {event.stages && event.stages.length > 0 && (
              <span className="bg-[#FED7AA] border border-black/40 px-2 py-0.5 text-[11px] text-black font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                <span>{event.stages.length} Stages</span>
              </span>
            )}
            {event.fee && (
              <span className="bg-[#FEF08A] border border-black/40 px-2 py-0.5 text-[11px] text-black font-bold whitespace-nowrap">
                {event.fee}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border-t-[2px] border-black px-4 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`View details for ${event.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectEvent(event);
          }}
          className="text-xs font-black text-black hover:underline cursor-pointer"
        >
          View Details &rarr;
        </button>

        {safeRegUrl && status !== 'Closed' && (
          <a
            href={safeRegUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold border border-black hover:bg-neutral-800 transition-colors shadow-[1.5px_1.5px_0px_#000]"
          >
            <span>Register</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </article>
  );
};

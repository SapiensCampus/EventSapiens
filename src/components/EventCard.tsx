/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ExternalLink, Layers, MapPin } from 'lucide-react';
import type { EventItem } from '../types/event';
import { getRegistrationStatus, sanitizeExternalUrl } from '../lib/event-utils';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  referenceDateStr?: string;
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

  // Month tag color
  const monthName = new Date(event.event_date + 'T00:00:00Z').toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC'
  }).toUpperCase();

  const yearNum = event.event_date.split('-')[0];

  return (
    <article
      onClick={() => onSelectEvent(event)}
      className="group bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div className="bg-[#FFF8DC] border-b-[2px] border-black px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="border-[2px] border-black bg-[#FFDE59] px-2 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_#000]">
          {monthName} {yearNum}
        </div>

        <span
          className={`border-[1.5px] border-black px-2 py-0.5 text-[11px] font-bold uppercase ${
            event.mode === 'Online'
              ? 'bg-[#BAE6FD] text-black'
              : event.mode === 'Offline'
              ? 'bg-[#BBF7D0] text-black'
              : 'bg-[#FED7AA] text-black'
          }`}
        >
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

        <div className="mt-4 pt-3 border-t-[1.5px] border-black/15 flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {event.city && (
            <span className="bg-[#DCFCE7] border border-black/40 px-2 py-0.5 text-[11px] text-black font-bold">
              {event.city}
            </span>
          )}

          <span className="bg-[#DBEAFE] border border-black/40 px-2 py-0.5 text-[11px] font-mono text-black">
            {event.event_date}
          </span>

          {event.fee && (
            <span className="bg-[#FEF08A] border border-black/40 px-2 py-0.5 text-[11px] text-black font-bold">
              {event.fee}
            </span>
          )}

          {event.stages && event.stages.length > 0 && (
            <span className="bg-[#FED7AA] border border-black/40 px-2 py-0.5 text-[11px] text-black font-bold flex items-center gap-1">
              <Layers className="w-3 h-3 stroke-[2.5]" />
              <span>{event.stages.length} Stages</span>
            </span>
          )}
        </div>

        {event.venue && (
          <div className="mt-2.5 flex items-start gap-1.5 text-xs text-neutral-600 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
            <span className="truncate">{event.venue}</span>
          </div>
        )}
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

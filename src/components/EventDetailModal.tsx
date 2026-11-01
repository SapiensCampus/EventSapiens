/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Share2,
  Check,
  Building2,
  Layers
} from 'lucide-react';
import type { EventItem } from '../types/event';
import {
  formatDateRange,
  getRegistrationStatus,
  generateGoogleCalendarUrl,
  sanitizeExternalUrl
} from '../lib/event-utils';
import { copyText } from '../lib/clipboard';
import { useModalLifecycle } from '../hooks/useModalLifecycle';

interface EventDetailModalProps {
  event: EventItem | null;
  onClose: () => void;
  referenceDateStr?: string;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  referenceDateStr
}) => {
  const [copied, setCopied] = useState(false);
  useModalLifecycle(Boolean(event), onClose);

  if (!event) return null;

  const status = getRegistrationStatus(
    event.registration_deadline,
    event.event_date,
    referenceDateStr
  );

  const formattedDate = formatDateRange(event.event_date, event.end_date);
  const googleCalUrl = generateGoogleCalendarUrl(event);
  const safeRegUrl = sanitizeExternalUrl(event.registration_url);

  const handleShare = async () => {
    const shareUrl = new URL(`#${event.id}`, window.location.href).toString();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title} on EventSapiens!`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled share or failed, proceed to copy fallback
      }
    }
    if (await copyText(shareUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-none animate-in fade-in duration-100"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-white border-[3px] border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        {/* Modal Top Bar */}
        <div className="bg-[#FFDE59] border-b-[2.5px] border-black px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="border-[1.5px] border-black bg-white px-2 py-0.5 text-xs font-bold uppercase text-black">
              {event.category}
            </span>
            <span className="border-[1.5px] border-black bg-white px-2 py-0.5 text-xs font-bold uppercase text-black">
              {event.mode}
            </span>
          </div>

          <button
            onClick={onClose}
            type="button"
            data-modal-autofocus
            className="p-1 border-[2px] border-black bg-white text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#FFFDF5]">
          <div>
            <h2 id="event-detail-title" className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
              {event.title}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-700 mt-1">
              <Building2 className="w-4 h-4 stroke-[2.5] text-black shrink-0" />
              <span>{event.organizer}</span>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-[2px] border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
            <div className="flex items-start gap-3">
              <div className="p-2 border-[1.5px] border-black bg-[#FFDE59] shrink-0">
                <Calendar className="w-4 h-4 stroke-[2.5] text-black" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                  Event Date
                </p>
                <p className="text-xs sm:text-sm font-black text-black">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 border-[1.5px] border-black bg-[#BBF7D0] shrink-0">
                <Clock className="w-4 h-4 stroke-[2.5] text-black" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                  Registration
                </p>
                <p className="text-xs sm:text-sm font-black text-black">{status}</p>
                {event.registration_deadline && (
                  <p className="text-[11px] font-mono text-neutral-600">
                    Deadline: {event.registration_deadline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2 pt-2 border-t border-black/15">
              <div className="p-2 border-[1.5px] border-black bg-[#BAE6FD] shrink-0">
                <MapPin className="w-4 h-4 stroke-[2.5] text-black" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                  Location &amp; Venue
                </p>
                <p className="text-xs sm:text-sm font-bold text-black">
                  {event.venue || (event.mode === 'Online' ? 'Online / Virtual Platform' : event.city)}
                </p>
                {event.city && event.venue && (
                  <p className="text-[11px] text-neutral-600">{event.city}</p>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Stage Schedule (if hybrid or multi-round) */}
          {event.stages && event.stages.length > 0 && (
            <div className="border-[2px] border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-black mb-2">
                <Layers className="w-4 h-4 stroke-[2.5]" />
                <span>Multi-Stage Schedule</span>
              </div>
              <div className="divide-y border border-black/20 text-xs">
                {event.stages.map((st, i) => (
                  <div key={i} className="p-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black">{st.name}</p>
                      {st.venue && <p className="text-[11px] text-neutral-600">{st.venue}</p>}
                    </div>
                    <div className="text-right font-mono font-bold text-black">
                      {st.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-mono font-black uppercase text-neutral-600 mb-1">
              Description
            </h4>
            <div className="p-4 border-[2px] border-black bg-white text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
              {event.description}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-black bg-white px-2 py-0.5 text-xs font-mono font-bold text-black"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t-[2.5px] border-black bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-black bg-white hover:bg-neutral-100 border-[1.5px] border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-black bg-[#FFDE59] hover:bg-[#FFE680] border-[1.5px] border-black cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Google Calendar</span>
            </a>
          </div>

          <div>
            {safeRegUrl && status !== 'Closed' ? (
              <a
                href={safeRegUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-black uppercase text-white bg-black hover:bg-neutral-800 border-[2px] border-black shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <span>Register Now</span>
                <ExternalLink className="w-4 h-4 stroke-[2.5]" />
              </a>
            ) : (
              <span className="px-4 py-2 text-xs font-bold text-neutral-500 bg-neutral-200 border border-black cursor-not-allowed">
                Registration Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

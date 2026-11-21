/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * EventMap — Luma-style interactive map with auto-geocoding.
 * Uses MapLibre GL JS with 100% free, unwatermarked basemaps (OpenStreetMap / ESRI)
 * and interactive Neo-brutalist HTML pin badges.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, ExternalLink, Loader2, X } from 'lucide-react';
import type { EventItem } from '../types/event';
import { useGeocode, type GeocodedEvent } from '../hooks/useGeocode';
import { formatDateRange, getRegistrationStatus, sanitizeExternalUrl } from '../lib/event-utils';

// ─── OpenStreetMap Basemap (100% Free, No Watermark, No API Key) ─────────────
const OSM_STYLE_SPEC: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

interface EventMapProps {
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
  className?: string;
}

const TN_CENTER: [number, number] = [78.6569, 11.1271];

function getDirectionsUrl(event: GeocodedEvent): string {
  const query = encodeURIComponent(
    event.venue ? `${event.venue}, ${event.city ?? ''}` : (event.city ?? '')
  );
  if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    return `maps://maps.apple.com/?q=${query}&ll=${event.resolvedLat},${event.resolvedLng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${event.resolvedLat},${event.resolvedLng}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── React Popup ─────────────────────────────────────────────────────────────
interface MapPopupProps {
  event: GeocodedEvent;
  position: { x: number; y: number };
  containerWidth: number;
  onClose: () => void;
  onViewDetails: (event: EventItem) => void;
}

function MapPopup({ event, position, containerWidth, onClose, onViewDetails }: MapPopupProps) {
  const status = getRegistrationStatus(event.registration_deadline, event.event_date);
  const safeRegUrl = sanitizeExternalUrl(event.registration_url);
  const dateLabel = formatDateRange(event.event_date, event.end_date);
  const location = event.venue
    ? event.city && !event.venue.toLowerCase().includes(event.city.toLowerCase())
      ? `${event.venue}, ${event.city}`
      : event.venue
    : event.city ?? '';

  const isClosed = status === 'Closed';
  const isMobile = containerWidth < 640;

  // On mobile (< 640px), render as a thumb-friendly bottom docked card inside map
  if (isMobile) {
    return (
      <div className="absolute bottom-3 left-3 right-3 z-40 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="bg-white border-[2.5px] border-black shadow-[4px_4px_0px_#000] overflow-hidden">
          {/* Header */}
          <div className="bg-[#FFDE59] border-b-[2px] border-black px-3 py-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="border border-black bg-white px-1.5 py-px text-[10px] font-black uppercase text-black shrink-0">
                {event.category}
              </span>
              <span className="border border-black bg-white px-1.5 py-px text-[10px] font-black uppercase text-black shrink-0">
                {event.mode}
              </span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="shrink-0 w-6 h-6 flex items-center justify-center border border-black bg-white hover:bg-black hover:text-white text-black transition-colors cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Body */}
          <div className="px-3.5 py-2.5 space-y-1.5 bg-[#FFFDF5]">
            <div>
              <p className="text-sm font-black text-black leading-tight line-clamp-1">{event.title}</p>
              <p className="text-[11px] text-neutral-600 font-bold">{event.organizer}</p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-black font-bold flex-wrap">
              <span className="bg-[#DBEAFE] border border-[#93C5FD] px-1.5 py-0.5 rounded">
                📅 {dateLabel}
              </span>
              {location && (
                <span className="text-neutral-700 truncate max-w-[170px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-black shrink-0" />
                  {location}
                </span>
              )}
              {event.fee && (
                <span className="bg-[#FEF08A] border border-black px-1.5 py-px text-[10px] font-black text-black">
                  {event.fee}
                </span>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t-[2px] border-black px-3 py-2 bg-white flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5">
              <a
                href={getDirectionsUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-black bg-[#BBF7D0] border-[1.5px] border-black hover:bg-[#86EFAC] shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                <Navigation className="w-3 h-3 stroke-[2.5]" />
                Directions
              </a>

              <button
                onClick={() => onViewDetails(event)}
                type="button"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-black bg-white border-[1.5px] border-black hover:bg-neutral-100 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                Details →
              </button>
            </div>

            {safeRegUrl && !isClosed && (
              <a
                href={safeRegUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black text-white bg-black border-[1.5px] border-black hover:bg-neutral-800 shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
              >
                Register
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop (> 640px): Floating balloon anchored above pin, clamped horizontally
  const popupWidth = 288;
  const clampedX = Math.max(popupWidth / 2 + 12, Math.min(position.x, containerWidth - popupWidth / 2 - 12));

  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${clampedX}px`,
    top: `${position.y}px`,
    zIndex: 40,
    transform: 'translate(-50%, calc(-100% - 38px))',
    pointerEvents: 'auto',
  };

  return (
    <div style={popupStyle} className="w-72 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-white border-[2.5px] border-black shadow-[5px_5px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFDE59] border-b-[2px] border-black px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="border border-black bg-white px-1.5 py-px text-[10px] font-black uppercase text-black shrink-0">
              {event.category}
            </span>
            <span className="border border-black bg-white px-1.5 py-px text-[10px] font-black uppercase text-black shrink-0">
              {event.mode}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="shrink-0 w-5 h-5 flex items-center justify-center border border-black bg-white hover:bg-black hover:text-white text-black transition-colors cursor-pointer"
            aria-label="Close popup"
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3.5 py-3 space-y-2 bg-[#FFFDF5]">
          <div>
            <p className="text-sm font-black text-black leading-tight line-clamp-2">{event.title}</p>
            <p className="text-[11px] text-neutral-600 font-bold mt-0.5">{event.organizer}</p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-black font-bold">
            <span className="bg-[#DBEAFE] border border-[#93C5FD] px-1.5 py-0.5 rounded">
              📅 {dateLabel}
            </span>
          </div>

          {location && (
            <div className="flex items-start gap-1.5 text-[11px] text-neutral-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
              <span className="line-clamp-2">{location}</span>
            </div>
          )}

          {event.fee && (
            <span className="inline-block bg-[#FEF08A] border border-black px-2 py-px text-[10px] font-black text-black">
              {event.fee}
            </span>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t-[2px] border-black px-3 py-2 bg-white flex items-center gap-2 flex-wrap">
          <a
            href={getDirectionsUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-black bg-[#BBF7D0] border-[1.5px] border-black hover:bg-[#86EFAC] shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-colors"
          >
            <Navigation className="w-3 h-3 stroke-[2.5]" />
            Directions
          </a>

          <button
            onClick={() => onViewDetails(event)}
            type="button"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-black bg-white border-[1.5px] border-black hover:bg-neutral-100 shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-colors"
          >
            Details →
          </button>

          {safeRegUrl && !isClosed && (
            <a
              href={safeRegUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-white bg-black border-[1.5px] border-black hover:bg-neutral-800 shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-colors"
            >
              Register
              <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
            </a>
          )}
        </div>
      </div>

      {/* Pointer triangle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '10px solid #171717',
        }}
      />
    </div>
  );
}

// ─── Main Map Component ──────────────────────────────────────────────────────
export function EventMap({ events, onEventClick, className }: EventMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hasFittedBoundsRef = useRef(false);

  const [popup, setPopup] = useState<{
    event: GeocodedEvent;
    position: { x: number; y: number };
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Auto-geocode any events lacking coordinates
  const { geocodedEvents, pendingCount } = useGeocode(events);

  const handleViewDetails = useCallback((event: EventItem) => {
    setPopup(null);
    onEventClick?.(event);
  }, [onEventClick]);

  // ── Initialize MapLibre ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialWidth = containerRef.current.clientWidth || 800;
    setContainerWidth(initialWidth);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE_SPEC,
      center: TN_CENTER,
      zoom: 6.8,
      minZoom: 4,
      maxZoom: 18,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('click', () => {
      setPopup(null);
    });

    // Handle container resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    setTimeout(() => {
      map.resize();
    }, 150);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setPopup(null);
      hasFittedBoundsRef.current = false;
    };
  }, []);

  // ── Render Luma-Style HTML Pin Badges ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (geocodedEvents.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    geocodedEvents.forEach((ev) => {
      bounds.extend([ev.resolvedLng, ev.resolvedLat]);

      // Create interactive Neo-brutalist pin element
      // CRITICAL: Do NOT put `-translate-x-1/2 -translate-y-full` here!
      // MapLibre's `anchor: 'bottom'` already centers horizontally and anchors to the bottom tip.
      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none';
      el.innerHTML = `
        <div class="flex items-center gap-1.5 bg-[#FFDE59] border-[2px] border-black px-2.5 py-1 text-xs font-black text-black shadow-[2.5px_2.5px_0px_#000] group-hover:shadow-[4px_4px_0px_#000] transition-shadow whitespace-nowrap">
          <span class="w-2.5 h-2.5 rounded-full bg-black shrink-0"></span>
          <span class="truncate max-w-[130px] sm:max-w-[180px]">${escapeHtml(ev.title)}</span>
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black mx-auto"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const coords: [number, number] = [ev.resolvedLng, ev.resolvedLat];
        map.flyTo({
          center: coords,
          zoom: Math.max(map.getZoom(), 13),
          duration: 600,
          essential: true,
        });

        const screenPoint = map.project(coords);
        setPopup({ event: ev, position: { x: screenPoint.x, y: screenPoint.y } });
      });

      // Anchor to the very bottom point of the triangle
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([ev.resolvedLng, ev.resolvedLat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Auto-fit bounds once on initial load (don't override the user if they're actively zooming)
    if (!hasFittedBoundsRef.current && geocodedEvents.length > 0) {
      try {
        map.fitBounds(bounds, {
          padding: { top: 70, bottom: 70, left: 70, right: 70 },
          maxZoom: 12,
          duration: 600,
        });
        hasFittedBoundsRef.current = true;
      } catch {
        // Ignore single-point bounds error
      }
    }
  }, [geocodedEvents]);

  // Keep active popup anchored to map location during pan/zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMove = () => {
      setPopup((prev) => {
        if (!prev) return null;
        const coords: maplibregl.LngLatLike = [prev.event.resolvedLng, prev.event.resolvedLat];
        const point = map.project(coords);
        return { ...prev, position: { x: point.x, y: point.y } };
      });
    };

    map.on('move', handleMove);
    return () => {
      map.off('move', handleMove);
    };
  }, []);

  const totalOffline = events.filter((e) => e.mode !== 'Online').length;
  const onMap = geocodedEvents.length;

  return (
    <div className="relative">
      {/* ── Map Canvas Container ───────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`w-full border-[2.5px] border-black shadow-[4px_4px_0px_#000] relative overflow-hidden bg-[#FAF8F5] ${className ?? 'h-[520px]'}`}
      >
        {/* Geocoding notification badge */}
        {pendingCount > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white border-[2px] border-black shadow-[2px_2px_0px_#000] px-2.5 py-1 text-xs font-bold text-black animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
            Locating {pendingCount} event{pendingCount !== 1 ? 's' : ''}…
          </div>
        )}

        {/* Interactive Popup Overlay */}
        {popup && mapRef.current && (
          <MapPopup
            event={popup.event}
            position={popup.position}
            containerWidth={containerWidth}
            onClose={() => setPopup(null)}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* ── Status Bar Below Map ───────────────────────────────────────────── */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-black">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-[#FFDE59] border-2 border-black shrink-0" />
            {onMap} of {totalOffline} offline event{totalOffline !== 1 ? 's' : ''} on map
          </span>

          {pendingCount > 0 && (
            <span className="text-neutral-500 font-medium hidden sm:inline">
              (Locating {pendingCount} events…)
            </span>
          )}
        </div>

        <span className="text-neutral-500 font-medium hidden sm:block">
          Click any badge for directions & details · Scroll to zoom
        </span>
      </div>
    </div>
  );
}

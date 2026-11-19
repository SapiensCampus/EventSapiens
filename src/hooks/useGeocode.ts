/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * useGeocode — runtime geocoding via Nominatim (free, no API key).
 *
 * Strategy:
 *  1. If the event already has lat/lng in its TOML → use it immediately.
 *  2. Otherwise geocode city + ", Tamil Nadu, India" via Nominatim.
 *  3. Results are cached in localStorage so each location is only fetched once
 *     per browser (TTL: 30 days).
 *
 * Rate limit: Nominatim allows 1 req/s. We queue requests with a 1.1 s delay.
 */

import { useState, useEffect, useRef } from 'react';
import type { EventItem } from '../types/event';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GeocodedEvent extends EventItem {
  resolvedLat: number;
  resolvedLng: number;
}

interface CacheEntry {
  lat: number;
  lng: number;
  expiresAt: number; // Unix ms
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CACHE_KEY_PREFIX = 'es_geo_v1_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RATE_LIMIT_MS = 1150; // Nominatim: 1 req/s max

// ─── Cache helpers ────────────────────────────────────────────────────────────
function readCache(cacheKey: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + cacheKey);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(CACHE_KEY_PREFIX + cacheKey);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeCache(cacheKey: string, lat: number, lng: number) {
  try {
    const entry: CacheEntry = { lat, lng, expiresAt: Date.now() + CACHE_TTL_MS };
    localStorage.setItem(CACHE_KEY_PREFIX + cacheKey, JSON.stringify(entry));
  } catch {
    // localStorage full — ignore
  }
}

function cacheKeyFor(query: string): string {
  // Cheap hash to keep key short
  return query.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_,]/g, '').slice(0, 60);
}

// ─── Global request queue (shared across hook instances) ─────────────────────
type QueueTask = () => Promise<void>;
const queue: QueueTask[] = [];
let queueRunning = false;

async function runQueue() {
  if (queueRunning) return;
  queueRunning = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    await task();
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS));
  }
  queueRunning = false;
}

function enqueue(task: QueueTask) {
  queue.push(task);
  runQueue();
}

// ─── Nominatim fetch ──────────────────────────────────────────────────────────
async function nominatimGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'EventSapiens/1.0 (eventsapiens.tech)' },
    });
    if (!res.ok) return null;
    const data: { lat: string; lon: string }[] = await res.json();
    if (!data?.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

// ─── Build a geocode query from an event ─────────────────────────────────────
function buildQuery(event: EventItem): string {
  // Use venue if detailed enough, else fall back to city
  const parts: string[] = [];
  if (event.venue && event.venue.length > 5) parts.push(event.venue);
  else if (event.city) parts.push(event.city);
  parts.push('Tamil Nadu', 'India');
  return parts.join(', ');
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useGeocode(events: EventItem[]): {
  geocodedEvents: GeocodedEvent[];
  pendingCount: number;
} {
  const [geocodedEvents, setGeocodedEvents] = useState<GeocodedEvent[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const resolvedRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    // Separate events that already have coords from those that need geocoding
    const withCoords: GeocodedEvent[] = [];
    const needsGeocode: EventItem[] = [];

    for (const ev of events) {
      if (ev.mode === 'Online') continue; // online events never get pins
      if (typeof ev.latitude === 'number' && typeof ev.longitude === 'number') {
        withCoords.push({ ...ev, resolvedLat: ev.latitude, resolvedLng: ev.longitude });
      } else if (ev.city || ev.venue) {
        // Check in-memory resolved map first
        const cached = resolvedRef.current.get(ev.id);
        if (cached) {
          withCoords.push({ ...ev, resolvedLat: cached.lat, resolvedLng: cached.lng });
        } else {
          needsGeocode.push(ev);
        }
      }
    }

    setGeocodedEvents(withCoords);
    if (needsGeocode.length === 0) {
      setPendingCount(0);
      return;
    }

    // For events that need geocoding, check localStorage cache first
    const toFetch: EventItem[] = [];
    const fromCache: GeocodedEvent[] = [];

    for (const ev of needsGeocode) {
      const query = buildQuery(ev);
      const key = cacheKeyFor(query);
      const cached = readCache(key);
      if (cached) {
        resolvedRef.current.set(ev.id, { lat: cached.lat, lng: cached.lng });
        fromCache.push({ ...ev, resolvedLat: cached.lat, resolvedLng: cached.lng });
      } else {
        toFetch.push(ev);
      }
    }

    setGeocodedEvents(prev => {
      const ids = new Set(prev.map(e => e.id));
      return [...prev, ...fromCache.filter(e => !ids.has(e.id))];
    });

    if (toFetch.length === 0) {
      setPendingCount(0);
      return;
    }

    setPendingCount(toFetch.length);
    let remaining = toFetch.length;

    for (const ev of toFetch) {
      const query = buildQuery(ev);
      const key = cacheKeyFor(query);

      enqueue(async () => {
        const result = await nominatimGeocode(query);
        remaining--;
        setPendingCount(remaining);

        if (!result) return;

        writeCache(key, result.lat, result.lng);
        resolvedRef.current.set(ev.id, result);

        setGeocodedEvents(prev => {
          if (prev.some(e => e.id === ev.id)) return prev;
          return [...prev, { ...ev, resolvedLat: result.lat, resolvedLng: result.lng }];
        });
      });
    }
  // We only want this to re-run when the events list actually changes (by identity or length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return { geocodedEvents, pendingCount };
}

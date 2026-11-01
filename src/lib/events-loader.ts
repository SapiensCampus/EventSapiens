/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { parse } from 'smol-toml';
import type { EventItem, RawEventToml } from '../types/event';
import archivedEventsRaw from '../data/archived.json';
import { validateEventData, isArchivedEligible } from './event-utils';

// Discover all active TOML files in /events/ at build time
const tomlFiles = import.meta.glob('/events/*.toml', {
  query: '?raw',
  eager: true
}) as Record<string, { default: string }>;

let cachedActiveEvents: EventItem[] | null = null;
let cachedArchivedEvents: EventItem[] | null = null;

export function loadActiveEvents(): EventItem[] {
  if (cachedActiveEvents) return cachedActiveEvents;

  const events: EventItem[] = [];

  for (const [path, module] of Object.entries(tomlFiles)) {
    // Skip template files or files starting with _
    const filename = path.split('/').pop() || '';
    if (filename.startsWith('_')) continue;

    const rawContent = module.default;
    try {
      const parsed = parse(rawContent) as unknown as RawEventToml;
      const slug = filename.replace(/\.toml$/, '');
      const validation = validateEventData(parsed, filename);

      if (!validation.valid) {
        console.error(`Invalid event data at ${path}:`, validation.errors);
        continue;
      }

      // Expired events whose registration deadline has passed are excluded from active listings
      if (isArchivedEligible(parsed)) {
        continue;
      }

      events.push({
        ...parsed,
        id: slug,
        // Ensure tags is an array
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      });
    } catch (err) {
      console.error(`Failed to parse TOML event at ${path}:`, err);
    }
  }

  // Sort upcoming events chronologically
  events.sort((a, b) => a.event_date.localeCompare(b.event_date));
  cachedActiveEvents = events;
  return events;
}

export function loadArchivedEvents(): EventItem[] {
  if (cachedArchivedEvents) return cachedArchivedEvents;

  const list = (archivedEventsRaw as unknown as EventItem[]).flatMap((item) => {
    const validation = validateEventData(item);
    if (!item.id || typeof item.id !== 'string') {
      validation.errors.push('Archived event is missing a string "id"');
    }
    if (validation.errors.length > 0) {
      console.error(`Invalid archived event "${item.id || 'unknown'}":`, validation.errors);
      return [];
    }

    return [{ ...item, tags: Array.isArray(item.tags) ? item.tags : [] }];
  });

  // Include any expired events from /events/ not yet written to archived.json
  for (const [path, module] of Object.entries(tomlFiles)) {
    const filename = path.split('/').pop() || '';
    if (filename.startsWith('_')) continue;
    try {
      const parsed = parse(module.default) as unknown as RawEventToml;
      const slug = filename.replace(/\.toml$/, '');
      if (isArchivedEligible(parsed) && !list.some((e) => e.id === slug)) {
        list.push({
          ...parsed,
          id: slug,
          tags: Array.isArray(parsed.tags) ? parsed.tags : []
        });
      }
    } catch {
      // Ignored here
    }
  }

  // Sort archived events descending (newest first)
  list.sort((a, b) => b.event_date.localeCompare(a.event_date));
  cachedArchivedEvents = list;
  return list;
}

function getAllEvents(): EventItem[] {
  return [...loadActiveEvents(), ...loadArchivedEvents()];
}

export function getEventById(id: string): EventItem | undefined {
  return getAllEvents().find((ev) => ev.id === id);
}

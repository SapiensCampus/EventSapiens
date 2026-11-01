/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import type { EventItem, MonthGroup, RegistrationStatus } from '../types/event';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EVENT_MODES = ['Online', 'Offline', 'Hybrid'] as const;
const MILLISECONDS_PER_DAY = 86_400_000;

function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function sanitizeExternalUrl(value?: string): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
}

function isHttpUrl(value: string): boolean {
  return Boolean(sanitizeExternalUrl(value));
}

export const getEffectiveDateString = (override?: string): string => {
  if (override) {
    if (!isValidDateString(override)) {
      throw new Error(`Invalid reference date "${override}"; expected YYYY-MM-DD`);
    }
    return override;
  }
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates registration status based on deadline and event date.
 * - If registration deadline is specified and has passed -> 'Closed'
 * - If registration deadline is within 3 days -> 'Closing Soon'
 * - If registration deadline is in the future -> 'Open'
 * - If no deadline is specified, uses event date (if event passed -> 'Closed', else 'Open')
 */
export function getRegistrationStatus(
  deadline?: string,
  eventDate?: string,
  refDateStr?: string
): RegistrationStatus {
  const todayStr = getEffectiveDateString(refDateStr);

  if (deadline) {
    if (deadline < todayStr) {
      return 'Closed';
    }
    // Calculate difference in days
    const today = new Date(todayStr + 'T00:00:00Z').getTime();
    const dead = new Date(deadline + 'T00:00:00Z').getTime();
    const diffDays = Math.ceil((dead - today) / MILLISECONDS_PER_DAY);
    if (diffDays <= 3 && diffDays >= 0) {
      return 'Closing Soon';
    }
    return 'Open';
  }

  if (eventDate) {
    return eventDate < todayStr ? 'Closed' : 'Open';
  }

  return 'Not Specified';
}

/**
 * Checks whether an event has concluded and is eligible for archiving.
 * Uses end_date if provided, otherwise event_date.
 */
export function isArchivedEligible(
  event: { event_date: string; end_date?: string },
  refDateStr?: string
): boolean {
  const todayStr = getEffectiveDateString(refDateStr);
  const compareDate = event.end_date || event.event_date;
  return compareDate < todayStr;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function getMonthKey(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parts[0]}-${parts[1]}`;
}

function getMonthLabel(dateStr: string): string {
  const parts = dateStr.split('-');
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] || parts[1];
  return `${monthName} ${year}`;
}

/**
 * Formats date range cleanly (e.g. "Oct 29 – 31, 2026" or "Nov 14, 2026")
 */
export function formatDateRange(startDateStr: string, endDateStr?: string): string {
  if (!startDateStr) return '';
  const [sY, sM, sD] = startDateStr.split('-').map(Number);
  const startMonth = MONTH_SHORT[sM - 1];

  if (!endDateStr || endDateStr === startDateStr) {
    return `${startMonth} ${sD}, ${sY}`;
  }

  const [eY, eM, eD] = endDateStr.split('-').map(Number);
  const endMonth = MONTH_SHORT[eM - 1];

  if (sY === eY && sM === eM) {
    return `${startMonth} ${sD} – ${eD}, ${sY}`;
  }

  if (sY === eY) {
    return `${startMonth} ${sD} – ${endMonth} ${eD}, ${sY}`;
  }

  return `${startMonth} ${sD}, ${sY} – ${endMonth} ${eD}, ${eY}`;
}

/**
 * Automatically groups events by their actual event_date month and year.
 * Upcoming events: sorted chronologically (ascending, nearest month first).
 * Archived events: sorted descending (newest month first).
 */
export function groupEventsByMonth(
  events: EventItem[],
  refDateStr?: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): MonthGroup[] {
  const todayStr = getEffectiveDateString(refDateStr);
  const currentMonthKey = getMonthKey(todayStr);

  // Group by "YYYY-MM"
  const map = new Map<string, EventItem[]>();

  for (const event of events) {
    if (!event.event_date) continue;
    const key = getMonthKey(event.event_date);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(event);
  }

  // Sort within each month chronologically
  for (const [, list] of map.entries()) {
    list.sort((a, b) => {
      const cmp = a.event_date.localeCompare(b.event_date);
      if (cmp !== 0) return sortOrder === 'asc' ? cmp : -cmp;
      return a.title.localeCompare(b.title);
    });
  }

  // Sort month keys
  const sortedKeys = Array.from(map.keys()).sort((a, b) => {
    return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  });

  return sortedKeys.map((key) => {
    const sampleDate = `${key}-01`;
    return {
      key,
      label: getMonthLabel(sampleDate),
      isThisMonth: key === currentMonthKey,
      events: map.get(key) || []
    };
  });
}

/** Groups active events into the current month and later events. */
export function groupEventsIntoThisMonthAndUpcoming(
  events: EventItem[],
  refDateStr?: string
): MonthGroup[] {
  const todayStr = getEffectiveDateString(refDateStr);
  const currentMonthKey = getMonthKey(todayStr);

  const eventClosingMonths = events
    .map((e) => getMonthKey(e.registration_deadline || e.event_date))
    .filter(Boolean)
    .sort();

  const hasCurrentMonth = eventClosingMonths.includes(currentMonthKey);
  const activeMonthKey = hasCurrentMonth ? currentMonthKey : eventClosingMonths[0];

  const thisMonthEvents: EventItem[] = [];
  const upcomingEvents: EventItem[] = [];

  for (const event of events) {
    if (!event.event_date) continue;
    const closingKey = getMonthKey(event.registration_deadline || event.event_date);
    if (closingKey === activeMonthKey) {
      thisMonthEvents.push(event);
    } else {
      upcomingEvents.push(event);
    }
  }

  thisMonthEvents.sort((a, b) => a.event_date.localeCompare(b.event_date));
  upcomingEvents.sort((a, b) => a.event_date.localeCompare(b.event_date));

  const groups: MonthGroup[] = [];

  if (thisMonthEvents.length > 0) {
    groups.push({
      key: 'this-month',
      label: 'Registration closing this month',
      isThisMonth: true,
      events: thisMonthEvents
    });
  }

  if (upcomingEvents.length > 0) {
    groups.push({
      key: 'upcoming',
      label: 'Upcoming',
      isThisMonth: false,
      events: upcomingEvents
    });
  }

  return groups;
}

/**
 * Filters events by text search, mode, category, and status.
 */
export function filterEvents(
  events: EventItem[],
  query: string,
  modeFilter: string,
  categoryFilter: string,
  statusFilter: string,
  refDateStr?: string
): EventItem[] {
  const q = query.trim().toLowerCase();

  return events.filter((ev) => {
    // Mode filter
    if (modeFilter && modeFilter !== 'all') {
      if (ev.mode.toLowerCase() !== modeFilter.toLowerCase()) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      if (ev.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      const status = getRegistrationStatus(ev.registration_deadline, ev.event_date, refDateStr);
      if (statusFilter.toLowerCase() === 'open') {
        if (status !== 'Open' && status !== 'Closing Soon') return false;
      } else if (statusFilter.toLowerCase() === 'closing soon') {
        if (status !== 'Closing Soon') return false;
      } else if (statusFilter.toLowerCase() === 'closed') {
        if (status !== 'Closed') return false;
      }
    }

    // Text query
    if (q) {
      const title = (ev.title || '').toLowerCase();
      const org = (ev.organizer || '').toLowerCase();
      const desc = (ev.description || '').toLowerCase();
      const city = (ev.city || '').toLowerCase();
      const venue = (ev.venue || '').toLowerCase();
      const cat = (ev.category || '').toLowerCase();
      const tags = (ev.tags || []).map((t) => t.toLowerCase()).join(' ');

      const matches =
        title.includes(q) ||
        org.includes(q) ||
        desc.includes(q) ||
        city.includes(q) ||
        venue.includes(q) ||
        cat.includes(q) ||
        tags.includes(q);

      if (!matches) return false;
    }

    return true;
  });
}

/**
 * Validates an event object against required schema specifications.
 */
export function validateEventData(
  data: unknown,
  filename?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Event payload must be a non-null object'] };
  }

  const ev = data as Record<string, unknown>;

  if (filename && !/^[a-z0-9-]+\.toml$/.test(filename)) {
    errors.push(
      `Filename "${filename}" must use lowercase letters, numbers, and hyphens only`
    );
  }

  // Required fields: title, description, organizer, category, mode, event_date
  if (!ev.title || typeof ev.title !== 'string' || !ev.title.trim()) {
    errors.push('Missing or empty required field: "title"');
  }
  if (!ev.description || typeof ev.description !== 'string' || !ev.description.trim()) {
    errors.push('Missing or empty required field: "description"');
  }
  if (!ev.organizer || typeof ev.organizer !== 'string' || !ev.organizer.trim()) {
    errors.push('Missing or empty required field: "organizer"');
  }
  if (!ev.category || typeof ev.category !== 'string' || !ev.category.trim()) {
    errors.push('Missing or empty required field: "category"');
  }

  if (
    !ev.mode ||
    typeof ev.mode !== 'string' ||
    !EVENT_MODES.includes(ev.mode as (typeof EVENT_MODES)[number])
  ) {
    errors.push(`Field "mode" must be one of: ${EVENT_MODES.join(', ')}`);
  }

  if (!isValidDateString(ev.event_date)) {
    errors.push('Required field "event_date" must be a valid date in YYYY-MM-DD format');
  }

  if (ev.end_date !== undefined && !isValidDateString(ev.end_date)) {
    errors.push('Optional field "end_date" must be a valid date in YYYY-MM-DD format');
  }

  if (isValidDateString(ev.end_date) && isValidDateString(ev.event_date)) {
    if (ev.end_date < ev.event_date) {
      errors.push(`"end_date" (${ev.end_date}) cannot be earlier than "event_date" (${ev.event_date})`);
    }
  }

  if (
    ev.registration_deadline !== undefined &&
    !isValidDateString(ev.registration_deadline)
  ) {
    errors.push(
      'Optional field "registration_deadline" must be a valid date in YYYY-MM-DD format'
    );
  }

  if (
    isValidDateString(ev.registration_deadline) &&
    isValidDateString(ev.event_date) &&
    ev.registration_deadline > ev.event_date
  ) {
    errors.push(
      `"registration_deadline" (${ev.registration_deadline}) cannot be later than "event_date" (${ev.event_date})`
    );
  }

  const optionalStringFields = [
    'city',
    'venue',
    'fee',
    'contact_email'
  ] as const;
  for (const field of optionalStringFields) {
    if (ev[field] !== undefined && typeof ev[field] !== 'string') {
      errors.push(`Optional field "${field}" must be a string`);
    }
  }

  const urlFields = ['registration_url', 'website', 'banner_url', 'logo_url'] as const;
  for (const field of urlFields) {
    const value = ev[field];
    if (value !== undefined && (typeof value !== 'string' || !isHttpUrl(value))) {
      errors.push(`Optional field "${field}" must be a valid HTTP(S) URL`);
    }
  }

  if (ev.tags !== undefined) {
    if (!Array.isArray(ev.tags) || ev.tags.some((tag) => typeof tag !== 'string')) {
      errors.push('Optional field "tags" must be an array of strings');
    }
  }

  if (ev.stages !== undefined) {
    if (!Array.isArray(ev.stages)) {
      errors.push('Optional field "stages" must be an array');
    } else {
      ev.stages.forEach((stage, index) => {
        if (!stage || typeof stage !== 'object') {
          errors.push(`Stage ${index + 1} must be an object`);
          return;
        }

        const value = stage as Record<string, unknown>;
        if (typeof value.name !== 'string' || !value.name.trim()) {
          errors.push(`Stage ${index + 1} must have a non-empty "name"`);
        }
        if (!isValidDateString(value.date)) {
          errors.push(`Stage ${index + 1} must have a valid "date" in YYYY-MM-DD format`);
        }
        if (
          value.mode !== undefined &&
          (typeof value.mode !== 'string' ||
            !EVENT_MODES.includes(value.mode as (typeof EVENT_MODES)[number]))
        ) {
          errors.push(`Stage ${index + 1} has an invalid "mode"`);
        }
        if (value.venue !== undefined && typeof value.venue !== 'string') {
          errors.push(`Stage ${index + 1} field "venue" must be a string`);
        }
      });
    }
  }

  // Offline / Hybrid venue requirement check
  if ((ev.mode === 'Offline' || ev.mode === 'Hybrid') && !ev.city && !ev.venue) {
    errors.push(`Events with mode "${ev.mode}" should specify either "city" or "venue"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates a Google Calendar event URL for an event
 */
export function generateGoogleCalendarUrl(event: EventItem): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nOrganizer: ${event.organizer}\nRegistration: ${event.registration_url || 'N/A'}\nDiscovered via Eventsapiens (https://codesapiens.in)`
  );
  const location = encodeURIComponent([event.venue, event.city].filter(Boolean).join(', ') || event.mode);

  // Format dates: YYYYMMDD
  const start = event.event_date.replace(/-/g, '');
  let end = start;
  if (event.end_date) {
    // Google Calendar full-day events require end date + 1 day
    const [y, m, d] = event.end_date.split('-').map(Number);
    const endDateObj = new Date(Date.UTC(y, m - 1, d + 1));
    const ey = endDateObj.getUTCFullYear();
    const em = String(endDateObj.getUTCMonth() + 1).padStart(2, '0');
    const ed = String(endDateObj.getUTCDate()).padStart(2, '0');
    end = `${ey}${em}${ed}`;
  } else {
    const [y, m, d] = event.event_date.split('-').map(Number);
    const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
    const ny = nextDate.getUTCFullYear();
    const nm = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    const nd = String(nextDate.getUTCDate()).padStart(2, '0');
    end = `${ny}${nm}${nd}`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
}

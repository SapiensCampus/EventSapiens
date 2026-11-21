/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'bun:test';
import { sanitizeExternalUrl, getRegistrationStatus, formatDateRange, filterEvents } from '../src/lib/event-utils';
import type { EventItem } from '../src/types/event';

describe('sanitizeExternalUrl', () => {
  it('allows valid HTTPS URLs', () => {
    expect(sanitizeExternalUrl('https://example.com/register')).toBe('https://example.com/register');
  });

  it('allows valid HTTP URLs', () => {
    expect(sanitizeExternalUrl('http://example.com/event')).toBe('http://example.com/event');
  });

  it('rejects javascript: pseudo-protocol', () => {
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects data: URIs', () => {
    expect(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('handles empty and undefined gracefully', () => {
    expect(sanitizeExternalUrl(undefined)).toBeUndefined();
    expect(sanitizeExternalUrl('')).toBeUndefined();
  });
});

describe('formatDateRange', () => {
  it('formats single day date correctly', () => {
    expect(formatDateRange('2026-11-10')).toBe('Nov 10, 2026');
  });

  it('formats same month multi-day range correctly', () => {
    expect(formatDateRange('2026-11-10', '2026-11-12')).toBe('Nov 10 – 12, 2026');
  });
});

describe('getRegistrationStatus', () => {
  it('correctly marks past deadline as Closed', () => {
    expect(getRegistrationStatus('2026-10-25', '2026-11-10', '2026-10-31')).toBe('Closed');
  });

  it('correctly marks deadline within 3 days as Closing Soon', () => {
    expect(getRegistrationStatus('2026-11-02', '2026-11-10', '2026-10-31')).toBe('Closing Soon');
  });
});

describe('filterEvents', () => {
  const events = [
    { id: 'crimeathon', title: 'CRIMEATHON 2026', organizer: 'SIMATS', description: 'Cyber hackathon', city: 'Chennai', category: 'Hackathon', mode: 'Offline', event_date: '2026-11-20' },
    { id: 'hacksprint', title: 'HackSprint 3.0', organizer: 'KPR', description: 'Build bold', city: 'Coimbatore', category: 'Hackathon', mode: 'Offline', event_date: '2026-11-25' }
  ] as EventItem[];
  const search = (query: string) =>
    filterEvents(events, query, 'all', 'all', 'all', '2026-11-15').map((ev) => ev.id);

  it('matches a single word in any field', () => {
    expect(search('hackathon')).toEqual(['crimeathon', 'hacksprint']);
    expect(search('chennai')).toEqual(['crimeathon']);
  });

  it('matches multi-word queries spread across different fields', () => {
    expect(search('Hackathon Chennai')).toEqual(['crimeathon']);
    expect(search('CRIMEATHON 2026 Chennai')).toEqual(['crimeathon']);
  });

  it('requires every word to match', () => {
    expect(search('CRIMEATHON Coimbatore')).toEqual([]);
  });
});

describe('filterEvents city filter', () => {
  const events = [
    { id: 'crimeathon', title: 'CRIMEATHON 2026', organizer: 'SIMATS', description: 'Cyber hackathon', city: 'Chennai', category: 'Hackathon', mode: 'Offline', event_date: '2026-11-20' },
    { id: 'hacksprint', title: 'HackSprint 3.0', organizer: 'KPR', description: 'Build bold', city: 'Coimbatore', category: 'Hackathon', mode: 'Offline', event_date: '2026-11-25' },
    { id: 'hackindia', title: 'HackIndia Chennai Overdrive', organizer: 'Muthayammal', description: 'Hackathon', city: 'Rasipuram', category: 'Hackathon', mode: 'Offline', event_date: '2026-11-26' },
    { id: 'webinar', title: 'Open Source Webinar', organizer: 'FOSS Club', description: 'Online talk', category: 'Workshop', mode: 'Online', event_date: '2026-11-28' }
  ] as EventItem[];
  const byCity = (city: string, query = '') =>
    filterEvents(events, query, 'all', 'all', 'all', '2026-11-15', city).map((ev) => ev.id);

  it('keeps every event when no city is selected', () => {
    expect(byCity('all')).toEqual(['crimeathon', 'hacksprint', 'hackindia', 'webinar']);
  });

  it('matches the event city only, plus online events', () => {
    expect(byCity('Chennai')).toEqual(['crimeathon', 'webinar']);
    expect(byCity('coimbatore')).toEqual(['hacksprint', 'webinar']);
  });

  it('combines the city with the search text', () => {
    expect(byCity('Chennai', 'CRIMEATHON 2026')).toEqual(['crimeathon']);
  });
});

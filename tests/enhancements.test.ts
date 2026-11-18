/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'bun:test';
import { sanitizeExternalUrl, validateEventData, getRegistrationStatus, formatDateRange } from '../src/lib/event-utils';

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

  it('rejects URLs with embedded credentials', () => {
    expect(sanitizeExternalUrl('https://user:pass@example.com/register')).toBeUndefined();
  });

  it('rejects URLs containing control characters', () => {
    expect(sanitizeExternalUrl('https://example.com/\nregister')).toBeUndefined();
  });

  it('handles empty and undefined gracefully', () => {
    expect(sanitizeExternalUrl(undefined)).toBeUndefined();
    expect(sanitizeExternalUrl('')).toBeUndefined();
  });
});

describe('validateEventData hardening', () => {
  const validEvent = {
    title: 'Campus Hackathon',
    description: 'A 24-hour hackathon.',
    organizer: 'CEG Tech Forum',
    category: 'Hackathon',
    mode: 'Online',
    event_date: '2026-11-14',
    registration_url: 'https://example.com/register'
  };

  it('accepts a well-formed event', () => {
    expect(validateEventData(validEvent).valid).toBe(true);
  });

  it('rejects registration URLs that embed credentials', () => {
    const result = validateEventData({
      ...validEvent,
      registration_url: 'https://user:pass@example.com/register'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('registration_url');
  });

  it('rejects oversized free-text fields', () => {
    const result = validateEventData({
      ...validEvent,
      title: 'x'.repeat(121),
      description: 'y'.repeat(4001)
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects excessive and oversized tags', () => {
    const result = validateEventData({
      ...validEvent,
      tags: Array.from({ length: 25 }, () => 'tag'),
      city: 'z'.repeat(101)
    });
    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('tags');
  });

  it('rejects excessive stages', () => {
    const stages = Array.from({ length: 21 }, () => ({ name: 'Round', date: '2026-11-14' }));
    expect(validateEventData({ ...validEvent, stages }).valid).toBe(false);
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

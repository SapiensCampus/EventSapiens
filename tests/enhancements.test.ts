/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'bun:test';
import { sanitizeExternalUrl, getRegistrationStatus, formatDateRange } from '../src/lib/event-utils';

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

describe('useGitHubContributors', () => {
  it('exports a hook function', async () => {
    const { useGitHubContributors } = await import('../src/hooks/useGitHubContributors');
    expect(typeof useGitHubContributors).toBe('function');
  });
});

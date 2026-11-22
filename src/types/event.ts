/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export type EventMode = 'Online' | 'Offline' | 'Hybrid';

interface EventStage {
  name: string; // e.g. "Online Screening", "Offline Grand Finale"
  date: string; // YYYY-MM-DD
  mode?: EventMode;
  venue?: string;
}

export interface RawEventToml {
  title: string;
  description: string;
  organizer: string;
  category: string;
  mode: EventMode;
  event_date: string; // YYYY-MM-DD (start date)
  end_date?: string; // YYYY-MM-DD (optional)
  registration_deadline?: string; // YYYY-MM-DD (optional)
  registration_url?: string;
  city?: string;
  venue?: string;
  tags?: string[];
  banner_url?: string;
  logo_url?: string;
  contact_email?: string;
  fee?: string; // e.g. "Free", "₹150 / Team"
  stages?: EventStage[];
  website?: string;
  // Map coordinates (optional — added when geocoding is available)
  latitude?: number;
  longitude?: number;
}

export interface EventItem extends RawEventToml {
  id: string;
}

export type RegistrationStatus = 'Open' | 'Closing Soon' | 'Closed' | 'Not Specified';

export interface MonthGroup {
  key: string; // e.g. "2026-10", "2026-11"
  label: string; // e.g. "October 2026", "November 2026"
  isThisMonth: boolean;
  events: EventItem[];
}

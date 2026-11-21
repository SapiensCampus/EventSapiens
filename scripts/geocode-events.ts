/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * Automated Geocoding Script
 * Usage:
 *   npx tsx scripts/geocode-events.ts
 *
 * Scans all /events/*.toml files. If any file has city/venue but lacks
 * latitude/longitude, it queries Nominatim (free) and automatically writes
 * the coordinates into the TOML file!
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'smol-toml';

const EVENTS_DIR = path.resolve(process.cwd(), 'events');

async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'EventSapiens-BuildScript/1.0 (eventsapiens.tech)',
      },
    });
    if (!res.ok) return null;
    const data: { lat: string; lon: string }[] = await res.json();
    if (!data?.length) return null;
    return {
      lat: Math.round(parseFloat(data[0].lat) * 10000) / 10000,
      lng: Math.round(parseFloat(data[0].lon) * 10000) / 10000,
    };
  } catch {
    return null;
  }
}

async function run() {
  console.log(`[EventSapiens Geocoder] Scanning ${EVENTS_DIR}...`);

  if (!fs.existsSync(EVENTS_DIR)) {
    console.error(`Events directory not found!`);
    return;
  }

  const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.toml') && !f.startsWith('_'));
  let updatedCount = 0;

  for (const filename of files) {
    const filePath = path.join(EVENTS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      const parsed = parse(content) as Record<string, unknown>;

      // Skip online events or events that already have coordinates
      if (parsed.mode === 'Online') continue;
      if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        continue;
      }

      const city = typeof parsed.city === 'string' ? parsed.city.trim() : '';
      const venue = typeof parsed.venue === 'string' ? parsed.venue.trim() : '';

      if (!city && !venue) {
        console.warn(`⚠️  ${filename}: Offline event has no city or venue to geocode.`);
        continue;
      }

      console.log(`🔍 Geocoding ${filename} (${venue || city})...`);

      // Try venue first for pinpoint accuracy, then fallback to city
      const query = venue ? `${venue}, ${city}, Tamil Nadu, India` : `${city}, Tamil Nadu, India`;
      let coords = await geocodeLocation(query);

      // Fallback to city only if venue was too specific or failed
      if (!coords && venue && city) {
        coords = await geocodeLocation(`${city}, Tamil Nadu, India`);
      }

      if (!coords) {
        console.warn(`❌ Could not resolve coordinates for ${filename}`);
        continue;
      }

      console.log(`✅ Found: [${coords.lat}, ${coords.lng}] for ${filename}`);

      // Append latitude and longitude to TOML file
      const updatedContent = `${content.trimEnd()}\nlatitude = ${coords.lat}\nlongitude = ${coords.lng}\n`;
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
      updatedCount++;

      // Polite rate limit for Nominatim API (1 request per second)
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error(`Error processing ${filename}:`, err);
    }
  }

  console.log(`\n🎉 Geocoding complete. Updated ${updatedCount} event file(s).`);
}

run();

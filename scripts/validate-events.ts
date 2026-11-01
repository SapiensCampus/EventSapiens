/**
 * @license
 * SPDX-License-Identifier: MIT
 *
 * Event Validation Script for CI and Pull Requests
 * Usage:
 *   npx tsx scripts/validate-events.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'smol-toml';
import { validateEventData } from '../src/lib/event-utils';
import { runArchiver } from './archive-events';

const EVENTS_DIR = path.resolve(process.cwd(), 'events');
const ARCHIVE_FILE = path.resolve(process.cwd(), 'src/data/archived.json');

export interface ValidationSummary {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  errorsByFile: Record<string, string[]>;
}

export function validateAllEvents(autoArchive = true): ValidationSummary {
  if (autoArchive) {
    try {
      runArchiver(false);
    } catch (err) {
      console.warn('[Eventsapiens Validator] Auto-archive notice:', err);
    }
  }
  console.log(`[Eventsapiens Validator] Inspecting event TOML files in ${EVENTS_DIR}...`);

  if (!fs.existsSync(EVENTS_DIR)) {
    console.error(`Events directory not found!`);
    return {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 1,
      errorsByFile: { events: ['Events directory not found'] }
    };
  }

  // Load archived IDs to prevent collision
  const archivedIds = new Set<string>();
  const archiveErrors: string[] = [];
  if (fs.existsSync(ARCHIVE_FILE)) {
    try {
      const archived: unknown = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf-8'));
      if (!Array.isArray(archived)) {
        archiveErrors.push('Archive root must be an array');
      } else {
        archived.forEach((event, index) => {
          const validation = validateEventData(event);
          const id =
            event && typeof event === 'object' && 'id' in event
              ? (event as { id?: unknown }).id
              : undefined;

          if (typeof id !== 'string' || !id) {
            validation.errors.push('Archived event must have a non-empty string "id"');
          } else if (archivedIds.has(id)) {
            validation.errors.push(`Duplicate archived event id "${id}"`);
          } else {
            archivedIds.add(id);
          }

          archiveErrors.push(
            ...validation.errors.map((error) => `Entry ${index + 1}: ${error}`)
          );
        });
      }
    } catch (error) {
      archiveErrors.push(
        `Could not parse archive JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    archiveErrors.push('Archive file not found');
  }

  const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.toml') && !f.startsWith('_'));
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();

  const errorsByFile: Record<string, string[]> = {};
  if (archiveErrors.length > 0) {
    errorsByFile['src/data/archived.json'] = archiveErrors;
  }
  let validFiles = 0;
  let invalidFiles = archiveErrors.length > 0 ? 1 : 0;

  for (const filename of files) {
    const filePath = path.join(EVENTS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const slug = filename.replace(/\.toml$/, '');
    const fileErrors: string[] = [];

    // Check filename format (kebab-case)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      fileErrors.push(
        `Filename "${filename}" should only contain lowercase alphanumeric characters and hyphens (e.g. college-hackathon.toml)`
      );
    }

    // Check slug collision
    if (seenIds.has(slug)) {
      fileErrors.push(`Duplicate slug detected: "${slug}" is used by multiple event files`);
    }
    seenIds.add(slug);

    if (archivedIds.has(slug)) {
      fileErrors.push(`Slug "${slug}" already exists in src/data/archived.json`);
    }

    // Parse TOML
    try {
      const parsed = parse(content);
      const valResult = validateEventData(parsed, filename);

      if (!valResult.valid) {
        fileErrors.push(...valResult.errors);
      } else {
        const event = parsed as Record<string, unknown>;
        const title = typeof event.title === 'string' ? event.title : '';
        const titleKey = title.trim().toLowerCase();
        if (titleKey && seenTitles.has(titleKey)) {
          fileErrors.push(
            `Duplicate title detected: Another active event shares the exact title "${title}"`
          );
        }
        seenTitles.add(titleKey);
      }
    } catch (error) {
      fileErrors.push(
        `TOML syntax error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (fileErrors.length > 0) {
      invalidFiles++;
      errorsByFile[filename] = fileErrors;
    } else {
      validFiles++;
    }
  }

  console.log(`\nValidation complete:`);
  console.log(`- Total active events: ${files.length}`);
  console.log(`- Valid events: ${validFiles}`);
  console.log(`- Invalid events: ${invalidFiles}\n`);

  if (invalidFiles > 0) {
    console.error('Errors found in event files:');
    for (const [file, errs] of Object.entries(errorsByFile)) {
      console.error(`\n📄 events/${file}:`);
      errs.forEach((err) => console.error(`   ❌ ${err}`));
    }
  } else {
    console.log('✅ All event TOML files passed schema and integrity validation!');
  }

  return {
    totalFiles: files.length,
    validFiles,
    invalidFiles,
    errorsByFile
  };
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  const result = validateAllEvents();
  if (result.invalidFiles > 0) {
    process.exit(1);
  }
}

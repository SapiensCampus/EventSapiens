import type { RawEventToml } from '../types/event';

function escapeTomlString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

export function createEventSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function serializeEventToToml(event: RawEventToml): string {
  const line = (key: string, value: string) => `${key} = "${escapeTomlString(value)}"`;
  const output: Array<string | undefined> = [
    line('title', event.title),
    line('description', event.description),
    line('organizer', event.organizer),
    line('category', event.category),
    line('mode', event.mode),
    line('event_date', event.event_date),
    event.end_date ? line('end_date', event.end_date) : undefined,
    event.registration_deadline
      ? line('registration_deadline', event.registration_deadline)
      : undefined,
    event.registration_url ? line('registration_url', event.registration_url) : undefined,
    event.city ? line('city', event.city) : undefined,
    event.venue ? line('venue', event.venue) : undefined,
    event.fee ? line('fee', event.fee) : undefined,
    event.tags?.length
      ? `tags = [${event.tags.map((tag) => `"${escapeTomlString(tag)}"`).join(', ')}]`
      : undefined
  ];

  if (event.stages?.length) {
    for (const stage of event.stages) {
      output.push('');
      output.push('[[stages]]');
      output.push(line('name', stage.name));
      output.push(line('date', stage.date));
      if (stage.mode) output.push(line('mode', stage.mode));
      if (stage.venue) output.push(line('venue', stage.venue));
    }
  }

  return output.filter((value): value is string => value !== undefined).join('\n');
}

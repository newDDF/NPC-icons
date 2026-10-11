import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

export function getIcons(options = {}) {
  let icons = load('data/icons.json');

  if (options.format) {
    icons = icons.filter(icon => icon.format === options.format);
  }

  if (options.category) {
    icons = icons.filter(icon =>
      icon.category.some(c => c.toLowerCase() === options.category.toLowerCase())
    );
  }

  return icons;
}

export function getIcon(name, format) {
  const icons = getIcons();
  const matches = icon =>
    icon.id === name || icon.name.toLowerCase() === String(name).toLowerCase();

  return icons.find(icon => matches(icon) && icon.format === (format || 'svg'))
    ?? (format ? null : icons.find(matches))
    ?? null;
}

export function searchIcons(query) {
  const term = String(query ?? '').trim().toLowerCase();
  if (!term) return [];

  return getIcons().filter(icon =>
    icon.name.toLowerCase().includes(term) ||
    icon.info.toLowerCase().includes(term) ||
    icon.category.some(c => c.toLowerCase().includes(term))
  );
}

export function getIconSvg(name) {
  const icon = getIcon(name, 'svg');
  if (!icon) return null;

  const file = path.resolve(root, icon.path);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
}

export function getStats() {
  return load('data/stats.json');
}

const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const configPath = path.join(root, 'config.json');
const registryPath = path.join(root, 'data/id-registry.json');
const aliasesPath = path.join(root, 'data/legacy-id-map.json');

function fail(message) {
  throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temporary, file);
}

function slugify(value) {
  return value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'icon';
}

function expectedFilename(icon) {
  const cleanName = icon.format === 'png'
    ? icon.name.replace('-png', '')
    : icon.name;

  return cleanName + '.' + icon.format;
}

function main() {
  for (const file of [configPath, registryPath, aliasesPath]) {
    if (!fs.existsSync(file)) fail('Missing required file: ' + file);
  }

  const config = readJson(configPath);
  const registry = readJson(registryPath);
  const aliasMap = readJson(aliasesPath);

  if (!Array.isArray(config)) fail('config.json must contain an array.');
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.records)) {
    fail('Invalid ID registry schema.');
  }
  if (!/^\d{6}$/.test(registry.nextId || '')) {
    fail('Invalid registry nextId.');
  }
  if (aliasMap.schemaVersion !== 1 ||
      !aliasMap.mappings ||
      Array.isArray(aliasMap.mappings) ||
      typeof aliasMap.mappings !== 'object') {
    fail('Invalid legacy alias map schema.');
  }

  const records = registry.records;
  const aliases = aliasMap.mappings;
  const ids = new Set();
  const identities = new Map();
  const aliasOwners = new Map();
  let maxId = 0;

  for (const entry of records) {
    if (!entry || !/^\d{6}$/.test(entry.id || '') ||
        !['svg', 'png'].includes(entry.format) ||
        typeof entry.name !== 'string' ||
        !entry.name.trim() ||
        typeof entry.filename !== 'string' ||
        !entry.filename.trim() ||
        !['active', 'retired'].includes(entry.status)) {
      fail('Invalid registry record: ' + JSON.stringify(entry));
    }

    if (ids.has(entry.id)) fail('Duplicate permanent ID: ' + entry.id);

    const key = JSON.stringify([entry.name, entry.format, entry.filename]);
    if (identities.has(key)) fail('Duplicate registry identity: ' + key);

    ids.add(entry.id);
    identities.set(key, entry);
    maxId = Math.max(maxId, Number(entry.id));
  }

  if (Number(registry.nextId) <= maxId) {
    fail('nextId must exceed every assigned ID.');
  }

  for (const [alias, id] of Object.entries(aliases)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(alias)) {
      fail('Invalid legacy alias: ' + alias);
    }
    if (!ids.has(id)) fail('Alias points to unknown ID: ' + alias);
    if (/^\d{6}$/.test(alias)) fail('Alias conflicts with numeric ID: ' + alias);
    aliasOwners.set(alias, id);
  }

  for (const entry of records) {
    if (![...aliasOwners.values()].includes(entry.id)) {
      fail('Registry ID has no legacy alias: ' + entry.id);
    }
  }

  const configKeys = new Set();
  const pending = [];
  const activeKeys = new Set();

  for (const icon of config) {
    if (!icon || typeof icon.name !== 'string' || !icon.name.trim()) {
      fail('Every config entry must have a non-empty name.');
    }
    if (!['svg', 'png'].includes(icon.format)) {
      fail('Unsupported format for ' + icon.name + ': ' + icon.format);
    }

    const filename = expectedFilename(icon);
    const identity = JSON.stringify([icon.name, icon.format, filename]);

    if (configKeys.has(identity)) fail('Duplicate config entry: ' + identity);
    configKeys.add(identity);

    const assetPath = path.join(
      root,
      'icons',
      icon.format,
      filename
    );

    if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
      fail('Missing icon asset: ' + path.relative(root, assetPath));
    }

    if (icon.format === 'svg') {
      const content = fs.readFileSync(assetPath, 'utf8');
      if (!/<svg[\s>]/i.test(content)) {
        fail('Invalid SVG asset: ' + path.relative(root, assetPath));
      }
    }

    const key = JSON.stringify([icon.name, icon.format, filename]);
    const existing = identities.get(key);

    if (existing) {
      if (existing.status !== 'active') {
        fail('Retired icon cannot be reactivated automatically: ' + icon.name);
      }
      activeKeys.add(key);
      continue;
    }

    const alias = slugify(icon.name) + '-' + icon.format;
    if (aliasOwners.has(alias)) {
      fail('Legacy alias already exists: ' + alias);
    }

    pending.push({ icon, filename, key, alias });
    activeKeys.add(key);
  }

  for (const entry of records) {
    const key = JSON.stringify([entry.name, entry.format, entry.filename]);
    if (entry.status === 'active' && !activeKeys.has(key)) {
      fail('Active registry icon is missing from config.json: ' + entry.id);
    }
  }

  if (pending.length === 0) {
    console.log('Icon registry is up to date. No new IDs required.');
    return;
  }

  let next = Number(registry.nextId);

  for (const item of pending) {
    if (next > 999999) fail('Permanent ID space exhausted.');

    const id = String(next).padStart(6, '0');
    if (ids.has(id)) fail('Generated ID already exists: ' + id);

    records.push({
      id,
      name: item.icon.name,
      format: item.icon.format,
      filename: item.filename,
      status: 'active'
    });

    aliases[item.alias] = id;
    ids.add(id);
    identities.set(item.key, records[records.length - 1]);
    aliasOwners.set(item.alias, id);

    console.log('Registered ' + item.icon.name + ' (' +
      item.icon.format + ') => ' + id + ' [' + item.alias + ']');

    next++;
  }

  registry.nextId = String(next).padStart(6, '0');

  writeJson(registryPath, registry);
  writeJson(aliasesPath, aliasMap);

  console.log('Registered ' + pending.length + ' new icon(s).');
  console.log('Next available ID: ' + registry.nextId);
}

try {
  main();
} catch (error) {
  console.error('\nICON REGISTRATION FAILED');
  console.error(error.stack || error);
  process.exitCode = 1;
}

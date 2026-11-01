const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const publicDir = path.join(root, 'public');
const packageDir = path.join(root, 'packages', 'npc-icons');

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

const icons = readJson(path.join(publicDir, 'data', 'icons.json'));
const stats = readJson(path.join(publicDir, 'data', 'stats.json'));

function slugify(value) {
  const slug = value.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'icon';
}

const registryPath = path.join(root, 'data', 'id-registry.json');
const legacyMapPath = path.join(root, 'data', 'legacy-id-map.json');
const registry = readJson(registryPath);
const legacyMap = readJson(legacyMapPath);
const legacyMappings = legacyMap && legacyMap.mappings;

if (!registry || registry.schemaVersion !== 1 || !Array.isArray(registry.records)) {
  throw new Error('Invalid permanent ID registry schema.');
}
if (typeof registry.nextId !== 'string' || !/^\d{6}$/.test(registry.nextId)) {
  throw new Error('Invalid registry nextId: expected a six-digit string.');
}
if (!legacyMap || legacyMap.schemaVersion !== 1 || !legacyMappings ||
    typeof legacyMappings !== 'object' || Array.isArray(legacyMappings)) {
  throw new Error('Invalid legacy ID mapping schema.');
}

const permanentIds = new Set();
const registryByKey = new Map();
let maxNumericId = 0;

for (const entry of registry.records) {
  if (!entry || typeof entry.id !== 'string' || !/^\d{6}$/.test(entry.id)) {
    throw new Error('Invalid permanent ID format: ' + (entry && entry.id));
  }
  if (permanentIds.has(entry.id)) {
    throw new Error('Duplicate permanent ID: ' + entry.id);
  }
  if (!['active', 'retired'].includes(entry.status)) {
    throw new Error('Invalid registry status for ID ' + entry.id + ': ' + entry.status);
  }
  if (typeof entry.name !== 'string' || !entry.name.trim() ||
      !['svg', 'png'].includes(entry.format) ||
      typeof entry.filename !== 'string' || !entry.filename.trim()) {
    throw new Error('Invalid registry identity fields for ID: ' + entry.id);
  }

  permanentIds.add(entry.id);
  maxNumericId = Math.max(maxNumericId, Number(entry.id));

  const key = JSON.stringify([entry.name, entry.format, entry.filename]);
  if (registryByKey.has(key)) throw new Error('Duplicate registry identity: ' + key);
  registryByKey.set(key, entry);
}

if (Number(registry.nextId) <= maxNumericId) {
  throw new Error('Registry nextId must exceed every assigned ID.');
}

const aliasesByPermanentId = new Map();
for (const [legacyId, permanentId] of Object.entries(legacyMappings)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(legacyId)) {
    throw new Error('Invalid legacy ID alias: ' + legacyId);
  }
  if (typeof permanentId !== 'string' || !permanentIds.has(permanentId)) {
    throw new Error('Legacy mapping points to unknown permanent ID: ' +
      legacyId + ' -> ' + permanentId);
  }
  if (/^\d{6}$/.test(legacyId)) {
    throw new Error('Legacy alias conflicts with numeric route: ' + legacyId);
  }

  const aliases = aliasesByPermanentId.get(permanentId) || [];
  aliases.push(legacyId);
  aliasesByPermanentId.set(permanentId, aliases);
}

for (const entry of registry.records) {
  if (!aliasesByPermanentId.has(entry.id) || aliasesByPermanentId.get(entry.id).length === 0) {
    throw new Error('Registry ID has no legacy alias: ' + entry.id);
  }
}

const seenPermanentIds = new Set();
const records = icons.map(icon => {
  const filename = path.basename(icon.path);
  const assetPath = icon.path.replace(/^\.\/assets\//, '');
  const key = JSON.stringify([icon.name, icon.format, filename]);
  const entry = registryByKey.get(key);

  if (!entry) throw new Error('No permanent ID registered for icon: ' + key);
  if (entry.status !== 'active') {
    throw new Error('Build data contains non-active registry ID: ' + entry.id);
  }
  if (seenPermanentIds.has(entry.id)) {
    throw new Error('Duplicate permanent ID in build data: ' + entry.id);
  }
  seenPermanentIds.add(entry.id);

  const legacyIds = aliasesByPermanentId.get(entry.id) || [];
  const legacyId = legacyIds[0] || '';
  const url = '/assets/' + assetPath;

  return {
    ...icon,
    id: entry.id,
    status: 'active',
    legacyId,
    legacyIds,
    filename,
    path: url,
    url,
    apiUrl: '/api/icons/' + entry.id + '.json',
    legacyApiUrl: legacyId ? '/api/icons/' + legacyId + '.json' : ''
  };
});

const activeRegistryIds = new Set(
  registry.records.filter(entry => entry.status === 'active').map(entry => entry.id)
);
for (const id of activeRegistryIds) {
  if (!seenPermanentIds.has(id)) {
    throw new Error('Active registry ID missing from build data: ' + id);
  }
}
if (seenPermanentIds.size !== activeRegistryIds.size) {
  throw new Error('Active registry count does not match generated icon count.');
}

const retiredDetails = registry.records
  .filter(entry => entry.status === 'retired')
  .map(entry => {
    const legacyIds = aliasesByPermanentId.get(entry.id) || [];
    const legacyId = legacyIds[0] || '';
    return {
      id: entry.id,
      status: 'retired',
      name: entry.name,
      format: entry.format,
      color: 'none',
      source: '',
      info: 'This icon has been retired and is no longer available for download.',
      category: [],
      origin: null,
      by: null,
      updatedAt: null,
      filename: entry.filename,
      path: '',
      url: '',
      apiUrl: '/api/icons/' + entry.id + '.json',
      legacyId,
      legacyIds,
      legacyApiUrl: legacyId ? '/api/icons/' + legacyId + '.json' : ''
    };
  });

const detailRecords = records.concat(retiredDetails);
const detailByPermanentId = new Map(detailRecords.map(icon => [icon.id, icon]));
for (const entry of registry.records) {
  if (!detailByPermanentId.has(entry.id)) {
    throw new Error('Registry ID has no generated detail record: ' + entry.id);
  }
}

// Keep the existing site sitemap canonical: only permanent ID routes.
const sitemapUrls = [
  '  <url><loc>https://icons.x0u0x.xyz/</loc></url>',
  ...records.map(icon =>
    '  <url><loc>https://icons.x0u0x.xyz/icons/' + encodeURIComponent(icon.id) + '/</loc></url>'
  )
];
fs.writeFileSync(
  path.join(publicDir, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.join('\n') + '\n</urlset>\n',
  'utf8'
);

// New API records use permanent IDs.
writeJson(path.join(publicDir, 'api', 'icons.json'), records);
writeJson(path.join(publicDir, 'api', 'stats.json'), stats);

writeJson(path.join(publicDir, 'data', 'icon-details.json'), detailRecords);

for (const icon of records) {
  writeJson(path.join(publicDir, 'api', 'icons', icon.id + '.json'), icon);
}
for (const icon of retiredDetails) {
  writeJson(path.join(publicDir, 'api', 'icons', icon.id + '.json'), icon);
}

let legacyApiCount = 0;
for (const icon of detailRecords) {
  for (const legacyId of icon.legacyIds || []) {
    const legacyRecord = {
      ...icon,
      id: legacyId,
      permanentId: icon.id,
      apiUrl: '/api/icons/' + legacyId + '.json',
      permanentApiUrl: icon.apiUrl
    };
    writeJson(path.join(publicDir, 'api', 'icons', legacyId + '.json'), legacyRecord);
    legacyApiCount++;
  }
}

console.log('Permanent IDs validated: ' + seenPermanentIds.size);
console.log('Retired IDs retained: ' + retiredDetails.length);
console.log('Legacy API aliases generated: ' + legacyApiCount);

// npm package data and assets
const dataDir = path.join(packageDir, 'data');
const assetsDir = path.join(packageDir, 'assets');

fs.rmSync(dataDir, { recursive: true, force: true });
fs.rmSync(assetsDir, { recursive: true, force: true });

const packageRecords = records.map(icon => {
  const source = path.join(publicDir, 'assets', icon.filename ? icon.url.replace(/^\/assets\//, '') : '');
  const relativeAsset = icon.url.replace(/^\/assets\//, '');
  const destination = path.join(assetsDir, relativeAsset);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);

  return {
    ...icon,
    path: `./assets/${relativeAsset}`,
    url: `https://icons.x0u0x.xyz${icon.url}`,
    apiUrl: `https://icons.x0u0x.xyz${icon.apiUrl}`
  };
});

writeJson(path.join(dataDir, 'icons.json'), packageRecords);
writeJson(path.join(dataDir, 'stats.json'), stats);

console.log(`API generated: ${records.length} icons`);
console.log(`npm package assets generated: ${packageRecords.length} icons`);
console.log(`SVG: ${stats.svg}, PNG: ${stats.png}`);

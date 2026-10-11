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

const usedIds = new Set();

const records = icons.map(icon => {
  const filename = path.basename(icon.path);
  const assetPath = icon.path.replace(/^\.\/assets\//, '');
  const baseId = `${slugify(icon.name)}-${icon.format}`;
  let id = baseId;

  if (usedIds.has(id)) {
    const hash = crypto.createHash('sha1')
      .update(`${icon.name}|${icon.format}|${filename}`)
      .digest('hex').slice(0, 8);
    id = `${baseId}-${hash}`;
  }

  if (usedIds.has(id)) {
    throw new Error(`Icon ID collision: ${id}`);
  }
  usedIds.add(id);

  const url = `/assets/${assetPath}`;

  return {
    ...icon,
    id,
    filename,
    path: url,
    url,
    apiUrl: `/api/icons/${id}.json`
  };
});

// Static JSON API
writeJson(path.join(publicDir, 'api', 'icons.json'), records);
writeJson(path.join(publicDir, 'api', 'stats.json'), stats);

for (const icon of records) {
  writeJson(
    path.join(publicDir, 'api', 'icons', `${icon.id}.json`),
    icon
  );
}

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

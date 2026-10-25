const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'npc-icons-retirement-'));
const project = path.join(temp, 'project');
let passed = 0;

function check(label, fn) {
  fn();
  passed++;
  console.log('PASS ' + label);
}

function json(file) {
  return JSON.parse(fs.readFileSync(path.join(project, file), 'utf8'));
}

function run(file, args = []) {
  cp.execFileSync(process.execPath, [path.join(project, file), ...args], {
    cwd: project,
    stdio: 'inherit'
  });
}

try {
  fs.mkdirSync(project);

  const excluded = new Set([
    '.git', 'node_modules', 'dist', 'public', '.astro', 'tests', 'FETCH_HEAD'
  ]);

  for (const name of fs.readdirSync(root)) {
    if (excluded.has(name) || /\.bak$/.test(name)) continue;
    fs.cpSync(path.join(root, name), path.join(project, name), {
      recursive: true,
      dereference: false
    });
  }

  fs.symlinkSync(path.join(root, 'node_modules'), path.join(project, 'node_modules'), 'dir');

  const registry = json('data/id-registry.json');
  const legacy = json('data/legacy-id-map.json');
  const config = json('config.json');

  const target = registry.records.find(record => record.status === 'active');
  assert(target, 'No active registry entry');

  const configIndex = config.findIndex(icon =>
    icon.name === target.name &&
    icon.format === target.format &&
    `${icon.name.replace('-png', '')}.${icon.format}` === target.filename
  );
  assert(configIndex >= 0, `Cannot match registry record ${target.id} to config.json`);

  const aliases = Object.entries(legacy.mappings)
    .filter(([, id]) => id === target.id)
    .map(([alias]) => alias);
  assert(aliases.length > 0, `No legacy alias for ${target.id}`);

  const retiredId = target.id;
  const legacyId = aliases[0];
  const originalNextId = registry.nextId;

  registry.records.find(record => record.id === retiredId).status = 'retired';
  config.splice(configIndex, 1);

  fs.writeFileSync(path.join(project, 'data/id-registry.json'), JSON.stringify(registry, null, 2) + '\n');
  fs.writeFileSync(path.join(project, 'config.json'), JSON.stringify(config, null, 2) + '\n');

  console.log('\n===== Build in isolated temporary copy =====');
  run('build.cjs');
  run('ecosystem.cjs');
  cp.execFileSync(path.join(project, 'node_modules/.bin/astro'), ['build'], {
    cwd: project,
    stdio: 'inherit'
  });

  const active = json('public/api/icons.json');
  const details = json('public/data/icon-details.json');
  const permanentApi = json(`public/api/icons/${retiredId}.json`);
  const legacyApi = json(`public/api/icons/${legacyId}.json`);
  const packageIcons = json('packages/npc-icons/data/icons.json');
  const sitemap = fs.readFileSync(path.join(project, 'public/sitemap.xml'), 'utf8');
  const retiredHtml = fs.readFileSync(
    path.join(project, `dist/icons/${retiredId}/index.html`), 'utf8'
  );
  const legacyHtml = fs.readFileSync(
    path.join(project, `dist/icons/${legacyId}/index.html`), 'utf8'
  );

  console.log('\n===== Retirement lifecycle checks =====');

  check('retired ID remains registered', () => {
    assert.equal(json('data/id-registry.json').records.find(x => x.id === retiredId).status, 'retired');
  });

  check('nextId is unchanged and remains greater than assigned IDs', () => {
    const r = json('data/id-registry.json');
    assert.equal(r.nextId, originalNextId);
    assert(Number(r.nextId) > Math.max(...r.records.map(x => Number(x.id))));
  });

  check('retired icon is absent from active API', () => {
    assert(!active.some(x => x.id === retiredId));
    assert.equal(active.length, config.length);
  });

  check('retired icon is absent from npm package data', () => {
    assert(!packageIcons.some(x => x.id === retiredId));
  });

  check('permanent API retains retired record without asset URL', () => {
    assert.equal(permanentApi.id, retiredId);
    assert.equal(permanentApi.status, 'retired');
    assert.equal(permanentApi.path, '');
    assert.equal(permanentApi.url, '');
  });

  check('legacy API preserves alias and permanent ID', () => {
    assert.equal(legacyApi.id, legacyId);
    assert.equal(legacyApi.permanentId, retiredId);
    assert.equal(legacyApi.status, 'retired');
  });

  check('detail data retains retired record', () => {
    const item = details.find(x => x.id === retiredId);
    assert(item);
    assert.equal(item.status, 'retired');
    assert.equal(item.url, '');
  });

  check('permanent detail page remains generated', () => {
    assert(retiredHtml.includes('no longer available for download'));
  });

  check('legacy detail page remains generated', () => {
    assert(legacyHtml.length > 0);
  });

  check('retired ID is excluded from sitemap', () => {
    assert(!sitemap.includes(`/icons/${retiredId}/`));
  });

  check('retired detail page has no download link', () => {
    assert(!/class="detail-primary"[^>]*download=/i.test(retiredHtml));
  });

  console.log(`\nPASS: ${passed} retirement checks`);
  console.log(`Test ID: ${retiredId}; legacy alias: ${legacyId}`);
} catch (error) {
  console.error('\nFAIL:', error.stack || error.message);
  process.exitCode = 1;
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
  console.log('Temporary test copy cleaned up.');
}

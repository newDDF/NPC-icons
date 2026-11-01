const fs = require('fs');
const path = require('path');

const root = process.cwd();
const result = { pass: [], warn: [], fail: [] };

const check = (ok, msg) =>
  result[ok ? 'pass' : 'fail'].push(msg);

const read = file =>
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const exists = file =>
  fs.existsSync(path.join(root, file));

console.log('\n===== NPC-icons 只读构建审计 v2 =====');

const required = [
  'config.json',
  'public/data/icons.json',
  'public/data/stats.json',
  'public/api/icons.json',
  'public/api/stats.json',
  'dist/index.html',
  'dist/data/icons.json',
  'dist/data/stats.json',
  'dist/api/icons.json',
  'dist/api/stats.json'
];

for (const file of required) {
  check(exists(file), `${file} ${exists(file) ? '存在' : '缺失'}`);
}

if (result.fail.length) {
  console.log('\n必要文件缺失，停止后续检查。');
} else {
  const config = read('config.json');
  const data = read('public/data/icons.json');
  const api = read('public/api/icons.json');
  const distData = read('dist/data/icons.json');
  const distApi = read('dist/api/icons.json');

  const stats = read('public/data/stats.json');
  const apiStats = read('public/api/stats.json');
  const distStats = read('dist/data/stats.json');
  const distApiStats = read('dist/api/stats.json');

  console.log('\n===== 1. 数据数量 =====');
  console.log({
    config: config.length,
    data: data.length,
    api: api.length,
    distData: distData.length,
    distApi: distApi.length,
    stats, apiStats, distStats, distApiStats
  });

  const registry = read('data/id-registry.json');
  const activeRegistryCount = registry.records.filter(record => record.status === 'active').length;
  check(config.length === activeRegistryCount, `基础配置数量与注册表活跃记录一致（${config.length}/${activeRegistryCount}）`);
  check(data.length === config.length, '基础数据数量与配置一致');
  check(api.length === data.length, 'API 数量与基础数据一致');
  check(distData.length === data.length, 'dist 基础数据数量一致');
  check(distApi.length === api.length, 'dist API 数量一致');

  for (const [label, s] of [
    ['public/data', stats],
    ['public/api', apiStats],
    ['dist/data', distStats],
    ['dist/api', distApiStats]
  ]) {
    check(
      s.total === config.length &&
      s.svg + s.png === s.total,
      `${label}统计数据自洽`
    );
  }

  console.log('\n===== 2. 基础数据与 API 共有字段 =====');
  const fields = ['name', 'color', 'format', 'source', 'info', 'category'];
  const apiByKey = new Map(
    api.map(icon => [`${icon.name}::${icon.format}`, icon])
  );

  let mismatches = [];
  for (const icon of data) {
    const key = `${icon.name}::${icon.format}`;
    const target = apiByKey.get(key);

    if (!target) {
      mismatches.push(`${key}: API 记录缺失`);
      continue;
    }

    for (const field of fields) {
      if (JSON.stringify(icon[field]) !== JSON.stringify(target[field])) {
        mismatches.push(`${key}: ${field} 不一致`);
      }
    }
  }

  check(
    mismatches.length === 0,
    `共有字段一致（${mismatches.length} 处差异）`
  );
  if (mismatches.length) console.log(mismatches.slice(0, 20));

  console.log('\n===== 3. API ID 唯一性与详情文件 =====');
  const ids = api.map(icon => icon.id);
  const invalidIds = api.filter(icon =>
    typeof icon.id !== 'string' || !icon.id.trim()
  );
  const duplicateIds = ids.filter((id, i) =>
    ids.indexOf(id) !== i
  );

  check(invalidIds.length === 0, `API ID 均有效（${invalidIds.length} 个无效）`);
  check(duplicateIds.length === 0, `API ID 无重复（${duplicateIds.length} 个重复项）`);

  let missingDetails = [];
  let missingAssets = [];
  let missingApiFiles = [];

  for (const icon of api) {
    if (!exists(`dist/api/icons/${icon.id}.json`)) {
      missingDetails.push(icon.id);
    }
    if (!icon.url || !exists(`dist${icon.url}`)) {
      missingAssets.push(icon.id);
    }
    if (!icon.apiUrl || !exists(`dist${icon.apiUrl}`)) {
      missingApiFiles.push(icon.id);
    }
  }

  check(missingDetails.length === 0, `独立 API 详情文件齐全（缺失 ${missingDetails.length}）`);
  check(missingAssets.length === 0, `图标资源齐全（缺失 ${missingAssets.length}）`);
  check(missingApiFiles.length === 0, `API 路径有效（缺失 ${missingApiFiles.length}）`);

  console.log('\n===== 4. 详情页 =====');
  const detailRoot = path.join(root, 'dist/icons');
  let pages = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name === 'index.html') pages.push(file);
    }
  }

  if (fs.existsSync(detailRoot)) walk(detailRoot);

  const expectedDetailPages = api.length * 2;

  check(
    pages.length === expectedDetailPages,
    `详情页总数 ${pages.length}/${expectedDetailPages}`
  );

  const missingPermanentPages = api.filter(icon =>
    !fs.existsSync(path.join(detailRoot, icon.id, "index.html"))
  );

  const missingLegacyPages = api.filter(icon =>
    !icon.legacyId ||
    !fs.existsSync(path.join(detailRoot, icon.legacyId, "index.html"))
  );

  check(
    missingPermanentPages.length === 0,
    `永久 ID 详情页完整（缺失 ${missingPermanentPages.length}）`
  );

  check(
    missingLegacyPages.length === 0,
    `旧 ID 兼容页完整（缺失 ${missingLegacyPages.length}）`
  );

  console.log('\n===== 5. 首页脚本 =====');
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const scripts = [...html.matchAll(
    /<script\b[^>]*\bsrc=["']([^"']+)["']/g
  )].map(match => match[1]);

  console.log('脚本引用:', scripts);

  for (const src of scripts) {
    if (/^https?:\/\//.test(src)) continue;
    const local = src.startsWith('/')
      ? `dist${src}`
      : path.join('dist', src);
    check(exists(local), `脚本文件存在：${src}`);
  }

  console.log('\n===== 汇总 =====');
  for (const key of ['pass', 'warn', 'fail']) {
    console.log(`\n${key.toUpperCase()} (${result[key].length})`);
    for (const message of result[key]) console.log('- ' + message);
  }

  console.log('\n该脚本仅检查静态文件，不代表浏览器交互已通过。');
}

if (result.fail.length) process.exitCode = 1;

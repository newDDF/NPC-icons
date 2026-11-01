const https = require('https');

const base = 'https://icons.x0u0x.xyz';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        type: res.headers['content-type'] || '',
        body
      }));
    }).on('error', reject);
  });
}

(async () => {
  console.log('===== 线上页面资源审计 =====');

  const home = await get(base + '/');
  console.log('首页 HTTP:', home.status);

  const assets = [
    ...home.body.matchAll(
      /(?:src|href)=["']([^"']*(?:_astro|assets|api)[^"']*)["']/g
    )
  ].map(m => m[1])
   .filter(url => /\.(?:js|css)(?:\?|$)/.test(url))
   .map(url => url.startsWith('http')
      ? url
      : new URL(url, base).href);

  const unique = [...new Set(assets)];
  console.log('发现 JS/CSS 资源:', unique.length);

  for (const url of unique) {
    try {
      const res = await get(url);
      console.log(
        `${res.status} | ${res.type.split(';')[0]} | ${url}`
      );

      if (res.status !== 200) continue;

      if (url.endsWith('.js')) {
        const checks = [
          ['API 请求', /api\/icons\.json|\/api\/icons/],
          ['搜索相关', /search/i],
          ['分类筛选相关', /category|filter/i],
          ['复制相关', /clipboard|copy/i]
        ];

        for (const [name, regex] of checks) {
          console.log(`  ${name}: ${regex.test(res.body) ? '发现相关代码' : '未发现关键词'}`);
        }
      }
    } catch (err) {
      console.log('请求失败:', url, err.message);
    }
  }

  console.log('\n说明：关键词未发现不一定代表功能故障，仍需结合浏览器实际操作判断。');
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

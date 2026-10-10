const fs = require('fs');
const path = require('path');

const baseIconsDir = path.join(__dirname, 'icons');
const configPath = path.join(__dirname, 'config.json');

const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(publicDir, 'data');
const assetsDir = path.join(publicDir, 'assets');
const svgDir = path.join(assetsDir, 'svg');
const pngDir = path.join(assetsDir, 'png');

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(svgDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });

// Preserve social sharing preview images across builds.
for (const ext of ['svg', 'png']) {
    const source = path.join(__dirname, 'assets', `share-preview.${ext}`);
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, path.join(assetsDir, `share-preview.${ext}`));
    }
}


if (!fs.existsSync(configPath)) {
    console.error('Missing config.json!');
    process.exit(1);
}

const iconConfig = JSON.parse(
    fs.readFileSync(configPath, 'utf8')
);

const iconList = [];
let svgCount = 0;
let pngCount = 0;

iconConfig.forEach((icon) => {
    const subFolder = icon.format === 'svg' ? 'svg' : 'png';
    const cleanRealName = icon.name.replace('-png', '');
    const filename = `${cleanRealName}.${icon.format}`;
    const filePath = path.join(baseIconsDir, subFolder, filename);

    if (!fs.existsSync(filePath)) {
        console.warn(`Missing asset: ${filePath}`);
        return;
    }

    const outputFile = path.join(
        assetsDir,
        subFolder,
        filename
    );

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');

        content = content
            .replace(/[\r\n]/g, '')
            .replace(/>\s+</g, '><')
            .trim();

        const pfx = icon.name + '-';

        content = content.replace(
            /class="([^"]+)"/g,
            (match, p1) => {
                const newCls = p1
                    .split(/\s+/)
                    .map(c => c.startsWith(pfx) ? c : pfx + c)
                    .join(' ');

                return 'class="' + newCls + '"';
            }
        );

        content = content.replace(
            /<style([^>]*)>([\s\S]*?)<\/style>/gi,
            (match, p1, p2) => {
                const rewrittenStyle = p2.replace(
                    /\.([a-zA-Z0-9_-]+)/g,
                    (m, className) =>
                        className.startsWith(pfx)
                            ? '.' + className
                            : '.' + pfx + className
                );

                return '<style' + p1 + '>' + rewrittenStyle + '</style>';
            }
        );

        fs.writeFileSync(outputFile, content, 'utf8');

        iconList.push({
            name: icon.name,
            color: icon.color || '#4a4a4a',
            format: 'svg',
            source: icon.source || '',
            info: icon.info || 'NPC-icons visual design asset.',
            category: Array.isArray(icon.category) ? icon.category : [],
            path: `./assets/svg/${filename}`
        });

        svgCount++;
    }

    if (icon.format === 'png') {
        fs.copyFileSync(filePath, outputFile);

        iconList.push({
            name: icon.name,
            color: 'none',
            format: 'png',
            source: icon.source || '',
            info: icon.info || 'NPC-icons bitmap asset.',
            category: Array.isArray(icon.category) ? icon.category : [],
            path: `./assets/png/${filename}`
        });

        pngCount++;
    }
});

fs.writeFileSync(
    path.join(dataDir, 'icons.json'),
    JSON.stringify(iconList),
    'utf8'
);

const stats = {
    total: iconList.length,
    svg: svgCount,
    png: pngCount
};

fs.writeFileSync(
    path.join(dataDir, 'stats.json'),
    JSON.stringify(stats, null, 2),
    'utf8'
);



// NPC_ICONS_SEO_FILES
fs.writeFileSync(
    path.join(publicDir, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: https://icons.x0u0x.xyz/sitemap.xml\n',
    'utf8'
);

fs.writeFileSync(
    path.join(publicDir, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '  <url><loc>https://icons.x0u0x.xyz/</loc></url>\n' +
    '</urlset>\n',
    'utf8'
);

console.log(`Build complete: ${svgCount} SVG, ${pngCount} PNG`);

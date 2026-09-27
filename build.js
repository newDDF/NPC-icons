const fs = require('fs');
const path = require('path');

const baseIconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');
const configPath = path.join(__dirname, 'config.json');
const preConfigPath = path.join(__dirname, 'pre_config.json');

const svgDir = path.join(baseIconsDir, 'svg');
const pngDir = path.join(baseIconsDir, 'png');

// --- 1. 自动生成预配置草稿 pre_config.json ---
const preConfigList = [];
if (fs.existsSync(svgDir)) {
    fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).forEach(file => {
        preConfigList.push({ name: path.basename(file, '.svg'), color: "#007aff", format: "svg", source: "", info: "NPC-icons library trademark design asset." });
    });
}
if (fs.existsSync(pngDir)) {
    fs.readdirSync(pngDir).filter(f => f.endsWith('.png')).forEach(file => {
        preConfigList.push({ name: path.basename(file, '.png'), color: "", format: "png", source: "", info: "NPC-icons library bitmapped graphic asset." });
    });
}
fs.writeFileSync(preConfigPath, JSON.stringify(preConfigList, null, 2), 'utf8');

// --- 2. 按照正式 config.json 构建网页逻辑 ---
if (!fs.existsSync(configPath)) {
    console.error("❌ 找不到正式清单配置文件 config.json！");
    process.exit(1);
}

const iconConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const iconList = [];
let svgCount = 0;
let pngCount = 0;

iconConfig.forEach((icon) => {
    const subFolder = icon.format === 'svg' ? 'svg' : 'png';
    const filename = `${icon.name}.${icon.format}`;
    const filePath = path.join(baseIconsDir, subFolder, filename);

    if (!fs.existsSync(filePath)) {
        return;
    }

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        
        // 🌟 核心修复：样式真空隔离引擎
        // 将 SVG 内部可能导致全局污染的通用类名（如 .cls-1）强行重写为带有图标名的专属类名（如 .home-cls-1）
        const prefix = `${icon.name}-`;
        
        // 匹配 class="cls-1" 并重写
        content = content.replace(/class="([^"]+)"/g, (match, p1) => {
            const newClasses = p1.split(/\s+/).map(c => c.startsWith(prefix) ? c : prefix + c).join(' ');
            return `class="${newClasses}"`;
        });
        
        // 匹配 style 标签内部的选择器（如 .cls-1 { ... }）并同步重写
        content = content.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, p1, p2) => {
            const rewrittenStyle = p2.replace(/\.([a-zA-Z0-9_-]+)/g, (m, className) => {
                return className.startsWith(prefix) ? `.${className}` : `.${prefix}${className}`;
            });
            return `<style${p1}>${rewrittenStyle}</style>`;
        });

        iconList.push({
            name: icon.name,
            color: icon.color || '#4a4a4a',
            format: 'svg',
            source: icon.source || '',
            info: icon.info || 'NPC-icons 专属视觉设计规范。',
            code: content
        });
        svgCount++;
    } else if (icon.format === 'png') {
        const bitmap = fs.readFileSync(filePath);
        const base64Str = Buffer.from(bitmap).toString('base64');
        const imgTag = `<img src="data:image/png;base64,${base64Str}" style="width:100%;height:100%;object-fit:contain;" />`;
        iconList.push({
            name: icon.name,
            color: 'none',
            format: 'png',
            source: icon.source || '',
            info: icon.info || 'NPC-icons 专属独立位图资产。',
            code: imgTag
        });
        pngCount++;
    }
});

const logoAsset = iconList.find(i => i.name === 'my_logo');
const logoCode = logoAsset ? logoAsset.code : '';

if (!fs.existsSync(templatePath)) {
    process.exit(1);
}

let htmlContent = fs.readFileSync(templatePath, 'utf8');
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

htmlContent = htmlContent.replace(/id="svg-total">[^<]*/, `id="svg-total">${svgCount}`);
htmlContent = htmlContent.replace(/id="png-total">[^<]*/, `id="png-total">${pngCount}`);

if (logoAsset) {
    let faviconUrl = '';
    if (logoAsset.format === 'svg') {
        faviconUrl = `data:image/svg+xml;utf8,${encodeURIComponent(logoCode)}`;
    } else {
        const matchSrc = logoCode.match(/src="([^"]+)"/);
        faviconUrl = matchSrc ? matchSrc[1] : '';
    }
    htmlContent = htmlContent.replace(/id="favicon" href="[^"]*"/, `id="favicon" href="${faviconUrl}"`);
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, logoCode);
} else {
    const placeholderLogo = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`;
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, placeholderLogo);
}

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log(`✅ 隔离构建成功！当前统计：SVG: ${svgCount} | PNG: ${pngCount}`);

const fs = require('fs');
const path = require('path');

const baseIconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');
const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
    console.error("❌ 找不到清单配置文件 config.json！");
    process.exit(1);
}

const iconConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const iconList = [];
let svgCount = 0;
let pngCount = 0;

iconConfig.forEach((icon) => {
    // 🌟 根据不同格式，前往对应的 icons/svg/ 或 icons/png/ 细分子目录抓取
    const subFolder = icon.format === 'svg' ? 'svg' : 'png';
    const filename = `${icon.name}.${icon.format}`;
    const filePath = path.join(baseIconsDir, subFolder, filename);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 找不到文件: ${filePath}，已跳过。`);
        return;
    }

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
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

// 🌟 寻找 my_logo 资产代码
const logoAsset = iconList.find(i => i.name === 'my_logo');
const logoCode = logoAsset ? logoAsset.code : '';

if (!fs.existsSync(templatePath)) {
    console.error("❌ 找不到 index.html 模板文件！");
    process.exit(1);
}

let htmlContent = fs.readFileSync(templatePath, 'utf8');

// 1. 注入核心 JSON 格式数据
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

// 2. 注入实时 SVG / PNG 英文小字数量统计栏
htmlContent = htmlContent.replace(/id="svg-total">[^<]*/, `id="svg-total">${svgCount}`);
htmlContent = htmlContent.replace(/id="png-total">[^<]*/, `id="png-total">${pngCount}`);

// 3. 注入浏览器标签栏 Favicon 与顶部 Header Logo 图标
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
    // 如果还没放 my_logo，默认塞一个临时发光的占位小圆点，防止前端网页崩塌
    const placeholderLogo = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`;
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, placeholderLogo);
}

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log(`🚀 数据打包注入成功！当前统计：SVG: ${svgCount} | PNG: ${pngCount}`);

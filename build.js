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
    // 🌟 根据格式划分前往子目录：icons/svg/ 或 icons/png/
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
            info: icon.info || 'No description available.',
            code: content
        });
        svgCount++;
    } else if (icon.format === 'png') {
        const bitmap = fs.readFileSync(filePath);
        const base64Str = Buffer.from(bitmap).toString('base64');
        const imgTag = `<img src="data:image/png;base64,${base64Str}" style="width:100%;height:100%;object-fit:contain;" />`;
        iconList.push({
            name: icon.name,
            color: icon.color || '#8e8e93',
            format: 'png',
            source: icon.source || '',
            info: icon.info || 'No description available.',
            code: imgTag
        });
        pngCount++;
    }
});

// 🌟 自动寻找 my_logo 转换出来的 Base64 或源码作为系统 Favicon 标志
const logoAsset = iconList.find(i => i.name === 'my_logo');
const logoCode = logoAsset ? logoAsset.code : '';

// 2. 将数据与统计计数一同注入 index.html 中
let htmlContent = fs.readFileSync(templatePath, 'utf8');

// 注入数据列表
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

// 🌟 动态替换页面上的总数统计和标签页图标占位符
htmlContent = htmlContent.replace(/id="svg-total">[^<]*/, `id="svg-total">${svgCount}`);
htmlContent = htmlContent.replace(/id="png-total">[^<]*/, `id="png-total">${pngCount}`);

if (logoAsset) {
    const faviconUrl = logoAsset.format === 'svg' 
        ? `data:image/svg+xml;utf8,${encodeURIComponent(logoCode)}`
        : logoCode.match(/src="([^"]+)"/)[1];
    htmlContent = htmlContent.replace(/id="favicon" href="[^"]*"/, `id="favicon" href="${faviconUrl}"`);
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, logoCode);
}

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log(`🚀 成功注入！SVG: ${svgCount} | PNG: ${pngCount}`);

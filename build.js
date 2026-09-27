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
    const subFolder = icon.format === 'svg' ? 'svg' : 'png';
    // 🌟 核心智能修复：不管你的 config 名字带不带尾巴，我们严格按照物理真实文件名去拉取
    const cleanRealName = icon.name.replace('-png', '');
    const filename = `${cleanRealName}.${icon.format}`;
    const filePath = path.join(baseIconsDir, subFolder, filename);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 物理路径下找不到文件: ${filePath}，已跳过。`);
        return;
    }

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        
        // 样式真空命名隔离
        const prefix = `${icon.name}-`;
        content = content.replace(/class="([^"]+)"/g, (match, p1) => {
            return `class="${p1.split(/\s+/).map(c => c.startsWith(prefix) ? c : prefix + c).join(' ')}"`;
        });
        content = content.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, p1, p2) => {
            return `<style${p1}>${p2.replace(/\.([a-zA-Z0-9_-]+)/g, (m, c) => c.startsWith(prefix) ? `.\${c}` : `.\({prefix}\){c}`)}<\/style>`;
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
            name: icon.name, // 注入到前端，前端会配合 format 自动合成联合独立 ID
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

let htmlContent = fs.readFileSync(templatePath, 'utf8');
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

htmlContent = htmlContent.replace(/id="svg-total">[^<]*/, `id="svg-total">${svgCount}`);
htmlContent = htmlContent.replace(/id="png-total">[^<]*/, `id="png-total">${pngCount}`);

if (logoAsset) {
    let faviconUrl = logoAsset.format === 'svg' ? `data:image/svg+xml;utf8,${encodeURIComponent(logoCode)}` : '';
    htmlContent = htmlContent.replace(/id="favicon" href="[^"]*"/, `id="favicon" href="${faviconUrl}"`);
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, logoCode);
} else {
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`);
}

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log(`✅ 智能双轨重名隔离构建成功！当前统计：SVG: ${svgCount} | PNG: ${pngCount}`);

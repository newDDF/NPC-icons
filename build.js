const fs = require('fs');
const path = require('path');

const baseIconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');
const configPath = path.join(__dirname, 'config.json');
const preConfigPath = path.join(__dirname, 'pre_config.json');

// --- 1. 自动生成预配置草稿 pre_config.json ---
const preConfigList = [];
const svgDir = path.join(baseIconsDir, 'svg');
const pngDir = path.join(baseIconsDir, 'png');

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
    const cleanRealName = icon.name.replace('-png', '');
    const filename = `${cleanRealName}.${icon.format}`;
    const filePath = path.join(baseIconsDir, subFolder, filename);

    if (!fs.existsSync(filePath)) {
        return;
    }

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        
        // 🌟 修复后的精准类名与内联样式表隔离引擎
        const pfx = icon.name + '-';
        
        // 替换 class="cls-1" 
        content = content.replace(/class="([^"]+)"/g, (match, p1) => {
            const newCls = p1.split(/\s+/).map(c => c.startsWith(pfx) ? c : pfx + c).join(' ');
            return 'class="' + newCls + '"';
        });
        
        // 🌟 彻底修好：精准重写 <style> 内部的类名选择器，保护原有颜色不被摧毁
        content = content.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (match, p1, p2) => {
            const rewrittenStyle = p2.replace(/\.([a-zA-Z0-9_-]+)/g, (m, className) => {
                return className.startsWith(pfx) ? '.' + className : '.' + pfx + className;
            });
            return '<style' + p1 + '>' + rewrittenStyle + '</style>';
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

let htmlContent = fs.readFileSync(templatePath, 'utf8');
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, '/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ' + jsonString + ';\n/*[[BUILD_INSERT_END]]*/');

htmlContent = htmlContent.replace(/id="svg-total">[^<]*/, 'id="svg-total">' + svgCount);
htmlContent = htmlContent.replace(/id="png-total">[^<]*/, 'id="png-total">' + pngCount);

if (logoAsset) {
    let faviconUrl = logoAsset.format === 'svg' ? 'data:image/svg+xml;utf8,' + encodeURIComponent(logoCode) : '';
    htmlContent = htmlContent.replace(/id="favicon" href="[^"]*"/, 'id="favicon" href="' + faviconUrl + '"');
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, logoCode);
} else {
    htmlContent = htmlContent.replace(/\/\*\[\[LOGO_CODE_INSERT\]\]\*\//, '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>');
}

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log(`✅ 完美修复！重名风格硬隔离已安全上线。`);

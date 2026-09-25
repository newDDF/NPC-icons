const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');
const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(iconsDir)) {
    console.error("❌ 找不到 icons 文件夹！");
    process.exit(1);
}

// 1. 读取用户配置的 SVG 清单
let iconConfig = [];
if (fs.existsSync(configPath)) {
    iconConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const iconList = [];

// 2. 严格按照清单加载 SVG
iconConfig.forEach((icon) => {
    if (icon.format !== 'svg') return; // 清单中只处理 SVG
    const filename = `${icon.name}.svg`;
    const filePath = path.join(iconsDir, filename);

    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        iconList.push({
            name: icon.name,
            color: icon.color || '#4a4a4a',
            format: 'svg',
            code: content
        });
    }
});

// 3. 🌟 全自动扫描：免去手动登记，自动抓取 icons 文件夹下所有的 .png 文件
const allFiles = fs.readdirSync(iconsDir);
allFiles.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);

    if (ext === '.png') {
        const filePath = path.join(iconsDir, file);
        const bitmap = fs.readFileSync(filePath);
        const base64Str = Buffer.from(bitmap).toString('base64');
        const imgTag = `<img src="data:image/png;base64,${base64Str}" style="width:100%;height:100%;object-fit:contain;" />`;
        
        iconList.push({
            name: name,
            color: 'none', // 标记为无颜色值
            format: 'png',
            code: imgTag
        });
    }
});

console.log(`📦 混合模式构建成功！共解析了 ${iconList.length} 个图标！`);

// 4. 将数据注入到 index.html
let htmlContent = fs.readFileSync(templatePath, 'utf8');
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log("🚀 index.html 数据注入成功！");

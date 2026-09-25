const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');

if (!fs.existsSync(iconsDir)) {
    console.error("❌ 找不到 icons 文件夹！");
    process.exit(1);
}

// 1. 同时读取 icons 文件夹下的 .svg 和 .png 文件
const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg') || file.endsWith('.png'));
const iconList = [];

// 随机颜色池
const colorPalette = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0'];

files.forEach((file, index) => {
    const filePath = path.join(iconsDir, file);
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    const color = colorPalette[index % colorPalette.length];

    if (ext === '.svg') {
        // 处理 SVG 文件：读取纯文本代码并压缩
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        iconList.push({
            name: name,
            color: color,
            format: 'svg',
            code: content
        });
    } else if (ext === '.png') {
        // 处理 PNG 文件：将其转化为 Base64 文本编码
        const bitmap = fs.readFileSync(filePath);
        const base64Str = Buffer.from(bitmap).toString('base64');
        const imgTag = `<img src="data:image/png;base64,${base64Str}" style="width:100%;height:100%;object-fit:contain;" />`;
        iconList.push({
            name: name,
            color: color,
            format: 'png',
            code: imgTag  // 网页端直接使用这个标签渲染
        });
    }
});

console.log(`📦 成功解析了 ${iconList.length} 个图标！`);

// 2. 将数据注入到 index.html 中
if (!fs.existsSync(templatePath)) {
    console.error("❌ 找不到 index.html 模板文件！");
    process.exit(1);
}

let htmlContent = fs.readFileSync(templatePath, 'utf8');
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log("🚀 index.html 数据注入成功！");

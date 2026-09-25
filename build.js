const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');

// 1. 读取 icons 文件夹下的所有 svg 文件
if (!fs.existsSync(iconsDir)) {
    console.error("❌ 找不到 icons 文件夹！");
    process.exit(1);
}

const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
const iconList = [];

// 随机颜色池，当你的 SVG 没有自带颜色时，网页渲染会随机分配一个好看的颜色
const colorPalette = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0'];

files.forEach((file, index) => {
    const filePath = path.join(iconsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 清理换行和多余空格，压缩 SVG 代码
    content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
    
    const name = path.basename(file, '.svg');
    const color = colorPalette[index % colorPalette.length];

    iconList.push({
        name: name,
        color: color,
        format: 'svg',
        code: content
    });
});

console.log(`📦 成功解析了 ${iconList.length} 个图标！`);

// 2. 将数据注入到 index.html 中
if (!fs.existsSync(templatePath)) {
    console.error("❌ 找不到 index.html 模板文件！");
    process.exit(1);
}

let htmlContent = fs.readFileSync(templatePath, 'utf8');

// 用正则匹配并替换代码中的占位符 /*[[BUILD_INSERT_ICONS]]*/
const jsonString = JSON.stringify(iconList, null, 2);
htmlContent = htmlContent.replace(/\/\*\[\[BUILD_INSERT_ICONS\]\]\*\/[\s\S]*?\/\*\[\[BUILD_INSERT_END\]\]\*\//, `/*[[BUILD_INSERT_ICONS]]*/\nconst MOCK_ICONS = ${jsonString};\n/*[[BUILD_INSERT_END]]*/`);

fs.writeFileSync(templatePath, htmlContent, 'utf8');
console.log("🚀 index.html 数据注入成功！");

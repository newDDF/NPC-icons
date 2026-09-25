const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const templatePath = path.join(__dirname, 'index.html');
const configPath = path.join(__dirname, 'config.json');

// 1. 验证配置文件是否存在
if (!fs.existsSync(configPath)) {
    console.error("❌ 找不到清单配置文件 config.json！请先创建它。");
    process.exit(1);
}

// 读取你手动配置的图标清单
const iconConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const iconList = [];

iconConfig.forEach((icon) => {
    const filename = `${icon.name}.${icon.format}`;
    const filePath = path.join(iconsDir, filename);

    // 检查对应的图标文件是否存在
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 警告: 清单中配置了 ${filename}，但 icons 文件夹中找不到该文件，已跳过。`);
        return;
    }

    if (icon.format === 'svg') {
        let content = fs.readFileSync(filePath, 'utf8');
        // 压缩并清理换行
        content = content.replace(/[\r\n]/g, '').replace(/>\s+</g, '><').trim();
        
        iconList.push({
            name: icon.name,
            color: icon.color || '#4a4a4a', // 如果清单没写颜色，给默认深灰
            format: 'svg',
            code: content
        });
    } else if (icon.format === 'png') {
        const bitmap = fs.readFileSync(filePath);
        const base64Str = Buffer.from(bitmap).toString('base64');
        const imgTag = `<img src="data:image/png;base64,${base64Str}" style="width:100%;height:100%;object-fit:contain;" />`;
        
        iconList.push({
            name: icon.name,
            color: icon.color || '#8e8e93',
            format: 'png',
            code: imgTag
        });
    }
});

console.log(`📦 成功根据清单解析了 ${iconList.length} 个图标！`);

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

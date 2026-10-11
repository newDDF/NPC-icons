# NPC-icons

NPC-icons icon library for Node.js.

## Usage

```js
import { getIcons, getIcon, searchIcons, getIconSvg, getStats } from 'npc-icons';
const icons = getIcons();
const svgIcons = getIcons({ format: 'svg' });
const educationIcons = getIcons({ category: 'Education' });
const icon = getIcon('DONGFANGCOLLEGE');
const pngIcon = getIcon('DONGFANGCOLLEGE', 'png');
const results = searchIcons('education');
const svg = getIconSvg('DONGFANGCOLLEGE');
const stats = getStats();
```

## CDN
- SVG: https://icons.x0u0x.xyz/assets/svg/<filename>.svg
- PNG: https://icons.x0u0x.xyz/assets/png/<filename>.png

## Static API
- /api/icons.json
- /api/stats.json
- /api/icons/<icon-id>.json

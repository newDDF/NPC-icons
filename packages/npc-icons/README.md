# NPC-icons

A lightweight icon library for Node.js, featuring searchable SVG and PNG assets for brands, organizations, and projects.

- **Website:** https://icons.x0u0x.xyz/
- **GitHub:** https://github.com/newDDF/NPC-icons
- **Package:** `@newddf/npc-icons`

## Requirements

- Node.js `>=22.12.0`

## Installation

```bash
npm install @newddf/npc-icons
```

## Usage

The package uses ECMAScript modules.

```js
import {
  getIcons,
  getIcon,
  searchIcons,
  getIconSvg,
  getStats
} from '@newddf/npc-icons';

// Get all icon records.
const icons = getIcons();

// Filter by format.
const svgIcons = getIcons({ format: 'svg' });
const pngIcons = getIcons({ format: 'png' });

// Filter by category (case-insensitive).
const educationIcons = getIcons({ category: 'Education' });

// Find an icon by its ID or name.
const icon = getIcon('amd-svg');
const iconByName = getIcon('AMD');

// Request a specific format.
const pngIcon = getIcon('dayuan-png', 'png');

// Search names, descriptions, and categories.
const results = searchIcons('education');

// Read the SVG source as a string.
const svg = getIconSvg('amd-svg');

// Get library statistics.
const stats = getStats();

console.log(stats);
```

## API Reference

### `getIcons(options?)`

Returns an array of icon records.

| Option | Type | Description |
| --- | --- | --- |
| `format` | `'svg' \| 'png'` | Optional format filter. |
| `category` | `string` | Optional, case-insensitive category filter. |

### `getIcon(name, format?)`

Finds an icon by its ID or name, ignoring name case.

- `name`: Icon ID or icon name.
- `format`: Optional `'svg'` or `'png'`.
- Returns an icon record or `null`.
- Without a format, SVG is preferred when a matching SVG exists. If not, the first matching record is returned.

### `searchIcons(query)`

Searches icon names, descriptions (`info`), and categories using a case-insensitive substring match.

- Returns an array of matching icon records.
- Returns an empty array for an empty query or when there are no matches.

### `getIconSvg(name)`

Returns the SVG source as a string, or `null` if no matching SVG asset is available.

PNG files are not returned by this function.

### `getStats()`

Returns the generated library statistics:

```json
{
  "total": 349,
  "svg": 344,
  "png": 5
}
```

Statistics reflect the generated dataset and may change as icons are added or updated.

## Icon Record

Each icon record includes the following fields:

| Field | Description |
| --- | --- |
| `id` | Unique generated identifier, including the format suffix. |
| `name` | Icon name. |
| `color` | Associated color value, when available. |
| `format` | `svg` or `png`. |
| `source` | Source URL, when provided. |
| `info` | Icon description or notes. |
| `category` | Array of category names. |
| `filename` | Asset filename. |
| `path` | Local asset path relative to the installed package. |
| `url` | Absolute URL to the hosted asset. |
| `apiUrl` | Absolute URL to the hosted JSON record. |

## CDN

Use hosted assets directly when you do not need the npm package.

- SVG: `https://icons.x0u0x.xyz/assets/svg/<filename>.svg`
- PNG: `https://icons.x0u0x.xyz/assets/png/<filename>.png`

Replace `<filename>` with the actual asset filename, including its extension.

## Static JSON API

The website provides read-only JSON endpoints:

| Endpoint | Description |
| --- | --- |
| `https://icons.x0u0x.xyz/api/icons.json` | All icon records. |
| `https://icons.x0u0x.xyz/api/stats.json` | Library statistics. |
| `https://icons.x0u0x.xyz/api/icons/<icon-id>.json` | A single icon record. |

The `url` and `apiUrl` fields in npm package records contain absolute URLs. API records served by the website use site-relative paths for these fields.

## Licensing and Trademarks

The original software code is licensed under the MIT License; see the package's `LICENSE` file.

Icon assets, logos, brand names, and trademarks may be subject to separate rights or license terms. The software license does not automatically grant permission to use third-party assets. Check the applicable terms before redistributing or using an asset in your project.

See the repository's [Disclaimer](https://github.com/newDDF/NPC-icons/blob/main/DISCLAIMER.md) for additional information.

## Links

- [Website](https://icons.x0u0x.xyz/)
- [GitHub Repository](https://github.com/newDDF/NPC-icons)
- [Root License](https://github.com/newDDF/NPC-icons/blob/main/LICENSE)
- [Disclaimer](https://github.com/newDDF/NPC-icons/blob/main/DISCLAIMER.md)

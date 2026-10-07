<p align="center">
  <img src="https://icons.x0u0x.xyz/assets/svg/my_logo.svg" alt="NPC-icons" width="70">
</p>

<h1 align="center">NPC-icons</h1>

<p align="center">
  A lightweight collection of SVG and PNG icons for brands, organizations, and custom projects.
  Browse, search, preview, copy, and download icons directly from
  <a href="https://icons.x0u0x.xyz">NPC-icons</a>.
</p>

<p align="center">
  <a href="https://icons.x0u0x.xyz">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Ficons.x0u0x.xyz&label=website" alt="Website">
  </a>
  <a href="https://github.com/newDDF/NPC-icons/releases/tag/v3.0.0">
    <img src="https://img.shields.io/github/v/release/newDDF/NPC-icons?logo=github" alt="Latest release">
  </a>
  <a href="https://github.com/newDDF/NPC-icons/actions/workflows/deploy.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/newDDF/NPC-icons/deploy.yml?branch=main&logo=github&label=build" alt="Build status">
  </a>
  <a href="https://github.com/newDDF/NPC-icons/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/newDDF/NPC-icons" alt="License">
  </a>
</p>

<p align="center">
  <a href="https://github.com/newDDF/NPC-icons">
    <img src="https://img.shields.io/github/stars/newDDF/NPC-icons?style=flat&logo=github" alt="GitHub stars">
  </a>
  <a href="https://github.com/newDDF/NPC-icons/releases">
    <img src="https://img.shields.io/github/downloads/newDDF/NPC-icons/total?label=downloads&logo=github" alt="GitHub downloads">
  </a>
</p>

---

<img width="2515" height="1278" alt="image" src="https://github.com/user-attachments/assets/0ccc051c-23a0-4bc8-bca3-1ca0dc02176b" />
<img width="2522" height="1287" alt="image" src="https://github.com/user-attachments/assets/4a8ada1f-1a96-4be7-a8d8-ed5f250aa397" />


---

## 🌐 Live Website

**[icons.x0u0x.xyz](https://icons.x0u0x.xyz/)**

NPC-icons provides a simple web interface for browsing and managing the icon library.

You can:

* 🔍 Search icons
* 🌓 Switch between light and dark mode
* 👁️ Preview icons
* 📋 Copy SVG source
* 📋 Copy icon names
* 📥 Download SVG and PNG assets
* 🎨 View icon colors and metadata
* 📱 Browse the library on desktop and mobile

---

## 📊 Icon Library

The icon library is automatically counted during the build process.

```text
SVG icons
PNG icons
Total icons
```

The generated statistics are available at:

```text
dist/data/stats.json
```

Example:

```json
{
  "total": 15,
  "svg": 10,
  "png": 5
}
```

Because the statistics are generated automatically, the README badges update as the icon library grows.

> Some icon names may have both SVG and PNG versions and are therefore counted separately by format.

---

## ✨ Features

### 🎨 SVG & PNG

NPC-icons supports both vector and bitmap assets.

```text
icons/
├── svg/
│   ├── github.svg
│   ├── apple.svg
│   └── ...
└── png/
    ├── DAYUAN.png
    ├── DONGFANGCOLLEGE.png
    └── ...
```

### 🔎 Search

Search the icon library directly from the website without requiring a backend service.

### 👁️ Preview

Click an icon to open a detailed preview containing:

* Icon artwork
* Icon name
* Description
* Color information
* Available format

### 📋 Copy

SVG icons can be copied directly as SVG source.

Icon names can also be copied for use in other projects.

### 📥 Download

Download supported assets directly from the website.

Both SVG and PNG assets are available when provided by the library.

### 🌓 Dark Mode

The interface supports both light and dark visual themes.

### 📱 Responsive Design

The interface is designed for desktop, tablet, and mobile screens.

---

## 🏗️ Architecture

NPC-icons uses a static build architecture:

```text
icons/
   │
   ├── svg/
   └── png/
        │
        ▼
   config.json
        │
        ▼
     build.js
        │
        ├── dist/index.html
        ├── dist/data/icons.json
        ├── dist/data/stats.json
        ├── dist/assets/svg/
        └── dist/assets/png/
        │
        ▼
   GitHub Actions
        │
        ▼
    gh-pages
        │
        ▼
   Cloudflare Pages
        │
        ▼
 icons.x0u0x.xyz
```

The generated website is completely static and does not require a runtime backend.

---

## 🚀 Build & Deployment

The production site is automatically built and deployed through GitHub Actions.

Every push to `main` triggers:

```text
main
 │
 ▼
GitHub Actions
 │
 ├── Install dependencies
 ├── Run build.js
 └── Deploy ./dist
       │
       ▼
   gh-pages
       │
       ▼
Cloudflare Pages
```

The source repository and generated production files are kept separate:

```text
main
└── Source code + icon definitions

gh-pages
└── Generated production website
```

---

## 📦 Adding an Icon

### 1. Add the asset

SVG:

```text
icons/svg/example.svg
```

PNG:

```text
icons/png/example.png
```

### 2. Add the metadata

Add an entry to `config.json`:

```json
{
  "name": "example",
  "color": "#000000",
  "format": "svg",
  "source": "",
  "info": "NPC-icons library trademark design asset."
}
```

For PNG:

```json
{
  "name": "example",
  "color": "",
  "format": "png",
  "source": "",
  "info": "NPC-icons library bitmapped graphic asset."
}
```

### Configuration fields

| Field    | Description         |
| :------- | :------------------ |
| `name`   | Icon name           |
| `color`  | Primary icon color  |
| `format` | `svg` or `png`      |
| `source` | Optional source URL |
| `info`   | Icon description    |

---

## 🔧 Local Development

Clone the repository:

```bash
git clone https://github.com/newDDF/NPC-icons.git
cd NPC-icons
```

Install dependencies:

```bash
npm install
```

Build the production site:

```bash
node build.js
```

or:

```bash
npm run build
```

Generated files are placed in:

```text
dist/
```

You can serve `dist/` using any static HTTP server.

---

## 📁 Project Structure

```text
NPC-icons/
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── icons/
│   ├── svg/
│   └── png/
│
├── src/
│   └── styles/
│       └── global.css
│
├── dist/
│   ├── assets/
│   │   ├── css/
│   │   │   └── global.css
│   │   ├── svg/
│   │   └── png/
│   ├── data/
│   │   ├── icons.json
│   │   └── stats.json
│   └── index.html
│
├── build.js
├── config.json
├── index.template.html
├── package.json
├── .gitignore
├── LICENSE
├── DISCLAIMER.md
└── README.md
```

---

## 🧩 Icon Data

The production icon manifest is generated as:

```text
dist/data/icons.json
```

Each icon contains metadata and its generated asset path.

Example:

```json
{
  "name": "github",
  "color": "#181717",
  "format": "svg",
  "source": "",
  "info": "NPC-icons library trademark design asset.",
  "path": "./assets/svg/github.svg"
}
```

Statistics are generated separately:

```text
dist/data/stats.json
```

```json
{
  "total": 15,
  "svg": 10,
  "png": 5
}
```

---

## 🛡️ Design Philosophy

NPC-icons follows several simple principles:

* **Static first** — no runtime backend required.
* **Simple data model** — metadata remains human-readable.
* **Independent assets** — SVG and PNG files are stored separately.
* **Automated builds** — production files are generated automatically.
* **Easy maintenance** — adding an icon requires an asset and metadata.
* **Fast distribution** — production files are delivered through Cloudflare Pages.
* **Self-host friendly** — `dist/` can be deployed to almost any static hosting provider.

---

## ⚠️ Disclaimer

NPC-icons may contain trademarks, logos, and other intellectual property belonging to their respective owners.

The inclusion of an icon does not imply ownership, endorsement, sponsorship, or affiliation with the respective trademark holder.

See [`DISCLAIMER.md`](./DISCLAIMER.md) for additional information.

---

## 📜 License

See [`LICENSE`](./LICENSE) for the license applicable to this project.

Icon trademarks and third-party assets remain the property of their respective owners.

---

## 🔗 Links

* 🌐 **Website:** https://icons.x0u0x.xyz/
* 📦 **GitHub:** https://github.com/newDDF/NPC-icons
* 🏷️ **Latest Release:** https://github.com/newDDF/NPC-icons/releases/latest
* 📜 **License:** https://github.com/newDDF/NPC-icons/blob/main/LICENSE
* ⚠️ **Disclaimer:** https://github.com/newDDF/NPC-icons/blob/main/DISCLAIMER.md

---

<p align="center">
  Made with ❤️ for the open icon ecosystem.
</p>


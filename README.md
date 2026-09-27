<img width="2515" height="1278" alt="image" src="https://github.com/user-attachments/assets/0ccc051c-23a0-4bc8-bca3-1ca0dc02176b" />
<img width="2522" height="1287" alt="image" src="https://github.com/user-attachments/assets/4a8ada1f-1a96-4be7-a8d8-ed5f250aa397" />


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

## 🌐 Live Website

**[icons.x0u0x.xyz](https://icons.x0u0x.xyz/)**

NPC-icons provides a simple web interface for browsing the icon library.

You can:

* 🔍 Search icons
* 🌓 Switch between light and dark mode
* 👁️ Preview icons
* 📋 Copy SVG source
* 🔗 Copy icon information
* 📥 Download SVG and PNG assets
* 🎨 View icon colors and metadata
* 📱 Use the interface on desktop and mobile devices

---

## 📊 Current Library

NPC-icons currently contains:

| Format        |  Count |
| :------------ | -----: |
| SVG           | **10** |
| PNG           |  **5** |
| Total entries | **15** |

The library is continuously expandable through the `icons/` directories and `config.json`.

> Some icon names may have both SVG and PNG versions and are therefore counted as separate format entries.

---

## ✨ Features

### 🎨 SVG & PNG Support

NPC-icons supports both vector and bitmap assets.

```text
icons/
├── svg/
│   ├── amd.svg
│   ├── apple.svg
│   ├── github.svg
│   └── ...
└── png/
    ├── DAYUAN.png
    ├── DONGFANGCOLLEGE.png
    └── ...
```

SVG files are processed during the build stage to reduce internal CSS/class-name collisions between different icons.

### 🔎 Fast Search

The website provides client-side icon searching and filtering, allowing icons to be located without navigating through multiple pages.

### 👁️ Icon Preview

Click an icon to open a dedicated preview modal with its name, metadata, and full-size artwork.

### 📋 Copy & Download

Supported actions include:

* Copy SVG source
* Copy icon name
* Download SVG
* Download PNG

### 🌓 Light & Dark Mode

The interface automatically adapts its visual presentation for light and dark environments.

### 📱 Responsive Interface

The interface is designed for desktop, tablet, and mobile screens, with larger touch targets for mobile interaction.

---

## 🏗️ Architecture

NPC-icons uses a simple static-build architecture:

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

### Build System

The project uses `Node.js` and `build.js` to generate the production site.

The build process:

1. Reads icon files from `icons/svg/` and `icons/png/`
2. Reads metadata from `config.json`
3. Processes SVG class names and embedded styles
4. Copies assets into `dist/assets/`
5. Generates `dist/data/icons.json`
6. Generates the production `dist/index.html`
7. Records the current SVG and PNG counts

The generated website is completely static and does not require a runtime backend.

---

## 🚀 CI/CD

Every push to the `main` branch triggers GitHub Actions.

```text
main
 │
 ▼
GitHub Actions
 │
 ├── Install Node.js
 ├── Run build.js
 └── Deploy ./dist
       │
       ▼
   gh-pages
       │
       ▼
Cloudflare Pages
```

The current workflow uses Node.js 22 and publishes the generated `dist/` directory to the `gh-pages` branch.

This means the source repository and production assets remain clearly separated:

```text
main      → source code + icon definitions
gh-pages  → generated production website
```

---

## 📦 Adding an Icon

Adding an icon requires two steps.

### 1. Add the asset

For SVG:

```text
icons/svg/example.svg
```

For PNG:

```text
icons/png/example.png
```

### 2. Register it in `config.json`

Example SVG entry:

```json
{
  "name": "example",
  "color": "#000000",
  "format": "svg",
  "source": "",
  "info": "NPC-icons library trademark design asset."
}
```

Example PNG entry:

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

| Field    | Description                   |
| :------- | :---------------------------- |
| `name`   | Icon name and filename        |
| `color`  | Primary SVG color             |
| `format` | `svg` or `png`                |
| `source` | Optional source/reference URL |
| `info`   | Optional icon description     |

The current configuration follows this schema.

---

## 🔧 Local Development

Clone the repository:

```bash
git clone https://github.com/newDDF/NPC-icons.git
cd NPC-icons
```

Build the project:

```bash
npm install
npm run build
```

or:

```bash
node build.js
```

The generated production files will be placed in:

```text
dist/
```

You can then serve the `dist/` directory with any static HTTP server.

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
├── dist/
│   ├── assets/
│   │   ├── svg/
│   │   └── png/
│   ├── data/
│   │   └── icons.json
│   └── index.html
│
├── build.js
├── config.json
├── pre_config.json
├── index.html
├── index.template.html
├── package.json
├── LICENSE
├── DISCLAIMER.md
└── README.md
```

> `dist/` is generated by the build process and represents the production-ready static site.

---

## 🧩 Data Model

The production icon manifest is generated as:

```text
dist/data/icons.json
```

Each icon contains metadata similar to:

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

This allows the frontend to load icon metadata independently from the HTML document.

---

## 🛡️ Design Philosophy

NPC-icons is intentionally designed around a few principles:

* **Static first** — no runtime backend is required.
* **Simple data model** — icon metadata remains human-readable.
* **Independent assets** — SVG and PNG files are stored separately.
* **Automated builds** — production files are generated automatically.
* **Easy maintenance** — adding an icon requires only an asset and a configuration entry.
* **Fast distribution** — the generated site is delivered through Cloudflare's edge network.
* **Self-host friendly** — the generated `dist/` directory can be deployed to almost any static hosting provider.

---

## ⚠️ Disclaimer

NPC-icons may contain trademarks, logos, and other intellectual property belonging to their respective owners.

The inclusion of an icon in this project does not imply ownership, endorsement, sponsorship, or affiliation with the respective trademark holder.

Please refer to [`DISCLAIMER.md`](./DISCLAIMER.md) for additional information.

---

## 📜 License

Please see [`LICENSE`](./LICENSE) for the license applicable to this project.

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


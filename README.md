 <p align="center">
  <img src="https://icons.x0u0x.xyz/assets/svg/my_logo.svg" alt="NPC-icons" width="70">
</p>

<h1 align="center">NPC-icons</h1>

<p align="center">
  A lightweight collection of SVG and PNG icons for brands, organizations, and custom projects.<br>
  Browse, search, preview, customize, copy, and download icons directly from
  <a href="https://icons.x0u0x.xyz">NPC-icons</a>.
</p>

<p align="center">
  <a href="https://icons.x0u0x.xyz">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Ficons.x0u0x.xyz&label=website" alt="Website">
  </a>
  <a href="https://github.com/newDDF/NPC-icons/releases/latest">
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

**[https://icons.x0u0x.xyz/](https://icons.x0u0x.xyz/)**

NPC-icons is a lightweight, static-first icon library designed to make discovering, previewing, and customizing visual assets straightforward.

## ✨ Features

### 🎨 Icon Library

- Browse SVG and PNG assets.
- Search icons by name.
- Explore categories and metadata.
- Filter, sort, and organize the collection.
- View icon information and color details.
- Copy icon names and SVG source.
- Download original assets.

### 👁️ Icon Details

Every icon has a dedicated detail page with:

- High-quality icon preview.
- Icon name and description.
- File format and color information.
- Category and metadata.
- Source and attribution information when available.

### 🛠️ Icon Customization

The built-in detail editor provides tools for adjusting supported icons:

- Adjust preview size.
- Switch preview backgrounds.
- Customize SVG colors.
- Edit supported color values.
- Preview changes before exporting.
- Work with multiple SVG colors through the color palette editor.

### 📥 Export Options

Export supported icons in different formats:

- Original SVG or PNG.
- Customized SVG.
- PNG export.
- WebP export.
- Multiple export scales.

Available options depend on the original asset format and supported editing features.

### 🌓 Visual Themes

- Light and dark themes.
- Frosted-glass interface styling.
- Responsive desktop and mobile layouts.
- Consistent controls and visual hierarchy.

---

## 📊 Icon Library

Icon statistics are generated automatically during the build process.

The generated statistics file is:

```text
dist/data/stats.json
```

Example:

```json
{
  "total": 349,
  "svg": 344,
  "png": 5
}
```

The numbers above are illustrative. Actual statistics depend on the current icon collection.

Some icons may have multiple formats and are counted separately by format.

---

## 🏗️ Architecture

NPC-icons uses a static build architecture powered by Astro and Node.js.

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
     build.cjs
        │
        ├── Generated icon metadata
        ├── Permanent ID registry
        ├── Icon detail pages
        └── Static assets
             │
             ▼
          Astro
             │
             ▼
        GitHub Actions
             │
             ▼
       Cloudflare Pages
             │
             ▼
       icons.x0u0x.xyz
```

The production website is statically generated and does not require a runtime database or application backend.

---

## 🚀 Build & Deployment

The production website is deployed through GitHub Actions and Cloudflare Pages.

The general workflow is:

```text
Source Repository
       │
       ▼
GitHub Actions
       │
       ├── Install dependencies
       ├── Generate icon data
       ├── Run Astro build
       └── Validate build output
              │
              ▼
          dist/
              │
              ▼
       Cloudflare Pages
              │
              ▼
       icons.x0u0x.xyz
```

The source repository contains the original assets, metadata, and application code. The generated `dist/` directory contains the deployable static website.

---

## 🐳 Docker Deployment

Docker provides a convenient way to run NPC-icons without manually installing Node.js or building the website.

### Requirements

- Docker Engine
- Docker Compose v2

### 1. Clone the repository

```bash
git clone https://github.com/newDDF/NPC-icons.git
cd NPC-icons
```

### 2. Build and start

```bash
docker compose up -d --build
```

Docker automatically installs the required dependencies, builds the static website, and starts the Nginx container.

### 3. Open the website

Visit:

```text
http://localhost:8080
```

By default, port `8080` on the host maps to port `80` inside the container.

### Container management

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop the website:

```bash
docker compose down
```

Update and rebuild:

```bash
git pull
docker compose up -d --build
```

The Docker image is built locally. No prebuilt NPC-icons image is required.

---

## 📦 Adding an Icon

NPC-icons uses `config.json` as its central icon metadata source.

### 1. Add the asset

SVG:

```text
icons/svg/example.svg
```

PNG:

```text
icons/png/example.png
```

### 2. Add metadata

Add an entry to `config.json`.

SVG example:

```json
{"name":"example","color":"#000000","format":"svg","source":"","info":"A short description of the icon.","category":["Other"]}
```

PNG example:

```json
{"name":"example","color":"","format":"png","source":"","info":"A short description of the icon.","category":["Other"]}
```

### Metadata fields

| Field | Description |
|---|---|
| `name` | Icon name |
| `color` | Primary icon color |
| `format` | `svg` or `png` |
| `source` | Source URL, when available |
| `info` | Icon description |
| `category` | Array of categories |
| `by` | Creator or attribution, when known |
| `origin` | Asset provenance, when known |

Follow existing metadata conventions. Do not invent attribution or source information.

### 3. Register a Permanent ID

Permanent icon IDs are managed in:

```text
data/id-registry.json
```

When adding an icon:

1. Read the current `nextId` value.
2. Add a record to `records` using the next available ID.
3. Include the matching name, format, filename, and status.
4. Advance `nextId` while preserving the existing ID format.
5. Never reuse an assigned ID, including IDs belonging to retired icons.

Permanent IDs should remain stable even when an icon's filename or display name changes.

### 4. Register a Legacy Alias

Legacy identifiers are maintained in:

```text
data/legacy-id-map.json
```

When necessary, add a unique mapping from an existing legacy identifier to its permanent ID.

Preserve existing mappings and never assign the same alias to multiple icons.

### 5. Validate Changes

Run the following commands:

```bash
npm run build:smoke
npm run build
git diff --check
```

Review the changes before committing:

```bash
git status --short
git diff
```

Do not manually modify generated files under `public/` or `dist/` unless a specific workflow requires it.

---

## 🔧 Local Development

### Requirements

- Node.js `>=22.12.0`
- npm

### Clone the repository

```bash
git clone https://github.com/newDDF/NPC-icons.git
cd NPC-icons
```

### Install dependencies

```bash
npm install
```

### Build the production website

```bash
npm run build
```

Generated files are placed in:

```text
dist/
```

The generated website can be served using any compatible static HTTP server.

---

## 📁 Project Structure

```text
NPC-icons/
├── .github/
│   └── workflows/
├── icons/
│   ├── svg/
│   └── png/
├── data/
│   ├── id-registry.json
│   └── legacy-id-map.json
├── public/
│   ├── assets/
│   └── data/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── scripts/
│   └── styles/
├── tests/
├── build.cjs
├── config.json
├── astro.config.mjs
├── package.json
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── DISCLAIMER.md
└── README.md
```

The exact structure may evolve as the project develops.

---

## 🧩 Icon Data

The production icon manifest is generated during the build process.

```text
dist/data/icons.json
```

Each icon record contains its metadata and generated asset path.

Example:

```json
{
  "name": "github",
  "color": "#181717",
  "format": "svg",
  "source": "",
  "info": "Icon description.",
  "path": "./assets/svg/github.svg"
}
```

Permanent identifiers are managed separately through the ID registry.

Statistics are generated in:

```text
dist/data/stats.json
```

The generated files should not be treated as the primary source of icon metadata.

---

## 🛡️ Design Philosophy

NPC-icons follows several principles:

- **Static first** — no runtime backend required.
- **Lightweight** — minimal infrastructure and straightforward deployment.
- **Simple data model** — metadata remains human-readable.
- **Consistent** — predictable asset and metadata conventions.
- **Stable identifiers** — permanent IDs support long-term references.
- **Practical editing** — preview, customize, and export icons in one place.
- **Maintainable** — source assets and generated output remain separate.
- **Self-host friendly** — deploy the generated static website to compatible hosting providers.

---

## ⚠️ Disclaimer

NPC-icons may contain trademarks, logos, and other intellectual property belonging to their respective owners.

The inclusion of an icon does not imply ownership, endorsement, sponsorship, or affiliation with the respective trademark holder.

Users are responsible for ensuring that their use of third-party assets complies with applicable licenses and laws.

See [`DISCLAIMER.md`](./DISCLAIMER.md) for additional information.

---

## 📜 License

See [`LICENSE`](./LICENSE) for the license applicable to this project.

Icon trademarks and third-party assets remain the property of their respective owners.

---

## 🔗 Links

- 🌐 **Website:** [https://icons.x0u0x.xyz/](https://icons.x0u0x.xyz/)
- 📦 **GitHub:** [https://github.com/newDDF/NPC-icons](https://github.com/newDDF/NPC-icons)
- 🏷️ **Latest Release:** [GitHub Releases](https://github.com/newDDF/NPC-icons/releases/latest)
- 📜 **License:** [LICENSE](./LICENSE)
- ⚠️ **Disclaimer:** [DISCLAIMER.md](./DISCLAIMER.md)

---

<p align="center">
  Made with ❤️ for the open icon ecosystem.
</p>

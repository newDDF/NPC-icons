# NPC-icons

# NPC-icons 图标库

一个基于 Apple 视觉规范设计、具备像素级等高对齐和黑夜模式智能色彩适配的轻量化、自托管图标管理库。

## 🌐 项目基础架构
本项目采用前沿的 **Serverless 静态托管与云端自动化构建** 双轨架构：
- **大后方（Backend）**：利用 `Node.js (build.js)` 脚本在云端自动化读取资产，严格根据用户维护的 `config.json` 自动完成真空级样式命名隔离与联合 ID 数据绑定，从根源杜绝 SVG 内部的类名交叉干涉和同名 PNG 相互吞噬。
- **自动化流水线（CI/CD）**：由 `GitHub Actions` 充当自动化总闸，一旦 `main` 分支有代码变动，自动重构网页并将打包好的带资产成品强行推送到专用的 `gh-pages` 分支。
- **前端节点（Frontend）**：通过全球加速的 `Cloudflare Pages` 进行极速分发，支持毛玻璃弹性详情弹窗、高可读性前景色亮度反转计算、流式二进制/文本直接下载，以及针对安卓端优化的 48px 防误触工具栏。

## 🛠️ Cloudflare Pages 部署方式
1. 登录 Cloudflare 控制台，点击 **Workers 和 Pages** -> **创建** -> **Pages**。
2. 点击 **连接到 Git**，授权你的 GitHub 账号并选中 `NPC-icons` 仓库，点击 **开始设置**。
3. **关键参数配置**：
   - 将 **Production branch (生产分支)** 修改为 `gh-pages`。
   - Framework preset (框架预设) 选择 **None**。
   - Build command (构建命令) 与 Build output directory (输出目录) 均保持**完全留空，不要填**。
4. 点击最下方的 **保存并部署** 即可等待全球加速节点同步上线。

## 📥 图标添加与维护方式
1. **分类归位**：将你的图标物理文件严格按照格式放进对应的细分目录下（SVG 放入 `icons/svg/`，PNG 放入 `icons/png/`）。
2. **清单登记**：打开根目录下的 `config.json`，按照标准格式追加你的图标。
   - *提示：SVG 必须指定带有 `#` 号的十六进制 `"color"` 字段，PNG 彻底不需要写颜色字段。`source` 可提供官方链接，`info` 提供详情描述。*
3. **全自动闭环**：使用 GitHub App 提交保存到 `main` 分支。GitHub 机器人会震醒并跑出绿勾，一分钟内自动在文件列表中长出最新的 `pre_config.json` 草稿存根，同时 Cloudflare 线上网页同步完成全自动重构和更新。

## ⚠️ 项目弊端分析
目前项目处于 Phase 2 视觉重构版，为了保障零成本自托管，存在以下底层天花板：
1. **网页肥胖症**：PNG 图标在构建时被硬编码转换为 Base64 文本并塞进 HTML，随着图片增多会导致 `index.html` 的体积呈现爆炸式肥胖，严重拉低用户的首屏秒开体验。
2. **JSON 脆弱性**：整个网站的数据吞吐死死绑定于 `config.json`。若手工在手机上编辑清单时不小心多点了一个逗号或符号，会导致云端解析发生毁灭性崩溃。
3. **数据交织**：`index.html` 既承载着页面皮肤，又充当了内置数据库，不符合大厂数据与视图解耦的工程规范。

## 🚀 后期开放优化方案与设想 (Phase 3)
1. **独立物理文件输出（破除肥胖）**：改写构建脚本，让 PNG 图标维持独立物理文件存储。网页端换用标准的图片标签，并在前端启用 `IntersectionObserver` 异步延迟懒加载机制，使网页体积瞬间缩减 10 倍，实现光速秒开。
2. **数据异构与异步化（数据解耦）**：将图标数据打包为独立的 `data.json`，前端在网页启动时利用流式 `fetch` 异步按需索取数据。
3. **沙箱防护机制（安全容错）**：在构建脚本中加入 `try...catch` 块。即使你在手机上编辑清单写错了一个标点，系统也会优雅地报错并跳过故障图标，绝对保障线上整体网站雷打不动、永不崩溃。



# NPC-icons Library

A lightweight, self-hosted icon management library designed with Apple's human interface guidelines, featuring pixel-level grid alignment and smart light/dark contrast adaptation.

## 🌐 Project Architecture
This repository implements a cutting-edge, dual-track **Serverless static hosting and automated cloud compilation** pipeline:
- **Backend Infrastructure**: Built upon a `Node.js (build.js)` automation engine that scans physical directories. It implements strict namespace styling containment and unified identifier mapping based on user-maintained `config.json`, programmatically eradicating cross-contamination of SVG class selectors and naming collisions with co-existing PNG formats.
- **CI/CD Pipeline**: Orchestrated entirely via `GitHub Actions`. Any state variance committed to the `main` branch immediately triggers the builder to re-compile the static page and perform a force-push of the ready-to-serve assets directly onto the dedicated `gh-pages` production branch.
- **Edge Deployment**: Distributed globally via `Cloudflare Pages`. It features native frosted glass overlay cards, adaptive foreground luminance calculations, streaming binary/plaintext direct down-loaders, and a 48px touch-target toolbar carefully optimized to completely prevent phone misclicks.

## 🛠️ Cloudflare Pages Deployment Steps
1. Log into your Cloudflare Dashboard, traverse to **Workers & Pages** -> **Create** -> **Pages**.
2. Click **Connect to Git**, authorize your GitHub identity, select the `NPC-icons` repository, and click **Begin setup**.
3. **Crucial Build Configuration**:
   - Explicitly configure the **Production branch** to `gh-pages`.
   - Select **None** as the Framework preset.
   - Leave both the **Build command** and **Build output directory** fields **completely blank**. Do not enter any value.
4. Click **Save and Deploy** at the bottom of the form to prompt global edge nodes to synchronize and go live.

## 📥 Asset Contribution & Maintenance Protocol
1. **Directory Allocation**: Segment and deposit your raw physical graphics strictly according to their binary extension into dedicated subfolders (`icons/svg/` for vector curves, and `icons/png/` for bitmapped graphics).
2. **Registry Documentation**: Edit the root `config.json` file to append your new assets using the standardized schema.
   - *Note: Vectors require a standard hexadecimal `"color"` parameter starting with `#`. Bitmaps do not need any color field. Utilize `source` for vendor context URLs and `info` for rich metadata commentary.*
3. **Automated Lifecycle Loop**: Commit your state directly to the `main` branch via the GitHub app. The Action pipeline will validate the build, dump a newly parsed `pre_config.json` stub trace into your file system for convenient reference, and globally re-stage the Cloudflare deployment within 60 seconds.

## ⚠️ Architectural Trade-offs & Limitations
Currently operating under Phase 2 specifications for high-contrast interface fidelity, the architecture encounters the following infrastructural ceilings under zero-cost self-hosting:
1. **Payload Bloat**: PNG assets are compressed and serialized into heavy Base64 plaintext inside the HTML bundle during assembly. A steep scale in image count will inevitably result in an exponential expansion of `index.html` payload size, degrading time-to-first-paint latency for edge clients.
2. **Syntax Fragility**: The system parses the array with rigid downstream dependency on `config.json`. A single trailing comma or misplaced token typed on a mobile display will break `JSON.parse` at build time, crashing the CI pipeline.
3. **Data Entanglement**: The single-page bundle acts simultaneously as the presentation matrix and the localized runtime database, deviating from enterprise clean-architecture conventions regarding decoupling state from the view layer.

## 🚀 Advanced Optimization Blueprint & Vision (Phase 3)
1. **Decoupled Asset Emission (Overcoming Bloat)**: Re-engineer the build script to write bitmaps out as independent raw files. Swap inline strings for standard image tags and utilize the native browser `IntersectionObserver` interface to facilitate asynchronous lazy-loading, dropping initial payload weight by 10x to yield instantaneous edge load speeds.
2. **Asynchronous State Hydra (State Decoupling)**: Offload icon manifest blobs entirely into an isolated external `data.json` asset, enabling the front-end layout to fetch structural data reactively at application runtime.
3. **Sandbox Fault-Tolerance (Safety Safeguard)**: Wrap parsing mechanisms inside an isolated `try...catch` context blocks. If a configuration token is corrupted, the runner will gracefully skip the isolated anomaly, guaranteeing the public web application stands entirely resilient and never collapses.


# Biblioteca NPC-icons

Una biblioteca de gestión de iconos ligera y auto-alojada, diseñada bajo las pautas de interfaz humana de Apple. Cuenta con alineación de cuadrícula a nivel de píxel y adaptación inteligente de contraste para modos claro y oscuro.

## 🌐 Arquitectura Base del Proyecto
Este repositorio implementa una arquitectura síncrona de doble vía basada en **alojamiento estático Serverless y compilación automatizada en la nube**:
- **Infraestructura Backend**: Desarrollada sobre un motor de automatización en `Node.js (build.js)` que escanea directorios físicos. Implementa un aislamiento estricto de nombres de estilo y mapeo de identificadores unificados basado en el archivo `config.json` mantenido por el usuario, erradicando de raíz la contaminación cruzada de selectores CSS y los conflictos entre formatos SVG y PNG.
- **Canalización CI/CD**: Gestionada completamente a través de `GitHub Actions`. Cualquier cambio de código en la rama `main` activa inmediatamente el recopilador para reconstruir la página estática y realizar un empuje forzado (force-push) de los activos listos directamente en la rama de producción dedicada `gh-pages`.
- **Distribución en el Borde**: Distribuida globalmente a través de `Cloudflare Pages`. Cuenta con tarjetas de visualización con efecto de vidrio esmerilado, cálculos adaptativos de luminancia para el color de fuente, descarga directa de flujos binarios o de texto, y una barra de herramientas optimizada con botones de 48px para evitar clics accidentales en dispositivos móviles.

## 🛠️ Pasos de Despliegue en Cloudflare Pages
1. Inicie sesión en su panel de Cloudflare, vaya a **Workers y Pages** -> **Crear** -> **Pages**.
2. Haga clic en **Conectar a Git**, autorice su identidad de GitHub, seleccione el repositorio `NPC-icons` y haga clic en **Comenzar configuración**.
3. **Configuración Crítica de Compilación**:
   - Configure explícitamente la **Rama de producción** (Production branch) como `gh-pages`.
   - Seleccione **None** en el ajuste preestablecido del marco (Framework preset).
   - Deje los campos **Comando de compilación** (Build command) y **Directorio de salida de compilación** (Build output directory) **completamente en blanco**. No introduzca ningún valor.
4. Haga clic en **Guardar y desplegar** en la parte inferior para que los nodos de borde globales se sincronicen y el sitio se publique.

## 📥 Protocolo de Adición y Mantenimiento de Iconos
1. **Asignación de Directorios**: Organice sus archivos físicos estrictamente según su extensión dentro de las subcarpetas dedicadas (`icons/svg/` para curvas vectoriales y `icons/png/` para imágenes de mapa de bits).
2. **Documentación del Registro**: Edite el archivo `config.json` en la raíz para añadir sus nuevos iconos utilizando el esquema estandarizado.
   - *Nota: Los vectores requieren un parámetro hexadecimal `"color"` estándar que comience con `#`. Los mapas de bits no necesitan ningún campo de color. Utilice `source` para enlaces de contexto oficial e `info` para descripciones detalladas.*
3. **Ciclo de Vida Automatizado**: Confirme sus cambios directamente en la rama `main` a través de la aplicación de GitHub. El sistema validará la compilación, generará un borrador actualizado en `pre_config.json` en su lista de archivos para una referencia conveniente y actualizará globalmente el sitio en Cloudflare en menos de 60 segundos.

## ⚠️ Análisis de Limitaciones del Proyecto
Actualmente operando bajo las especificaciones de la Fase 2, la arquitectura encuentra las siguientes limitaciones bajo un alojamiento propio de costo cero:
1. **Sobrecarga de la Página**: Los activos PNG se codifican directamente como texto Base64 dentro del archivo HTML durante el ensamblaje. Un aumento masivo en el número de imágenes provocará una expansión exponencial del tamaño de `index.html`, ralentizando la velocidad de carga inicial para los usuarios.
2. **Fragilidad de Sintaxis**: El sistema depende rígidamente de la estructura de `config.json`. Una sola coma flotante o un símbolo incorrecto al editar desde un teléfono móvil romperá el análisis JSON (`JSON.parse`) en el momento de la compilación, deteniendo el flujo de trabajo.
3. **Acoplamiento de Datos**: El archivo único `index.html` actúa simultáneamente como la interfaz visual y la base de datos local, lo que se desvía de las normas de arquitectura limpia que exigen separar los datos de la capa de vista.

## 🚀 Plan de Optimización Futura y Visión (Fase 3)
1. **Salida de Archivos Físicos Independientes (Eliminar Sobrecarga)**: Rediseñe el script de compilación para que las imágenes PNG se almacenen como archivos independientes. Reemplace las cadenas de texto internas por etiquetas de imagen estándar y active el mecanismo de carga diferida (lazy-loading) mediante `IntersectionObserver` en el frontend, reduciendo el tamaño de la página 10 veces para lograr cargas instantáneas.
2. **Desacoplamiento de Datos (Datos Asíncronos)**: Guarde los datos de los iconos en un archivo externo `data.json` independiente, permitiendo que la interfaz los solicite de forma asíncrona mediante un flujo `fetch` en el momento de iniciar la página.
3. **Mecanismo de Tolerancia a Fallos (Seguridad y Resiliencia)**: Incluya bloques de control `try...catch` en el script de compilación. Si se comete un error de puntuación en la lista, el sistema omitirá elegantemente el icono con problemas, garantizando que el sitio web global nunca se caiga ni colapse.

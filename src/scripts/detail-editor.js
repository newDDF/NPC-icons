const root = document.querySelector(".detail-workspace");
const controls = root?.querySelector(".editor-controls");
const preview = root?.querySelector(".detail-preview");
const previewImage = preview?.querySelector("img");

if (root && controls && preview && previewImage) {
  const path = controls.dataset.iconPath || "";
  const name = controls.dataset.iconName || "icon";
  const filename = controls.dataset.iconFilename || `${name}.${controls.dataset.iconFormat || "png"}`;
  const format = (controls.dataset.iconFormat || "").toLowerCase();

  const sizeInput = controls.querySelector('[data-editor-control="size"]');
  const sizeOutput = controls.querySelector("[data-size-output]");
  const exportScaleButtons = root.querySelectorAll("[data-export-scale]");
  const exportCustomPanel = root.querySelector("[data-export-custom]");
  const exportWidth = root.querySelector("[data-export-width]");
  const exportHeight = root.querySelector("[data-export-height]");
  let exportScale = "1";

  const status = root.querySelector("[data-editor-status]");

  function activateWorkspace(view) {
    root.querySelectorAll("[data-workspace-tab]").forEach((button) => {
      const active = button.dataset.workspaceTab === view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    root.querySelectorAll("[data-workspace-view]").forEach((panel) => {
      panel.hidden = panel.dataset.workspaceView !== view;
    });

    const heading = root.querySelector(".workspace-editor-heading h2");
    if (heading) heading.textContent = view === "details" ? "Details" : "Customize";
  }

  root.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateWorkspace(button.dataset.workspaceTab || "customize");
    });
  });

  activateWorkspace("customize");

  let originalSvgText = null;
  let customizedSvgText = null;
  let svgLoadPromise = null;
  let paletteInitialized = false;
  const paletteOverrides = new Map();
  const paletteCounts = new Map();
  const paletteContainer = root.querySelector("[data-editor-palette]");
  const paletteStatus = root.querySelector("[data-editor-palette-status]");

  const say = (message) => {
    if (status) status.textContent = message;
  };
  const safeFilename = (value) =>
    value.normalize("NFKC").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, "-");

  function parseSvg(svgText) {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) {
      throw new Error("The source is not a valid SVG document.");
    }

    doc.querySelectorAll("script, foreignObject, iframe, object, embed, audio, video").forEach((node) => node.remove());
    doc.querySelectorAll("*").forEach((node) => {
      for (const attr of [...node.attributes]) {
        const key = attr.name.toLowerCase();
        const value = attr.value.trim();
        if (key.startsWith("on")) node.removeAttribute(attr.name);
        if (
          (key === "href" || key.endsWith(":href")) &&
          value &&
          !value.startsWith("#") &&
          !value.startsWith("data:image/")
        ) {
          node.removeAttribute(attr.name);
        }
        if (key === "style" && /url\s*\(\s*['"]?(?!#)/i.test(value)) {
          node.removeAttribute(attr.name);
        }
      }
    });
    return { doc, svg };
  }

  function normalizeColor(value) {
    const raw = String(value || "").trim();
    if (
      !raw ||
      /^(none|currentcolor|inherit|initial|unset|transparent|context-fill|context-stroke)$/i.test(raw) ||
      /^(url|var)\s*\(/i.test(raw)
    ) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.fillStyle = "#010203";
    const sentinel = ctx.fillStyle;
    ctx.fillStyle = raw;
    if (ctx.fillStyle === sentinel && raw.toLowerCase() !== sentinel) return null;

    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = raw;
    ctx.fillRect(0, 0, 1, 1);
    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    if (pixel[3] !== 255) return null;

    return "#" + [...pixel.slice(0, 3)]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("");
  }

  function visitColorDeclarations(svg, callback) {
    const nodes = [svg, ...svg.querySelectorAll("*")];
    for (const node of nodes) {
      for (const property of ["fill", "stroke"]) {
        if (node.hasAttribute(property)) {
          callback(node, property, node.getAttribute(property), "attribute");
        }
      }

      if (node.hasAttribute("style")) {
        const style = node.getAttribute("style");
        for (const declaration of style.split(";")) {
          const colon = declaration.indexOf(":");
          if (colon < 0) continue;
          const property = declaration.slice(0, colon).trim().toLowerCase();
          if (property !== "fill" && property !== "stroke") continue;
          callback(node, property, declaration.slice(colon + 1).trim(), "style");
        }
      }
    }
  }

  function visitStylesheetColorDeclarations(svg, callback) {
    for (const styleNode of svg.querySelectorAll("style")) {
      const css = styleNode.textContent || "";
      const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
      let match;

      while ((match = rulePattern.exec(css)) !== null) {
        for (const declaration of match[2].split(";")) {
          const colon = declaration.indexOf(":");
          if (colon < 0) continue;

          const property = declaration.slice(0, colon).trim().toLowerCase();
          if (property !== "fill" && property !== "stroke") continue;

          const value = declaration.slice(colon + 1).trim()
            .replace(/\s*!important\s*$/i, "");
          callback(property, value);
        }
      }
    }
  }

  function rewriteStylesheetColors(svg, overrides) {
    for (const styleNode of svg.querySelectorAll("style")) {
      const css = styleNode.textContent || "";

      styleNode.textContent = css.replace(
        /([^{}]+)\{([^{}]*)\}/g,
        (rule, selector, body) => {
          const declarations = body.split(";");
          const parsed = declarations.map((declaration) => {
            const colon = declaration.indexOf(":");
            if (colon < 0) return null;
            return {
              original: declaration,
              property: declaration.slice(0, colon).trim().toLowerCase(),
              value: declaration.slice(colon + 1).trim()
            };
          });

          for (const item of parsed) {
            if (!item || !["fill", "stroke"].includes(item.property)) continue;

            const important = /\s*!important\s*$/i.test(item.value);
            const value = item.value.replace(/\s*!important\s*$/i, "").trim();
            const key = normalizeColor(value);
            if (!key || !overrides.has(key)) continue;

            const override = overrides.get(key);
            const nextColor = typeof override === "string"
              ? override
              : override.color;
            const opacity = typeof override === "string"
              ? 100
              : Math.max(0, Math.min(100, Number(override.opacity ?? 100)));
            const opacityProperty = `${item.property}-opacity`;
            const opacityValue = String(opacity / 100);

            item.value = `${nextColor}${important ? " !important" : ""}`;
            item.original = `${item.property}: ${item.value}`;

            const opacityItem = parsed.find(
              (entry) => entry && entry.property === opacityProperty
            );

            if (opacityItem) {
              opacityItem.value = opacityValue;
              opacityItem.original = `${opacityProperty}: ${opacityValue}`;
            } else if (opacity < 100) {
              parsed.push({
                property: opacityProperty,
                value: opacityValue,
                original: `${opacityProperty}: ${opacityValue}`
              });
            }
          }

          return `${selector}{${parsed.map(
            (item) => item ? item.original : ""
          ).join("; ")}}`;
        }
      );
    }
  }

  function visitImplicitDefaultFillElements(svg, callback) {
    const drawable = svg.querySelectorAll(
      "path, rect, circle, ellipse, polygon, polyline, text, tspan, use"
    );
    const fillRules = [];

    for (const styleNode of svg.querySelectorAll("style")) {
      const css = styleNode.textContent || "";
      const pattern = /([^{}]+)\{([^{}]*)\}/g;
      let match;

      while ((match = pattern.exec(css)) !== null) {
        if (!/(?:^|;)\s*fill\s*:/i.test(match[2])) continue;
        const selectors = match[1].trim();
        if (selectors.startsWith("@")) continue;
        fillRules.push(
          ...selectors.split(",").map((selector) => selector.trim())
        );
      }
    }

    function declaresFill(node) {
      if (node.hasAttribute("fill")) return true;
      if (/(?:^|;)\s*fill\s*:/i.test(node.getAttribute("style") || "")) {
        return true;
      }

      return fillRules.some((selector) => {
        try {
          return node.matches(selector);
        } catch {
          return false;
        }
      });
    }

    for (const node of drawable) {
      let inheritedFill = false;

      for (let current = node; current; current = current.parentElement) {
        if (declaresFill(current)) {
          inheritedFill = true;
          break;
        }
        if (current === svg) break;
      }

      if (!inheritedFill) callback(node);
    }
  }

  function discoverPalette(svgText) {
    const { svg } = parseSvg(svgText);
    paletteCounts.clear();

    visitColorDeclarations(svg, (_node, _property, value) => {
      const key = normalizeColor(value);
      if (key) paletteCounts.set(key, (paletteCounts.get(key) || 0) + 1);
    });

    visitStylesheetColorDeclarations(svg, (_property, value) => {
      const key = normalizeColor(value);
      if (key) paletteCounts.set(key, (paletteCounts.get(key) || 0) + 1);
    });

    visitImplicitDefaultFillElements(svg, () => {
      const key = "#000000";
      paletteCounts.set(key, (paletteCounts.get(key) || 0) + 1);
    });

    if (paletteContainer) {
      paletteContainer.replaceChildren();

      if (paletteCounts.size) {
        const grid = document.createElement("div");
        grid.className = "editor-palette-grid";
        grid.setAttribute("role", "group");
        grid.setAttribute("aria-label", "SVG colors");

        const editor = document.createElement("div");
        editor.className = "editor-palette-editor";
        editor.hidden = true;

        const picker = document.createElement("input");
        picker.type = "color";
        picker.setAttribute("aria-label", "Selected color");

        const hex = document.createElement("input");
        hex.type = "text";
        hex.className = "editor-palette-hex";
        hex.maxLength = 7;
        hex.spellcheck = false;
        hex.setAttribute("aria-label", "Hex color");

        const opacityGroup = document.createElement("div");
        opacityGroup.className = "editor-palette-opacity";

        const opacityLabel = document.createElement("label");
        opacityLabel.textContent = "Opacity";

        const opacityOutput = document.createElement("output");
        opacityOutput.textContent = "100%";

        const opacityRange = document.createElement("input");
        opacityRange.type = "range";
        opacityRange.min = "0";
        opacityRange.max = "100";
        opacityRange.step = "1";
        opacityRange.value = "100";
        opacityRange.setAttribute("aria-label", "Color opacity");

        opacityGroup.append(opacityLabel, opacityOutput, opacityRange);
        editor.append(picker, hex, opacityGroup);
        paletteContainer.append(grid, editor);

        let selectedColor = null;
        const swatches = new Map();

        function getOverride(sourceColor) {
          return paletteOverrides.get(sourceColor) || {
            color: sourceColor,
            opacity: 100
          };
        }

        function selectColor(sourceColor) {
          selectedColor = sourceColor;
          const override = getOverride(sourceColor);
          picker.value = override.color;
          hex.value = override.color.toUpperCase();
          opacityRange.value = String(override.opacity);
          opacityOutput.textContent = `${override.opacity}%`;
          editor.hidden = false;

          for (const [color, button] of swatches) {
            button.setAttribute("aria-pressed", String(color === sourceColor));
          }
        }

        function updateSelectedColor(value) {
          if (!selectedColor) return;
          if (!/^#[0-9a-f]{6}$/i.test(value)) {
            if (paletteStatus) paletteStatus.textContent = "Invalid HEX";
            return;
          }

          const nextColor = value.toLowerCase();
          const previous = getOverride(selectedColor);
          paletteOverrides.set(selectedColor, { ...previous, color: nextColor });

          const swatch = swatches.get(selectedColor);
          if (swatch) swatch.querySelector("span").style.backgroundColor = nextColor;

          picker.value = nextColor;
          hex.value = nextColor.toUpperCase();
          if (paletteStatus) paletteStatus.textContent = "Color updated";
          refreshCustomizedPreview();
        }

        for (const [sourceColor, count] of paletteCounts) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "editor-palette-swatch";
          button.title = `${sourceColor.toUpperCase()} · ${count}`;
          button.setAttribute("aria-label", `Edit ${sourceColor}`);
          button.setAttribute("aria-pressed", "false");

          const dot = document.createElement("span");
          dot.style.backgroundColor = sourceColor;
          button.append(dot);
          button.addEventListener("click", () => selectColor(sourceColor));

          grid.append(button);
          swatches.set(sourceColor, button);
        }

        picker.addEventListener("input", () => updateSelectedColor(picker.value));
        hex.addEventListener("change", () => updateSelectedColor(hex.value.trim()));

        opacityRange.addEventListener("input", () => {
          if (!selectedColor) return;
          const previous = getOverride(selectedColor);
          const opacity = Number(opacityRange.value);
          paletteOverrides.set(selectedColor, { ...previous, opacity });
          opacityOutput.textContent = `${opacity}%`;
          if (paletteStatus) paletteStatus.textContent = "Opacity updated";
          refreshCustomizedPreview();
        });
      }
    }

    paletteInitialized = true;
    if (paletteStatus) {
      paletteStatus.textContent = paletteCounts.size
        ? `${paletteCounts.size} colors`
        : "No editable solid colors";
    }
  }

  function applyColorOverrides(svgText, overrides) {
    const { doc, svg } = parseSvg(svgText);

    visitColorDeclarations(svg, (node, property, value, source) => {
      const key = normalizeColor(value);
      if (!key || !overrides.has(key)) return;
      const override = overrides.get(key);
      const nextColor = typeof override === "string" ? override : override.color;
      const opacity = typeof override === "string" ? 100 : override.opacity;

      if (source === "attribute") {
        node.setAttribute(property, nextColor);
      } else {
        const style = node.getAttribute("style") || "";
        const updated = style.split(";").map((declaration) => {
          const colon = declaration.indexOf(":");
          if (colon < 0) return declaration;
          const name = declaration.slice(0, colon).trim().toLowerCase();
          const current = declaration.slice(colon + 1).trim();
          return name === property && normalizeColor(current) === key
            ? `${declaration.slice(0, colon + 1)} ${nextColor}`
            : declaration;
        }).join(";");
        node.setAttribute("style", updated);
      }

      const opacityProperty = `${property}-opacity`;
      const opacityValue = String(Math.max(0, Math.min(100, Number(opacity))) / 100);
      if (node.hasAttribute(opacityProperty) || opacity < 100) {
        node.setAttribute(opacityProperty, opacityValue);
      }
      if (node.hasAttribute("style")) {
        const style = node.getAttribute("style") || "";
        const declarations = style.split(";").filter((part) => part.trim());
        let found = false;
        const updated = declarations.map((declaration) => {
          const colon = declaration.indexOf(":");
          if (colon < 0) return declaration;
          if (declaration.slice(0, colon).trim().toLowerCase() !== opacityProperty) return declaration;
          found = true;
          return `${opacityProperty}: ${opacityValue}`;
        });
        if (opacity < 100 || found) {
          if (!found) updated.push(`${opacityProperty}: ${opacityValue}`);
          node.setAttribute("style", updated.join("; ") + ";");
        }
      }
    });

    if (overrides.has("#000000")) {
      visitImplicitDefaultFillElements(svg, (node) => {
        const override = overrides.get("#000000");
        const nextColor = typeof override === "string"
          ? override
          : override.color;
        node.setAttribute("fill", nextColor);

        const opacity = typeof override === "string"
          ? 100
          : Math.max(0, Math.min(100, Number(override.opacity ?? 100)));
        if (opacity < 100) {
          node.setAttribute("fill-opacity", String(opacity / 100));
        }
      });
    }

    rewriteStylesheetColors(svg, overrides);

    return new XMLSerializer().serializeToString(doc);
  }

  async function loadSvg() {
    if (format !== "svg") throw new Error("Color editing is only available for SVG icons.");
    if (!svgLoadPromise) {
      svgLoadPromise = fetch(path).then(async (response) => {
        if (!response.ok) throw new Error(`Could not load SVG (${response.status}).`);
        originalSvgText = await response.text();
        return originalSvgText;
      });
    }
    return svgLoadPromise;
  }

  async function refreshCustomizedPreview() {
    if (format !== "svg") return;
    try {
      const source = await loadSvg();
      if (!paletteInitialized) discoverPalette(source);

      customizedSvgText = applyColorOverrides(source, paletteOverrides);
      const blob = new Blob([customizedSvgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const oldUrl = previewImage.dataset.objectUrl;
      previewImage.src = url;
      previewImage.dataset.objectUrl = url;
      if (oldUrl) URL.revokeObjectURL(oldUrl);
    } catch (error) {
      say(error instanceof Error ? error.message : "Could not update the SVG preview.");
    }
  }

  sizeInput?.addEventListener("input", () => {
    const size = Number(sizeInput.value);
    previewImage.style.width = `${size}px`;
    previewImage.style.height = `${size}px`;
    previewImage.style.maxWidth = "85%";
    previewImage.style.maxHeight = "85%";
    if (sizeOutput) sizeOutput.value = `${size} px`;
  });

  root.querySelectorAll("[data-editor-bg]").forEach((button) => {
    button.addEventListener("click", () => {
      const background = button.dataset.editorBg || "transparent";
      preview.dataset.previewBg = background === "transparent" ? "" : background;
      root.querySelectorAll("[data-editor-bg]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    });
  });


  function saveBlob(blob, outputName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = outputName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function setExportScale(value) {
    exportScale = value;
    exportScaleButtons.forEach((button) => {
      const active = button.dataset.exportScale === value;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (exportCustomPanel) exportCustomPanel.hidden = value !== "custom";
  }

  exportScaleButtons.forEach((button) => {
    button.addEventListener("click", () => setExportScale(button.dataset.exportScale || "1"));
  });

  function getSvgBaseDimensions(svgText) {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svg = doc.documentElement;
    const viewBox = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
    if (viewBox.length === 4 && viewBox.every(Number.isFinite) && viewBox[2] > 0 && viewBox[3] > 0) {
      return { width: viewBox[2], height: viewBox[3] };
    }
    const width = Number.parseFloat(svg.getAttribute("width") || "");
    const height = Number.parseFloat(svg.getAttribute("height") || "");
    return {
      width: Number.isFinite(width) && width > 0 ? width : 512,
      height: Number.isFinite(height) && height > 0 ? height : 512
    };
  }

  function getExportDimensions(baseWidth = 512, baseHeight = 512) {
    let width;
    let height;

    if (exportScale === "custom") {
      width = Number(exportWidth?.value);
      height = Number(exportHeight?.value);
      if (!Number.isInteger(width) || !Number.isInteger(height) ||
          width < 16 || height < 16 || width > 4096 || height > 4096) {
        throw new Error("Custom dimensions must be whole numbers from 16 to 4096 px.");
      }
    } else {
      const scale = Number(exportScale);
      if (![1, 2, 4, 8].includes(scale)) throw new Error("Choose a valid export scale.");
      width = Math.round(baseWidth * scale);
      height = Math.round(baseHeight * scale);
      if (width < 1 || height < 1 || width > 4096 || height > 4096) {
        throw new Error("This scale exceeds the 4096 px export limit. Choose a smaller scale or Custom.");
      }
    }
    return { width, height };
  }

  async function getExportSvg(customized, setDimensions = false) {
    const source = await loadSvg();
    const output = customized ? applyColorOverrides(source, paletteOverrides) : source;
    if (!setDimensions) return output;

    const doc = new DOMParser().parseFromString(output, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) {
      throw new Error("Could not prepare the customized SVG.");
    }
    const base = getSvgBaseDimensions(source);
    const { width, height } = getExportDimensions(base.width, base.height);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    return new XMLSerializer().serializeToString(doc);
  }

  async function exportRaster(targetFormat) {
    let objectUrl = "";
    try {
      let imageSource = path;
      if (format === "svg") {
        const svgText = await getExportSvg(true);
        objectUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
        imageSource = objectUrl;
      }

      const image = new Image();
      image.src = imageSource;
      await image.decode();

      const { width: outputWidth, height: outputHeight } = getExportDimensions(
        image.naturalWidth || 512,
        image.naturalHeight || 512
      );
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");

      context.clearRect(0, 0, outputWidth, outputHeight);
      const scale = Math.min(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(image, (outputWidth - drawWidth) / 2, (outputHeight - drawHeight) / 2, drawWidth, drawHeight);

      const mime = targetFormat === "webp" ? "image/webp" : "image/png";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
      if (!blob) throw new Error(`Could not encode ${targetFormat.toUpperCase()}.`);
      if (targetFormat === "webp" && blob.type !== "image/webp") {
        throw new Error("This browser does not support WebP export.");
      }
      saveBlob(blob, `${safeFilename(name)}.${targetFormat}`);
      say(`${targetFormat.toUpperCase()} export started. Processing stays in your browser.`);
    } catch (error) {
      say(error instanceof Error ? error.message : "Export failed.");
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  root.querySelectorAll("[data-editor-export]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.dataset.editorExport;
      button.disabled = true;
      say("Preparing export…");
      try {
        if (target === "svg") {
          const svgText = await getExportSvg(true, true);
          saveBlob(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }), `${safeFilename(name)}-custom.svg`);
          say("Customized SVG export started.");
        } else if (target === "png" || target === "webp") {
          await exportRaster(target);
        }
      } catch (error) {
        say(error instanceof Error ? error.message : "Export failed.");
      } finally {
        button.disabled = false;
      }
    });
  });

  if (format === "svg") refreshCustomizedPreview();
}

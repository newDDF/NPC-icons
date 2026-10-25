const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
let temp = null;

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function copyFile(relative) {
  fs.cpSync(path.join(root, relative), path.join(temp, relative), {
    recursive: true
  });
}

function findByName(directory, filename) {
  if (!fs.existsSync(directory)) return false;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name === filename) return true;
    if (entry.isDirectory() && findByName(fullPath, filename)) return true;
  }
  return false;
}

function assert(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
  console.log("PASS: " + message);
}

function snapshotProductionFiles() {
  const files = [
    "config.json",
    "data/id-registry.json",
    "data/legacy-id-map.json",
    "public/data/icons.json",
    "public/api/icons.json",
    "dist/index.html"
  ];

  return new Map(files.map((relative) => {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) {
      return [relative, null];
    }

    const hash = require("node:crypto")
      .createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex");

    return [relative, hash];
  }));
}

function verifyProductionFiles(snapshot) {
  for (const [relative, beforeHash] of snapshot) {
    const file = path.join(root, relative);
    let afterHash = null;

    if (fs.existsSync(file)) {
      afterHash = require("node:crypto")
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex");
    }

    assert(
      afterHash === beforeHash,
      "Production file unchanged: " + relative
    );
  }
}

let productionSnapshot = null;

try {
  productionSnapshot = snapshotProductionFiles();
  temp = fs.mkdtempSync(path.join(os.tmpdir(), "npc-icons-smoke-"));

  for (const file of [
    "build.cjs",
    "ecosystem.cjs",
    "package.json",
    "astro.config.mjs",
    "tsconfig.json",
    "src",
    "assets"
  ]) {
    copyFile(file);
  }

  const packageFiles = [
    "package.json",
    "index.js",
    "index.d.ts",
    "LICENSE",
    "README.md"
  ];

  for (const file of packageFiles) {
    const source = path.join(root, "packages/npc-icons", file);
    if (fs.existsSync(source)) {
      const destination = path.join(temp, "packages/npc-icons", file);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
    }
  }

  fs.symlinkSync(
    path.join(root, "node_modules"),
    path.join(temp, "node_modules"),
    "dir"
  );

  const icons = [
    {
      name: "smoke-circle",
      color: "#2457C5",
      format: "svg",
      source: "",
      info: "Smoke test SVG icon.",
      category: ["Smoke Test"]
    },
    {
      name: "smoke-wordmark",
      color: "#111111",
      format: "svg",
      source: "",
      info: "Smoke test SVG wordmark.",
      category: ["Smoke Test"]
    },
    {
      name: "smoke-pixel-png",
      color: "",
      format: "png",
      source: "",
      info: "Smoke test PNG icon.",
      category: ["Smoke Test"]
    }
  ];

  writeJson(path.join(temp, "config.json"), icons);

  const records = [
    {
      id: "900001",
      name: "smoke-circle",
      format: "svg",
      filename: "smoke-circle.svg",
      status: "active"
    },
    {
      id: "900002",
      name: "smoke-wordmark",
      format: "svg",
      filename: "smoke-wordmark.svg",
      status: "active"
    },
    {
      id: "900003",
      name: "smoke-pixel-png",
      format: "png",
      filename: "smoke-pixel.png",
      status: "active"
    },
    {
      id: "900004",
      name: "smoke-retired",
      format: "svg",
      filename: "smoke-retired.svg",
      status: "retired"
    }
  ];

  writeJson(path.join(temp, "data/id-registry.json"), {
    schemaVersion: 1,
    nextId: "900005",
    records
  });

  writeJson(path.join(temp, "data/legacy-id-map.json"), {
    schemaVersion: 1,
    mappings: {
      "smoke-circle-svg": "900001",
      "smoke-wordmark-svg": "900002",
      "smoke-pixel-png": "900003",
      "smoke-retired-svg": "900004"
    }
  });

  const svgDir = path.join(temp, "icons/svg");
  const pngDir = path.join(temp, "icons/png");
  fs.mkdirSync(svgDir, { recursive: true });
  fs.mkdirSync(pngDir, { recursive: true });

  const svg = (color, label) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${label}</title><circle cx="12" cy="12" r="10" fill="${color}"/></svg>\n`;

  fs.writeFileSync(
    path.join(svgDir, "smoke-circle.svg"),
    svg("#2457C5", "Smoke Circle")
  );
  fs.writeFileSync(
    path.join(svgDir, "smoke-wordmark.svg"),
    svg("#111111", "Smoke Wordmark")
  );

  // A valid, transparent 1x1 PNG fixture.
  fs.writeFileSync(
    path.join(pngDir, "smoke-pixel.png"),
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ6sAAAAASUVORK5CYII=",
      "base64"
    )
  );

  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawnSync(npm, ["run", "build"], {
    cwd: temp,
    stdio: "inherit",
    env: process.env
  });

  if (build.error) throw build.error;
  if (build.status !== 0) {
    throw new Error("Isolated smoke build failed with exit code " + build.status);
  }

  const dist = path.join(temp, "dist");

  for (const file of [
    "index.html",
    "icons/900001/index.html",
    "icons/900002/index.html",
    "icons/900003/index.html",
    "icons/900004/index.html",
    "icons/smoke-circle-svg/index.html",
    "icons/smoke-retired-svg/index.html",
    "api/icons/900001.json",
    "api/icons/900004.json",
    "api/icons/smoke-circle-svg.json",
  ]) {
    assert(
      fs.existsSync(path.join(dist, file)),
      "Generated " + file
    );
  }

  assert(findByName(dist, "smoke-circle.svg"), "Generated SVG asset");
  assert(findByName(dist, "smoke-pixel.png"), "Generated PNG asset");

  const retiredPage = fs.readFileSync(
    path.join(dist, "icons/900004/index.html"),
    "utf8"
  );
  assert(
    retiredPage.includes("retired") &&
      !retiredPage.includes('class="detail-primary"'),
    "Retired icon has no download action"
  );

  const api = JSON.parse(
    fs.readFileSync(path.join(dist, "api/icons/900001.json"), "utf8")
  );
  assert(api.id === "900001", "Permanent ID is preserved in API");

  const legacyApi = JSON.parse(
    fs.readFileSync(
      path.join(dist, "api/icons/smoke-circle-svg.json"),
      "utf8"
    )
  );
  assert(
    legacyApi.permanentId === "900001",
    "Legacy API alias resolves to permanent ID"
  );

  const sitemap = fs.readFileSync(
    path.join(dist, "sitemap.xml"),
    "utf8"
  );
  assert(
    sitemap.includes("/icons/900001/") &&
      !sitemap.includes("/icons/900004/"),
    "Sitemap includes active IDs but excludes retired IDs"
  );

  const packageData = JSON.parse(
    fs.readFileSync(
      path.join(temp, "packages/npc-icons/data/icons.json"),
      "utf8"
    )
  );
  assert(packageData.length === 3, "Test npm package contains only 3 active icons");

} catch (error) {
  console.error("\nSMOKE BUILD FAILED");
  console.error(error.stack || error);
  process.exitCode = 1;
} finally {
  try {
    if (productionSnapshot) {
      verifyProductionFiles(productionSnapshot);
    }
  } catch (verificationError) {
    console.error("ERROR: Production file integrity check failed.");
    console.error(verificationError.stack || verificationError);
    process.exitCode = 1;
  }

  if (temp) {
    try {
      fs.rmSync(temp, { recursive: true, force: true });
      console.log("Temporary smoke directory cleaned up.");
    } catch (cleanupError) {
      console.error("ERROR: Failed to clean temporary smoke directory:", temp);
      console.error(cleanupError.stack || cleanupError);
      process.exitCode = 1;
    }
  }

  if (process.exitCode !== 1) {
    console.log("\nSMOKE BUILD PASSED");
    console.log("Production files were not used as build output.");
  }
}

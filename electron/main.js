// Electron main process for Momentum.
// Serves the statically-exported Next.js app (../out) through a custom `app://`
// origin so it behaves exactly like a website loaded from a web root
// (absolute and relative asset paths, favicon, and localStorage all work).

const { app, BrowserWindow, protocol } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const OUT_DIR = path.join(__dirname, "..", "out");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain",
  ".map": "application/json",
};

// Register the custom scheme as a privileged, standard, secure origin before the
// app is ready (required for localStorage, fetch, relative URLs, etc.).
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

function resolveFilePath(requestUrl) {
  const { pathname } = new URL(requestUrl);
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  const filePath = path.normalize(path.join(OUT_DIR, rel));
  // Guard against path traversal outside the export directory.
  if (!filePath.startsWith(OUT_DIR)) return path.join(OUT_DIR, "index.html");
  return filePath;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 600,
    backgroundColor: "#0A0C10",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL("app://local/index.html");
}

app.whenReady().then(() => {
  protocol.handle("app", async (request) => {
    const filePath = resolveFilePath(request.url);
    try {
      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      return new Response(data, {
        headers: { "content-type": MIME[ext] || "application/octet-stream" },
      });
    } catch {
      // Fall back to the SPA entry point for any unknown path.
      const html = await fs.promises.readFile(path.join(OUT_DIR, "index.html"));
      return new Response(html, { headers: { "content-type": "text/html" } });
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

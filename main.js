/**
 * Main Process - Handles window lifecycle, IPC communication, and OS-level operations.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * Creates the primary application window.
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Use preload script for secure IPC communication
      preload: path.join(__dirname, 'preload.js'),
      // Isolate context for security
      contextIsolation: true,
      // Disable Node integration in renderer for security
      nodeIntegration: false,
    },
  });

  // Load the initial HTML interface
  win.loadFile('index.html');
}

// Lifecycle: App initialization
app.whenReady().then(() => {
  createWindow();

  // Re-create window on macOS when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Lifecycle: Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * IPC Handler: get-themes
 * Scans the /temas directory for subfolders.
 * @returns {string[]} List of theme names.
 */
ipcMain.handle('get-themes', () => {
  const themesDir = path.join(__dirname, 'temas');
  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir);
  }
  return fs.readdirSync(themesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
});

/**
 * IPC Handler: get-images
 * Reads all supported images from a theme folder and converts them to Base64.
 * Shuffles the list before returning.
 * @param {string} themeName - Subfolder name in /temas.
 * @returns {string[]} Array of Base64 image URIs.
 */
ipcMain.handle('get-images', (event, themeName) => {
  const themeDir = path.join(__dirname, 'temas', themeName);
  if (!fs.existsSync(themeDir)) return [];

  const files = fs.readdirSync(themeDir);
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

  const images = files.filter(file => {
    return imageExtensions.includes(path.extname(file).toLowerCase());
  }).map(file => {
    const filePath = path.join(themeDir, file);
    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString('base64');
    // Extract extension for MIME type, default to png if unknown
    const ext = path.extname(file).slice(1) || 'png';
    const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    return `data:${mimeType};base64,${base64}`;
  });

  // Fisher-Yates Shuffle Algorithm
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [images[i], images[j]] = [images[j], images[i]];
  }

  return images;
});

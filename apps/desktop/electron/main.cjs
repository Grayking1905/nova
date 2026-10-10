const { app, BrowserWindow, desktopCapturer, ipcMain, session } = require("electron");
const path = require("path");

const isDevelopment = !app.isPackaged && !process.argv.includes('--production');
let mainWindow;
let selectedSource = null;
function trustedFrame(frame) {
  if (!mainWindow || frame !== mainWindow.webContents.mainFrame) return false;
  return isDevelopment ? /^http:\/\/(localhost|127\.0\.0\.1):5173\//.test(frame.url) : frame.url.startsWith('file://');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,

    backgroundColor: "#0b0f14",

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),

      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../dist/index.html")
    );
  }
}

app.whenReady().then(() => {
  ipcMain.handle('nova:screen-sources', async (event) => {
    if (!trustedFrame(event.senderFrame)) throw new Error('Untrusted frame');
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 300, height: 180 } });
    return sources.map(source => ({ id: source.id, name: source.name, thumbnail: source.thumbnail.toDataURL() }));
  });
  ipcMain.handle('nova:select-screen', async (event, id) => {
    if (!trustedFrame(event.senderFrame) || typeof id !== 'string') throw new Error('Invalid capture request');
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] });
    selectedSource = sources.find(source => source.id === id) || null;
    if (!selectedSource) throw new Error('This window is no longer available.');
  });
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    if (!trustedFrame(request.frame) || !selectedSource) { callback(null); return; }
    const source = selectedSource; selectedSource = null;
    callback({ video: source });
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

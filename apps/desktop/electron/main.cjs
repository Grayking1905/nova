const { app, BrowserWindow, desktopCapturer, ipcMain, session, shell } = require("electron");
const path = require("path");

const isDevelopment = !app.isPackaged && !process.argv.includes('--production');
const applicationURL = isDevelopment ? 'http://localhost:5173' : (process.env.NOVA_APP_URL || 'http://localhost:3001');
const target = new URL(applicationURL);
if (target.protocol !== 'https:' && !(target.protocol === 'http:' && ['localhost','127.0.0.1'].includes(target.hostname))) throw new Error('Use HTTPS or a loopback server for the desktop app.');
let mainWindow;
let selectedSource = null;
function trustedFrame(frame) {
  if (!mainWindow || frame !== mainWindow.webContents.mainFrame) return false;
  try { return new URL(frame.url).origin === target.origin; } catch { return false; }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,

    backgroundColor: "#f7f9ef",

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),

      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => { try { const link=new URL(url);if(['http:','https:'].includes(link.protocol))void shell.openExternal(link.href); } catch {} return {action:'deny'}; });
  mainWindow.webContents.on('will-navigate', (event, url) => { try { if (new URL(url).origin !== target.origin) event.preventDefault(); } catch { event.preventDefault(); } });
  mainWindow.loadURL(applicationURL);
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

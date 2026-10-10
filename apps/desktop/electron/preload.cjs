const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  getScreenSources: () => ipcRenderer.invoke('nova:screen-sources'),
  selectScreenSource: (id) => ipcRenderer.invoke('nova:select-screen', id)
});

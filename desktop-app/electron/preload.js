import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  ping: async () => await ipcRenderer.invoke("ping"),
  sendTrackingData: (data) => ipcRenderer.send("tracking-data", data),
  onTrackingResponse: (callback) => ipcRenderer.on("tracking-response", callback),
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Preload loaded, secure API exposed");
});

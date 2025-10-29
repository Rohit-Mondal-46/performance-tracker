// import { app, BrowserWindow, ipcMain, session } from "electron";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// let mainWindow;

// const createWindow = () => {
//   mainWindow = new BrowserWindow({
//     width: 1000,
//     height: 800,
//     minWidth: 900,
//     minHeight: 700,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//       webSecurity: true,
//       allowRunningInsecureContent: false,
//       experimentalFeatures: false,
//     },
//   });

//   // Set up CSP headers - FIXED to allow external scripts
//   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src 'self'; " +
//           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
//           "style-src 'self' 'unsafe-inline'; " +
//           "img-src 'self' data: blob:; " +
//           "font-src 'self'; " +
//           "connect-src 'self' https://cdn.jsdelivr.net; " +
//           "worker-src 'self' blob:; " +
//           "child-src 'self'; " +
//           "object-src 'none'; " +
//           "media-src 'self';"
//         ]
//       }
//     });
//   });

//   // Development mode: Vite dev server
//   if (process.env.VITE_DEV_SERVER_URL) {
//     mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
//     mainWindow.webContents.openDevTools();
//   } else {
//     // Production mode: load built index.html
//     mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
//   }

//   mainWindow.on("closed", () => {
//     mainWindow = null;
//   });
// };

// app.whenReady().then(() => {
//   createWindow();

//   app.on("activate", () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });

//   // IPC handlers
//   ipcMain.handle("ping", () => "pong");
  
//   // Handle tracking data from renderer
//   ipcMain.on("tracking-data", (event, data) => {
//     console.log("Received tracking data:", data);
//     event.sender.send("tracking-response", { status: "received", data });
//   });
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });


import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // ← DISABLE FOR DEVELOPMENT
      allowRunningInsecureContent: true, // ← ALLOW FOR DEVELOPMENT
      experimentalFeatures: false,
      webgl: true,
    },
  });

  // REMOVE CSP entirely for development
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });

  // Development mode
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle("ping", () => "pong");
  ipcMain.on("tracking-data", (event, data) => {
    console.log("Received tracking data:", data);
    event.sender.send("tracking-response", { status: "received", data });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
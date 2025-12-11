//desktop-app/electron/main.js
import { app, BrowserWindow, ipcMain, session } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

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
      webSecurity: false, // development only
      allowRunningInsecureContent: true,
    },
  });

  // disable CORS + CSP in dev
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath).catch(err => {
      console.error('❌ Failed to load index.html:', err);
    });
  }

  // Add error handlers for debugging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.on("closed", () => (mainWindow = null));
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Simple ping
  ipcMain.handle("ping", () => "pong");

  // =====================================================
  // 🔐 AUTH LOGIC (ELECTRON SIDE)
  // =====================================================

  // ------ 1) LOGIN ------
  ipcMain.handle("auth:login", async (event, creds) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/employee/login", {
        email: creds.email,
        password: creds.password,
      });

      // Backend returns { success: true, message: '...', data: { token, user, role } }
      if (res.data && res.data.success && res.data.data) {
        const { token, user, role } = res.data.data;

        // Store JWT securely inside Electron cookies
        await session.defaultSession.cookies.set({
          url: "http://localhost",
          name: "authToken",
          value: token,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
        
        return { 
          success: true, 
          user: { ...user, role: role || user.role || 'employee' }
        };
      }

      return { success: false, message: res.data?.message || "Invalid credentials" };
    } catch (err) {
      console.error("❌ Electron: Login failed:", err.message);
      const errorMessage = err.response?.data?.message || err.message || "Invalid credentials";
      return { success: false, message: errorMessage };
    }
  });

  // ------ 2) CHECK AUTH / GET TOKEN ------
  ipcMain.handle("auth:getToken", async () => {
    const cookies = await session.defaultSession.cookies.get({ name: "authToken" });
    if (cookies.length === 0) return null;
    return cookies[0].value;
  });

  // ------ 3) LOGOUT ------
  ipcMain.handle("auth:logout", async () => {
    await session.defaultSession.cookies.remove("http://localhost", "authToken");
    return { success: true };
  });

  // Example: Receive tracking data
  ipcMain.on("tracking-data", (event, data) => {
    event.sender.send("tracking-response", { status: "received", data });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

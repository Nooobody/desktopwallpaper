import { app, BrowserWindow, globalShortcut, dialog, ipcMain } from 'electron';
import { U, windef, types } from "win32-api";
import * as ref from "ref";
const Struct = require("ref-struct");
import * as ffi from "ffi";
const electron = require("electron");

const http = require("https");
const fs = require("fs");

const user32 = U.load();

import initContextMenu from './menu';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
const shortcuts = [{
  key: "VolumeDown",
  func() {
    mainWindow.webContents.send("shortcut", "volumeDown");
  }
}, {
  key: "VolumeUp",
  func() {
    mainWindow.webContents.send("shortcut", "volumeUp");
  }
}, {
  key: "MediaPlayPause",
  func() {
    mainWindow.webContents.send("shortcut", "mediaPlayPause");
  }
}, {
  key: "MediaNextTrack",
  func() {
    mainWindow.webContents.send("shortcut", "mediaSwitchNext");
  }
}, {
  key: "MediaPreviousTrack",
  func() {
    mainWindow.webContents.send("shortcut", "mediaSwitchPrevious");
  }
}];

function createShortcut(key, func) {
  let short = globalShortcut.register(key, func);
  if (!short) {
    console.log("Registration failed for key: ", key);
  }
}

const Rect = Struct({
  "left": "int",
  "top": "int",
  "right": "int",
  "bottom": "int"
});
const RectPtr = ref.refType(Rect);

const userFuncs = new ffi.Library("user32.dll", {
  "GetForegroundWindow": ["uint32", []],
  "GetWindowRect": ["int", ["uint32", RectPtr]],
  "SetWindowPos": ["int", ["int", "int", "int", "int", "int", "int", "uint"]]
});

const createWindow = () => {

  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  // let width = 500;
  // let height = 500;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: false,
    resizable: false,
    movable: false,
    closable: false,
    minimizable: false,
    maximizable: false,
    fullscreen: false,
    skipTaskbar: true
  });
  //mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/client/index.html`);

  if (process.env.NODE_ENV !== 'production') {
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
  }

  // So we don't lose the bottom-most status when focused.
  mainWindow.on("focus", () => {
    // SetBottomMost(mainWindow.getNativeWindowHandle());
    let wndHandle = mainWindow.getNativeWindowHandle().readInt32LE();
    userFuncs.SetWindowPos(wndHandle, 1, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0010)
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // SetBottomMost(mainWindow.getNativeWindowHandle());
  initContextMenu(mainWindow.webContents, mainWindow);

  for (let short of shortcuts) {
    createShortcut(short.key, short.func);
  }

  ipcMain.on("saveFavorites", async (_, favorites) => {
    let path = dialog.showOpenDialog({
      properties: ['openDirectory']
    })[0];

    let progress = 0;
    mainWindow.send("favoriteProgress", progress);

    for (let img of favorites) {
      let name = img.split("/");
      name = name[name.length - 1];

      let p = path + "/" + name;
      if (!fs.existsSync(p)) {
        // let file = fs.createWriteStream(path + "/" + name);
        console.log("Saving", name);
        await (new Promise((resolve, reject) => {
          http.get(img, (resp) => {
            let rawData = "";
            resp.setEncoding('binary');
            resp.on('data', (chunk) => {rawData += chunk});
            resp.on('end', () => {
              fs.writeFileSync(p, rawData, 'binary');
              resolve();
            });
            resp.on('error', (e) => {reject(e)});
          });
        }));
        console.log("Finished", name);
        // let request = await http.get(img, (resp) => {
        //   resp.pipe(file);
        // });
      }
      progress += 1;
      mainWindow.send("favoriteProgress", progress);
    }
    mainWindow.send('favoriteProgress', -1);
  });

  let wndHandle = mainWindow.getNativeWindowHandle().readInt32LE();
  userFuncs.SetWindowPos(wndHandle, 1, 0, 0, 0, 0, 0x0002 | 0x0001 | 0x0010)

  setInterval(() => {
    let wnd = userFuncs.GetForegroundWindow();

    if (wndHandle === wnd) {
      //console.log("We are focused!");
      mainWindow.webContents.send("hidden", false);
    }
    else {
      let rect = new Rect();
      userFuncs.GetWindowRect(wnd, rect.ref());

      if (rect.left <= 0 &&
          rect.top <= 0 &&
          rect.right >= width &&
          rect.bottom >= height) {
            //console.log("We are covered!");
            mainWindow.webContents.send("hidden", true);
          }
      else {
        mainWindow.webContents.send("hidden", false);
      }
      //console.log(rect);
    }
  }, 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }

  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.setAppUserModelId(process.execPath);

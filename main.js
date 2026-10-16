const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let lastTrayStatus = {
  currentWaqtName: 'লোডিং...',
  nextWaqtName: 'লোডিং...',
  nextWaqtTime: ''
};

// সিঙ্গেল ইনস্ট্যান্স লক (যাতে একাধিক অ্যাপ একসঙ্গে ওপেন না হয়)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');

  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    minWidth: 800,
    minHeight: 650,
    title: 'সালাত রিমাইন্ডার',
    icon: iconPath,
    backgroundColor: '#0a0f1d',
    show: false,
    frame: false, // আধুনিক কাস্টম ফ্রেমলেস টাইটেলবার
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // ক্লোজ বাটনে ক্লিক করলে অ্যাপ বন্ধ না হয়ে ব্যাকগ্রাউন্ডে ট্রে-তে যাবে
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();

      if (Notification.isSupported()) {
        const notif = new Notification({
          title: 'সালাত রিমাইন্ডার',
          body: 'অ্যাপটি ব্যাকগ্রাউন্ডে চলছে। ওয়াক্তের সময় স্বয়ংক্রিয় অ্যালার্ম বাজবে। পুনরায় খুলতে সিস্টেম ট্রে আইকনে ক্লিক করুন।',
          icon: iconPath,
          silent: true
        });
        notif.show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayImage = nativeImage.createFromPath(trayIconPath);
  if (trayImage.isEmpty()) {
    // ফলব্যাক
    trayImage = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png')).resize({ width: 24, height: 24 });
  }

  tray = new Tray(trayImage);
  tray.setToolTip('সালাত রিমাইন্ডার - নামাজের সঠিক সময় ও অ্যালার্ম');

  updateTrayContextMenu();

  tray.on('click', () => {
    toggleWindowVisibility();
  });

  tray.on('double-click', () => {
    toggleWindowVisibility();
  });
}

function toggleWindowVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    if (mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow.focus();
    }
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function updateTrayContextMenu() {
  if (!tray) return;

  const currentText = `বর্তমান ওয়াক্ত: ${lastTrayStatus.currentWaqtName}`;
  const nextText = `পরবর্তী ওয়াক্ত: ${lastTrayStatus.nextWaqtName} (${lastTrayStatus.nextWaqtTime})`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'সালাত রিমাইন্ডার ওপেন করুন',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: currentText,
      enabled: false
    },
    {
      label: nextText,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'আজান / অ্যালার্ম বন্ধ করুন',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('stop-alarm');
        }
      }
    },
    {
      label: 'সেটিংস',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('navigate-tab', 'settings');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'অ্যাপ সম্পূর্ণ বন্ধ করুন (Exit)',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// IPC হ্যান্ডলারসমূহ
ipcMain.on('update-tray', (_event, data) => {
  if (data) {
    lastTrayStatus = {
      currentWaqtName: data.currentWaqtName || lastTrayStatus.currentWaqtName,
      nextWaqtName: data.nextWaqtName || lastTrayStatus.nextWaqtName,
      nextWaqtTime: data.nextWaqtTime || lastTrayStatus.nextWaqtTime
    };

    if (tray) {
      tray.setToolTip(`সালাত রিমাইন্ডার\nবর্তমান: ${lastTrayStatus.currentWaqtName}\nপরবর্তী: ${lastTrayStatus.nextWaqtName} (${lastTrayStatus.nextWaqtTime})`);
      updateTrayContextMenu();
    }
  }
});

ipcMain.on('show-notification', (_event, payload) => {
  if (Notification.isSupported()) {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const notif = new Notification({
      title: payload.title || 'নামাজের সময়',
      body: payload.body || '',
      icon: iconPath,
      silent: payload.silent !== undefined ? payload.silent : false
    });

    notif.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notif.show();
  }
});

ipcMain.on('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close(); // ট্রিগার করবেmainWindow.on('close') যা হাইড করে
});

ipcMain.on('quit-app', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on('open-external', (_event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // উইন্ডোজে ক্লোজ ইভেন্টে hide হয়, quit হয় না। যদি কোনো কারণে সব উইন্ডো ক্লোজ হয় তবুও ট্রে থাকবে
  }
});

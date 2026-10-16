const { contextBridge, ipcRenderer } = require('electron');
const {
  PrayerService,
  toBanglaDigits,
  formatDurationBangla,
  formatDigitalTimer,
  formatTime
} = require('./src/services/prayerService');

let prayerServiceInstance = new PrayerService();

contextBridge.exposeInMainWorld('salatService', {
  init: (config) => {
    prayerServiceInstance = new PrayerService(config);
  },
  updateConfig: (config) => {
    prayerServiceInstance.updateConfig(config);
  },
  getCurrentStatus: () => {
    return prayerServiceInstance.getCurrentStatus();
  },
  getQiblaDirection: () => {
    return prayerServiceInstance.getQiblaDirection();
  },
  toBanglaDigits: (val) => toBanglaDigits(val),
  formatDurationBangla: (sec, useBn) => formatDurationBangla(sec, useBn),
  formatDigitalTimer: (sec, useBn) => formatDigitalTimer(sec, useBn),
  formatTime: (date, tz, useBn, incPeriod) => formatTime(date, tz, useBn, incPeriod)
});

contextBridge.exposeInMainWorld('salatAPI', {
  // ট্রে স্ট্যাটাস আপডেট
  updateTray: (status) => ipcRenderer.send('update-tray', status),

  // নেটিভ নোটিফিকেশন প্রদর্শন
  showNotification: (payload) => ipcRenderer.send('show-notification', payload),

  // ট্রে-তে মিনিমাইজ
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),

  // উইন্ডো মিনিমাইজ
  minimizeWindow: () => ipcRenderer.send('minimize-window'),

  // উইন্ডো ক্লোজ (ট্রে-তে চলে যাবে)
  closeWindow: () => ipcRenderer.send('close-window'),

  // অ্যাপ সম্পূর্ণ বন্ধ
  quitApp: () => ipcRenderer.send('quit-app'),

  // বহিরাগত লিংক খোলা
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // ট্রে মেনু বা ব্যাকগ্রাউন্ড থেকে ইভেন্ট রিসিভ করা
  onNavigateToTab: (callback) => ipcRenderer.on('navigate-tab', (_event, tab) => callback(tab)),
  onStopAlarm: (callback) => ipcRenderer.on('stop-alarm', () => callback())
});

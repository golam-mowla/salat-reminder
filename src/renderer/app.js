// সালাত রিমাইন্ডার রেন্ডারার অ্যাপ্লিকেশন
document.addEventListener('DOMContentLoaded', () => {
  // অডিও ইঞ্জিন
  const soundEngine = new SoundEngine();

  // ডিফল্ট কনফিগারেশন
  const DEFAULT_SETTINGS = {
    districtId: 'dhaka',
    division: 'ঢাকা',
    locationNameBn: 'ঢাকা, বাংলাদেশ',
    latitude: 23.8103,
    longitude: 90.4125,
    timezone: 'Asia/Dhaka',
    methodName: 'Karachi',
    madhabName: 'Hanafi',
    useBanglaDigits: true,
    masterAlarm: true,
    desktopNotification: true,
    soundTone: 'adhan', // adhan, gong, chime, beep
    volume: 80,
    preAlarmMinutes: 10,
    prayerAlarms: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true
    }
  };

  // সেটিংস লোড করা
  function loadSettings() {
    try {
      const saved = localStorage.getItem('salat_reminder_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse settings', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  let state = loadSettings();

  function saveSettings() {
    try {
      localStorage.setItem('salat_reminder_settings', JSON.stringify(state));
    } catch (e) {}
  }

  // পেয়ার সার্ভিস ইন্সট্যান্স (preload থেকে প্রাপ্ত)
  const prayerService = window.salatService || {
    init: () => {},
    updateConfig: () => {},
    getCurrentStatus: () => ({ currentWaqt: {}, nextWaqt: {}, allTimings: {} }),
    getQiblaDirection: () => 278,
    toBanglaDigits: (val) => {
      const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return String(val).replace(/[0-9]/g, d => bn[d]);
    }
  };

  prayerService.init({
    latitude: state.latitude,
    longitude: state.longitude,
    timezone: state.timezone,
    methodName: state.methodName,
    madhabName: state.madhabName,
    useBanglaDigits: state.useBanglaDigits
  });

  // অ্যালার্ম ট্র্যাকিং স্টেট
  let activeAlarmWaqt = null;
  let playedAlarmsToday = {}; // { 'fajr-exact': true, 'fajr-pre': true }
  let lastCheckedDay = new Date().toDateString();

  // DOM এলিমেন্ট রেফারেন্স
  const el = {
    // হেডার
    headerLocationName: document.getElementById('headerLocationName'),
    headerLiveClock: document.getElementById('headerLiveClock'),
    headerBanglaDate: document.getElementById('headerBanglaDate'),
    headerHijriDate: document.getElementById('headerHijriDate'),
    btnMinimize: document.getElementById('btnMinimize'),
    btnTrayMinimize: document.getElementById('btnTrayMinimize'),
    btnClose: document.getElementById('btnClose'),

    // সাইডবার
    navItems: document.querySelectorAll('.nav-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    btnQuickMute: document.getElementById('btnQuickMute'),
    quickMuteIcon: document.getElementById('quickMuteIcon'),
    quickMuteText: document.getElementById('quickMuteText'),

    // অ্যালার্ম ব্যানার
    alarmBanner: document.getElementById('alarmBanner'),
    alarmBannerTitle: document.getElementById('alarmBannerTitle'),
    alarmBannerDesc: document.getElementById('alarmBannerDesc'),
    btnStopAlarm: document.getElementById('btnStopAlarm'),
    btnSnoozeAlarm: document.getElementById('btnSnoozeAlarm'),

    // নিষিদ্ধ সময় ব্যানার
    forbiddenBanner: document.getElementById('forbiddenBanner'),
    forbiddenReasonTitle: document.getElementById('forbiddenReasonTitle'),
    forbiddenReasonDesc: document.getElementById('forbiddenReasonDesc'),

    // হোম হিরো
    currentWaqtName: document.getElementById('currentWaqtName'),
    currentWaqtRange: document.getElementById('currentWaqtRange'),
    currentWaqtCountdownDigits: document.getElementById('currentWaqtCountdownDigits'),
    currentWaqtRemainingText: document.getElementById('currentWaqtRemainingText'),
    waqtProgressBar: document.getElementById('waqtProgressBar'),
    progressStartTime: document.getElementById('progressStartTime'),
    progressEndTime: document.getElementById('progressEndTime'),
    progressPercentText: document.getElementById('progressPercentText'),

    nextWaqtName: document.getElementById('nextWaqtName'),
    nextWaqtExactTime: document.getElementById('nextWaqtExactTime'),
    nextWaqtStartsInDigits: document.getElementById('nextWaqtStartsInDigits'),
    nextWaqtStartsInText: document.getElementById('nextWaqtStartsInText'),

    currentDateFullBn: document.getElementById('currentDateFullBn'),

    // ওয়াক্ত গ্রিড ও ব্যাজ
    waqtGridCards: {
      fajr: document.getElementById('card-fajr'),
      sunrise: document.getElementById('card-sunrise'),
      ishraq: document.getElementById('card-ishraq'),
      dhuhr: document.getElementById('card-dhuhr'),
      asr: document.getElementById('card-asr'),
      maghrib: document.getElementById('card-maghrib'),
      isha: document.getElementById('card-isha'),
      tahajjud: document.getElementById('card-tahajjud')
    },
    waqtTimes: {
      fajr: document.getElementById('time-fajr'),
      sunrise: document.getElementById('time-sunrise'),
      ishraq: document.getElementById('time-ishraq'),
      dhuhr: document.getElementById('time-dhuhr'),
      asr: document.getElementById('time-asr'),
      maghrib: document.getElementById('time-maghrib'),
      isha: document.getElementById('time-isha'),
      tahajjud: document.getElementById('time-tahajjud')
    },
    waqtStatuses: {
      fajr: document.getElementById('status-fajr'),
      sunrise: document.getElementById('status-sunrise'),
      ishraq: document.getElementById('status-ishraq'),
      dhuhr: document.getElementById('status-dhuhr'),
      asr: document.getElementById('status-asr'),
      maghrib: document.getElementById('status-maghrib'),
      isha: document.getElementById('status-isha'),
      tahajjud: document.getElementById('status-tahajjud')
    },
    waqtAlarmBadges: {
      fajr: document.getElementById('alarmBadge-fajr'),
      dhuhr: document.getElementById('alarmBadge-dhuhr'),
      asr: document.getElementById('alarmBadge-asr'),
      maghrib: document.getElementById('alarmBadge-maghrib'),
      isha: document.getElementById('alarmBadge-isha')
    },

    // কিবলা
    qiblaNeedle: document.getElementById('qiblaNeedle'),
    qiblaAngleText: document.getElementById('qiblaAngleText'),
    qiblaLocationName: document.getElementById('qiblaLocationName'),

    // টেবিল
    detailedTableBody: document.getElementById('detailedTableBody'),

    // সেটিংস
    selectDivision: document.getElementById('selectDivision'),
    selectDistrict: document.getElementById('selectDistrict'),
    selectInternational: document.getElementById('selectInternational'),
    btnAutoLocation: document.getElementById('btnAutoLocation'),
    toggleCustomCoords: document.getElementById('toggleCustomCoords'),
    customCoordsFields: document.getElementById('customCoordsFields'),
    inputCustomLat: document.getElementById('inputCustomLat'),
    inputCustomLng: document.getElementById('inputCustomLng'),
    btnApplyCustomCoords: document.getElementById('btnApplyCustomCoords'),

    selectTimezone: document.getElementById('selectTimezone'),
    btnAutoTimezone: document.getElementById('btnAutoTimezone'),
    tzLiveClock: document.getElementById('tzLiveClock'),

    toggleMasterAlarm: document.getElementById('toggleMasterAlarm'),
    toggleDesktopNotification: document.getElementById('toggleDesktopNotification'),
    selectSoundTone: document.getElementById('selectSoundTone'),
    inputVolume: document.getElementById('inputVolume'),
    volumePercentText: document.getElementById('volumePercentText'),
    btnTestSound: document.getElementById('btnTestSound'),
    btnTestSoundIcon: document.getElementById('btnTestSoundIcon'),
    btnTestSoundText: document.getElementById('btnTestSoundText'),
    btnStopSoundTest: document.getElementById('btnStopSoundTest'),

    alarmCheckFajr: document.getElementById('alarmCheck-fajr'),
    alarmCheckDhuhr: document.getElementById('alarmCheck-dhuhr'),
    alarmCheckAsr: document.getElementById('alarmCheck-asr'),
    alarmCheckMaghrib: document.getElementById('alarmCheck-maghrib'),
    alarmCheckIsha: document.getElementById('alarmCheck-isha'),
    selectPreAlarm: document.getElementById('selectPreAlarm'),

    selectMethod: document.getElementById('selectMethod'),
    selectMadhab: document.getElementById('selectMadhab'),
    toggleBanglaDigits: document.getElementById('toggleBanglaDigits'),
    btnResetSettings: document.getElementById('btnResetSettings')
  };

  // বাংলা সংখ্যায় রূপান্তর
  function formatDigits(val) {
    if (state.useBanglaDigits) {
      return prayerService.toBanglaDigits(val);
    }
    return String(val);
  }

  // জেলা ড্রপডাউন পপুলেট
  function populateDistricts(selectedDivision = 'all') {
    el.selectDistrict.innerHTML = '';
    const filtered = (selectedDivision === 'all')
      ? BANGLADESH_DISTRICTS
      : BANGLADESH_DISTRICTS.filter(d => d.division === selectedDivision);

    filtered.forEach(dist => {
      const opt = document.createElement('option');
      opt.value = dist.id;
      opt.textContent = `${dist.bn} (${dist.en}) - ${dist.division} বিভাগ`;
      if (dist.id === state.districtId) opt.selected = true;
      el.selectDistrict.appendChild(opt);
    });
  }

  // আন্তর্জাতিক শহর পপুলেট
  function populateInternationalCities() {
    el.selectInternational.innerHTML = '<option value="">-- বাংলাদেশ ব্যতীত অন্যান্য শহর --</option>';
    INTERNATIONAL_CITIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.bn} (${c.en}) - ${c.country}`;
      el.selectInternational.appendChild(opt);
    });
  }

  // টাইমজোন ড্রপডাউন পপুলেট
  function populateTimezones() {
    el.selectTimezone.innerHTML = '';
    TIMEZONES.forEach(tz => {
      const opt = document.createElement('option');
      opt.value = tz.value;
      opt.textContent = tz.labelBn;
      if (tz.value === state.timezone) opt.selected = true;
      el.selectTimezone.appendChild(opt);
    });
  }

  // বাংলা বার ও তারিখ
  function getBanglaDateStrings(date = new Date()) {
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const dayName = days[date.getDay()];
    const mName = months[date.getMonth()];
    const dNum = formatDigits(date.getDate());
    const yNum = formatDigits(date.getFullYear());

    return {
      dayName,
      fullDateStr: `${dayName}, ${dNum} ${mName} ${yNum}`
    };
  }

  // কিবলা ডিগ্রি ও সুই আপডেট
  function updateQiblaDisplay() {
    const qiblaAngle = prayerService.getQiblaDirection();
    el.qiblaNeedle.style.transform = `rotate(${qiblaAngle}deg)`;
    el.qiblaAngleText.textContent = `${formatDigits(qiblaAngle)}° (পবিত্র কাবা অভিমুখী)`;
    el.qiblaLocationName.textContent = state.locationNameBn;
  }

  // সালাত চার্ট বিস্তারিত টেবিল তৈরি
  function renderDetailedTable(status) {
    if (!status || !status.allTimings) return;
    const t = status.allTimings;

    const rows = [
      { name: 'তাহাজ্জুদ (শেষ তৃতীয়াংশ)', start: t.tahajjud.timeFormatted, end: t.fajr.timeFormatted, rank: 'নফল ও সর্বোচ্চ মোস্তাহাব', alarm: '-' },
      { name: 'সাহরি শেষ (সতর্কতা)', start: t.sahriEnd.timeFormatted, end: t.fajr.timeFormatted, rank: 'রোজা রাখার নিরাপদ সীমা', alarm: '-' },
      { name: 'ফজর ওয়াক্ত', start: t.fajr.timeFormatted, end: t.sunrise.timeFormatted, rank: 'ফরজ সালাত (২ রাকাত)', alarm: state.prayerAlarms.fajr ? '🔔 সক্রিয়' : '🔕 নিষ্ক্রিয়' },
      { name: 'সূর্যোদয় (নামাজ নিষিদ্ধ)', start: t.sunrise.timeFormatted, end: t.ishraq.timeFormatted, rank: 'মাকরূহে তাহরীমী (নামাজ বারণ)', alarm: '-' },
      { name: 'ইশরাক ও চাশত (দ্বিপ্রহর পূর্ব)', start: t.ishraq.timeFormatted, end: t.dhuhr.timeFormatted, rank: 'নফল ও সুন্নত সালাত', alarm: '-' },
      { name: 'যোহর ওয়াক্ত', start: t.dhuhr.timeFormatted, end: t.asr.timeFormatted, rank: 'ফরজ সালাত (৪ রাকাত)', alarm: state.prayerAlarms.dhuhr ? '🔔 সক্রিয়' : '🔕 নিষ্ক্রিয়' },
      { name: 'আসর ওয়াক্ত', start: t.asr.timeFormatted, end: t.maghrib.timeFormatted, rank: 'ফরজ সালাত (৪ রাকাত)', alarm: state.prayerAlarms.asr ? '🔔 সক্রিয়' : '🔕 নিষ্ক্রিয়' },
      { name: 'মাগরিব ওয়াক্ত (ইফতার)', start: t.maghrib.timeFormatted, end: t.isha.timeFormatted, rank: 'ফরজ সালাত (৩ রাকাত)', alarm: state.prayerAlarms.maghrib ? '🔔 সক্রিয়' : '🔕 নিষ্ক্রিয়' },
      { name: 'এশা ও বিতর ওয়াক্ত', start: t.isha.timeFormatted, end: t.fajr.timeFormatted, rank: 'ফরজ (৪ রাকাত) + বিতর (৩ রাকাত)', alarm: state.prayerAlarms.isha ? '🔔 সক্রিয়' : '🔕 নিষ্ক্রিয়' },
    ];

    el.detailedTableBody.innerHTML = rows.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.start}</td>
        <td>${r.end}</td>
        <td><span class="field-hint" style="color: #cbd5e1;">${r.rank}</span></td>
        <td>${r.alarm}</td>
      </tr>
    `).join('');
  }

  // ওয়াক্ত গ্রিড কার্ড সক্রিয়তা হাইলাইট
  function updateWaqtGridActive(currentWaqtId) {
    Object.keys(el.waqtGridCards).forEach(key => {
      const card = el.waqtGridCards[key];
      if (!card) return;
      card.classList.remove('is-current');
      if (el.waqtStatuses[key]) {
        el.waqtStatuses[key].textContent = 'আসন্ন';
      }
    });

    if (currentWaqtId && el.waqtGridCards[currentWaqtId]) {
      el.waqtGridCards[currentWaqtId].classList.add('is-current');
      if (el.waqtStatuses[currentWaqtId]) {
        el.waqtStatuses[currentWaqtId].textContent = 'চলমান ওয়াক্ত';
      }
    }
  }

  // অ্যালার্ম ট্রিগার হ্যান্ডলার
  function triggerPrayerAlarm(waqtId, waqtName, isPreAlarm = false) {
    if (!state.masterAlarm) return;
    if (!isPreAlarm && !state.prayerAlarms[waqtId]) return;

    activeAlarmWaqt = waqtId;

    // সাউন্ড প্লে করা
    const vol = (state.volume || 80) / 100;
    soundEngine.playSelectedSound(state.soundTone, vol);

    // ব্যানার দেখানো
    if (isPreAlarm) {
      el.alarmBannerTitle.textContent = `ওয়াক্তের অগ্রিম সংকেত: ${waqtName}`;
      el.alarmBannerDesc = `${formatDigits(state.preAlarmMinutes)} মিনিট পর ${waqtName}-এর ওয়াক্ত শুরু হবে। নামাজের প্রস্তুতি নিন।`;
    } else {
      el.alarmBannerTitle.textContent = `নামাজের ওয়াক্ত হয়েছে: ${waqtName}!`;
      el.alarmBannerDesc = `এখন ${waqtName}-এর সালাতের সময়। হাইয়া আলাস সালাহ্ (নামাজে আসুন)।`;
    }
    el.alarmBanner.classList.add('active');

    // নেটিভ ডেস্কটপ নোটিফিকেশন পাঠানো
    if (state.desktopNotification && window.salatAPI) {
      window.salatAPI.showNotification({
        title: isPreAlarm ? `অগ্রিম সংকেত: ${waqtName}` : `সালাত রিমাইন্ডার: ${waqtName}`,
        body: isPreAlarm 
          ? `${state.preAlarmMinutes} মিনিট পর ${waqtName}-এর ওয়াক্ত শুরু হবে।` 
          : `এখন ${waqtName}-এর সালাতের ওয়াক্ত শুরু হয়েছে।`,
        silent: true // কারণ অডিও ইঞ্জিন ইতিমধ্যেই বাজাচ্ছে
      });
    }
  }

  function stopActiveAlarm() {
    soundEngine.stop();
    el.alarmBanner.classList.remove('active');
    activeAlarmWaqt = null;
  }

  function snoozeActiveAlarm() {
    stopActiveAlarm();
    // ৫ মিনিট পর আবার স্মরণ করাবে
    setTimeout(() => {
      if (state.masterAlarm) {
        soundEngine.playSelectedSound(state.soundTone, (state.volume || 80) / 100);
        el.alarmBannerTitle.textContent = 'স্নুজ অ্যালার্ম: সালাতের সময়';
        el.alarmBannerDesc = '৫ মিনিট সমাপ্ত হয়েছে। জামাত বা সালাত আদায় করতে চলুন।';
        el.alarmBanner.classList.add('active');
      }
    }, 5 * 60 * 1000);
  }

  // ১-সেকেন্ডের লাইভ টিক ইঞ্জিন
  function tick() {
    const now = new Date();

    // দিন পরিবর্তন হলে প্লে করা অ্যালার্ম হিস্ট্রি রিসেট
    const currentDayStr = now.toDateString();
    if (currentDayStr !== lastCheckedDay) {
      playedAlarmsToday = {};
      lastCheckedDay = currentDayStr;
    }

    // টাইমজোন অনুযায়ী বর্তমান সময়
    const timeInZone = new Date(now.toLocaleString('en-US', { timeZone: state.timezone }));
    
    // হেডার লাইভ ক্লক
    const h = formatDigits(String(timeInZone.getHours()).padStart(2, '0'));
    const m = formatDigits(String(timeInZone.getMinutes()).padStart(2, '0'));
    const s = formatDigits(String(timeInZone.getSeconds()).padStart(2, '0'));
    el.headerLiveClock.textContent = `${h}:${m}:${s}`;
    el.tzLiveClock.textContent = `${h}:${m}:${s}`;

    // বাংলা তারিখ
    const bDate = getBanglaDateStrings(timeInZone);
    el.headerBanglaDate.textContent = bDate.dayName;
    el.currentDateFullBn.textContent = bDate.fullDateStr;

    // সালাত স্ট্যাটাস গণনা
    const status = prayerService.getCurrentStatus(now);

    // কার্ড তথ্য আপডেট
    const cur = status.currentWaqt;
    const nxt = status.nextWaqt;

    el.currentWaqtName.textContent = cur.nameBn;
    el.currentWaqtRange.textContent = `${cur.startTimeFormatted} হতে ${cur.endTimeFormatted} পর্যন্ত`;
    el.currentWaqtCountdownDigits.textContent = cur.remainingTimerDigital;
    el.currentWaqtRemainingText.textContent = cur.remainingText;

    el.waqtProgressBar.style.width = `${cur.progressPercent}%`;
    el.progressStartTime.textContent = cur.startTimeFormatted;
    el.progressEndTime.textContent = cur.endTimeFormatted;
    el.progressPercentText.textContent = `${formatDigits(cur.progressPercent)}% অতিক্রান্ত`;

    el.nextWaqtName.textContent = nxt.shortNameBn;
    el.nextWaqtExactTime.textContent = `${nxt.startTimeFormatted} মিনিটে`;
    el.nextWaqtStartsInDigits.textContent = nxt.startsInTimerDigital;
    el.nextWaqtStartsInText.textContent = nxt.startsInText;

    // নিষিদ্ধ সময় ব্যানার
    if (status.isForbiddenTime) {
      el.forbiddenReasonTitle.textContent = status.forbiddenReason;
      el.forbiddenBanner.classList.add('active');
    } else {
      el.forbiddenBanner.classList.remove('active');
    }

    // ওয়াক্ত গ্রিডের সময় ও স্ট্যাটাস
    const timings = status.allTimings;
    if (timings) {
      if (el.waqtTimes.fajr) el.waqtTimes.fajr.textContent = timings.fajr.timeFormatted;
      if (el.waqtTimes.sunrise) el.waqtTimes.sunrise.textContent = timings.sunrise.timeFormatted;
      if (el.waqtTimes.ishraq) el.waqtTimes.ishraq.textContent = timings.ishraq.timeFormatted;
      if (el.waqtTimes.dhuhr) el.waqtTimes.dhuhr.textContent = timings.dhuhr.timeFormatted;
      if (el.waqtTimes.asr) el.waqtTimes.asr.textContent = timings.asr.timeFormatted;
      if (el.waqtTimes.maghrib) el.waqtTimes.maghrib.textContent = timings.maghrib.timeFormatted;
      if (el.waqtTimes.isha) el.waqtTimes.isha.textContent = timings.isha.timeFormatted;
      if (el.waqtTimes.tahajjud) el.waqtTimes.tahajjud.textContent = timings.tahajjud.timeFormatted;
    }

    updateWaqtGridActive(cur.id);

    // ট্রে আপডেট পাঠানো
    if (window.salatAPI) {
      window.salatAPI.updateTray({
        currentWaqtName: cur.shortNameBn,
        nextWaqtName: nxt.shortNameBn,
        nextWaqtTime: nxt.startTimeFormatted
      });
    }

    // অ্যালার্ম চেকিং
    // ১. ওয়াক্তের অগ্রিম সংকেত (Pre-alarm)
    if (state.masterAlarm && state.preAlarmMinutes > 0) {
      const preAlarmSec = state.preAlarmMinutes * 60;
      if (nxt.startsInSeconds <= preAlarmSec && nxt.startsInSeconds > (preAlarmSec - 3)) {
        const preKey = `${nxt.id}-pre-${currentDayStr}`;
        if (!playedAlarmsToday[preKey]) {
          playedAlarmsToday[preKey] = true;
          triggerPrayerAlarm(nxt.id, nxt.nameBn, true);
        }
      }
    }

    // ২. ঠিক ওয়াক্ত শুরু হওয়ার অ্যালার্ম
    if (state.masterAlarm && nxt.startsInSeconds <= 2 && nxt.startsInSeconds >= 0) {
      const exactKey = `${nxt.id}-exact-${currentDayStr}`;
      if (!playedAlarmsToday[exactKey]) {
        playedAlarmsToday[exactKey] = true;
        triggerPrayerAlarm(nxt.id, nxt.nameBn, false);
      }
    }
  }

  // ইনিশিয়ালাইজেশন
  function init() {
    populateDistricts(state.division);
    populateInternationalCities();
    populateTimezones();

    el.headerLocationName.textContent = state.locationNameBn;
    el.selectDivision.value = state.division || 'ঢাকা';
    el.selectMethod.value = state.methodName || 'Karachi';
    el.selectMadhab.value = state.madhabName || 'Hanafi';
    el.toggleBanglaDigits.checked = state.useBanglaDigits;
    el.toggleMasterAlarm.checked = state.masterAlarm;
    el.toggleDesktopNotification.checked = state.desktopNotification;
    el.selectSoundTone.value = state.soundTone;
    el.inputVolume.value = state.volume;
    el.volumePercentText.textContent = `${formatDigits(state.volume)}%`;
    el.selectPreAlarm.value = String(state.preAlarmMinutes);

    el.alarmCheckFajr.checked = state.prayerAlarms.fajr;
    el.alarmCheckDhuhr.checked = state.prayerAlarms.dhuhr;
    el.alarmCheckAsr.checked = state.prayerAlarms.asr;
    el.alarmCheckMaghrib.checked = state.prayerAlarms.maghrib;
    el.alarmCheckIsha.checked = state.prayerAlarms.isha;

    updateQiblaDisplay();
    renderDetailedTable(prayerService.getCurrentStatus());
    tick();

    // ১ সেকেন্ড পর পর টিক
    setInterval(tick, 1000);
  }

  // ইভেন্ট লিসেনারসমূহ
  // ১. ট্যাব নেভিগেশন
  el.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      el.navItems.forEach(n => n.classList.remove('active'));
      el.tabPanels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const panel = document.getElementById(targetTab);
      if (panel) panel.classList.add('active');

      if (targetTab === 'tab-calendar') {
        renderDetailedTable(prayerService.getCurrentStatus());
      } else if (targetTab === 'tab-qibla') {
        updateQiblaDisplay();
      }
    });
  });

  // ২. উইন্ডো কন্ট্রোল বোতাম
  el.btnMinimize.addEventListener('click', () => {
    if (window.salatAPI) window.salatAPI.minimizeWindow();
  });
  el.btnTrayMinimize.addEventListener('click', () => {
    if (window.salatAPI) window.salatAPI.minimizeToTray();
  });
  el.btnClose.addEventListener('click', () => {
    if (window.salatAPI) window.salatAPI.closeWindow();
  });

  // ৩. দ্রুত নিঃশব্দ (Quick Mute) টগল
  el.btnQuickMute.addEventListener('click', () => {
    state.masterAlarm = !state.masterAlarm;
    el.toggleMasterAlarm.checked = state.masterAlarm;
    saveSettings();
    updateMuteUI();
  });

  function updateMuteUI() {
    if (state.masterAlarm) {
      el.quickMuteText.textContent = 'শব্দ চালু';
      el.quickMuteIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
    } else {
      el.quickMuteText.textContent = 'নিঃশব্দ (Mute)';
      el.quickMuteIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
      stopActiveAlarm();
    }
  }

  // ৪. অ্যালার্ম ব্যানার বোতাম
  el.btnStopAlarm.addEventListener('click', stopActiveAlarm);
  el.btnSnoozeAlarm.addEventListener('click', snoozeActiveAlarm);

  // ৫. সাউন্ড টেস্ট বোতাম
  let isTestingSound = false;
  el.btnTestSound.addEventListener('click', () => {
    if (isTestingSound) {
      soundEngine.stop();
      isTestingSound = false;
      el.btnTestSoundText.textContent = 'সাউন্ড টেস্ট করুন';
      el.btnTestSoundIcon.textContent = '🔊';
    } else {
      const vol = (state.volume || 80) / 100;
      soundEngine.playSelectedSound(state.soundTone, vol);
      isTestingSound = true;
      el.btnTestSoundText.textContent = 'বাজছে (থামান)';
      el.btnTestSoundIcon.textContent = '⏹️';
    }
  });

  el.btnStopSoundTest.addEventListener('click', () => {
    soundEngine.stop();
    isTestingSound = false;
    el.btnTestSoundText.textContent = 'সাউন্ড টেস্ট করুন';
    el.btnTestSoundIcon.textContent = '🔊';
  });

  // ৬. বিভাগ ও জেলা পরিবর্তন
  el.selectDivision.addEventListener('change', (e) => {
    state.division = e.target.value;
    populateDistricts(state.division);
  });

  el.selectDistrict.addEventListener('change', (e) => {
    const dist = BANGLADESH_DISTRICTS.find(d => d.id === e.target.value);
    if (dist) {
      state.districtId = dist.id;
      state.latitude = dist.lat;
      state.longitude = dist.lng;
      state.locationNameBn = `${dist.bn}, বাংলাদেশ`;
      state.timezone = 'Asia/Dhaka';
      el.selectTimezone.value = 'Asia/Dhaka';
      el.headerLocationName.textContent = state.locationNameBn;

      prayerService.updateConfig({
        latitude: state.latitude,
        longitude: state.longitude,
        timezone: state.timezone
      });
      saveSettings();
      updateQiblaDisplay();
      renderDetailedTable(prayerService.getCurrentStatus());
      tick();
    }
  });

  // ৭. আন্তর্জাতিক শহর পরিবর্তন
  el.selectInternational.addEventListener('change', (e) => {
    const city = INTERNATIONAL_CITIES.find(c => c.id === e.target.value);
    if (city) {
      state.latitude = city.lat;
      state.longitude = city.lng;
      state.locationNameBn = `${city.bn}, ${city.country}`;
      state.timezone = city.timezone;
      el.selectTimezone.value = city.timezone;
      el.headerLocationName.textContent = state.locationNameBn;

      prayerService.updateConfig({
        latitude: state.latitude,
        longitude: state.longitude,
        timezone: state.timezone
      });
      saveSettings();
      updateQiblaDisplay();
      renderDetailedTable(prayerService.getCurrentStatus());
      tick();
    }
  });

  // ৮. টাইমজোন পরিবর্তন
  el.selectTimezone.addEventListener('change', (e) => {
    state.timezone = e.target.value;
    prayerService.updateConfig({ timezone: state.timezone });
    saveSettings();
    tick();
  });

  // ৯. অটো লোকেশন ডিটেকশন (Geolocation API)
  el.btnAutoLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('আপনার ডিভাইসে জিওলোকেশন ব্রাউজার সাপোর্ট পাওয়া যায়নি।');
      return;
    }
    el.btnAutoLocation.innerHTML = '<span>⏳</span> লোকেশন নির্ণয় করা হচ্ছে...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.latitude = pos.coords.latitude;
        state.longitude = pos.coords.longitude;
        state.locationNameBn = 'স্বয়ংক্রিয় জিপিএস লোকেশন';
        el.headerLocationName.textContent = state.locationNameBn;

        prayerService.updateConfig({
          latitude: state.latitude,
          longitude: state.longitude
        });
        saveSettings();
        updateQiblaDisplay();
        renderDetailedTable(prayerService.getCurrentStatus());
        tick();

        el.btnAutoLocation.innerHTML = '<span>✅</span> লোকেশন সফলভাবে আপডেট হয়েছে';
        setTimeout(() => {
          el.btnAutoLocation.innerHTML = '<span>🛰️</span> আমার অটো জিপিএস লোকেশন নিন';
        }, 3000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('জিপিএস লোকেশন সংগ্রহ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে জেলা বা শহর ড্রপডাউন থেকে নির্বাচন করুন।');
        el.btnAutoLocation.innerHTML = '<span>🛰️</span> আমার অটো জিপিএস লোকেশন নিন';
      },
      { timeout: 10000 }
    );
  });

  // ১০. কাস্টম কোঅর্ডিনেট ফিল্ডস টগল
  el.toggleCustomCoords.addEventListener('click', (e) => {
    e.preventDefault();
    el.customCoordsFields.classList.toggle('hidden');
    el.inputCustomLat.value = state.latitude;
    el.inputCustomLng.value = state.longitude;
  });

  el.btnApplyCustomCoords.addEventListener('click', () => {
    const lat = parseFloat(el.inputCustomLat.value);
    const lng = parseFloat(el.inputCustomLng.value);
    if (!isNaN(lat) && !isNaN(lng)) {
      state.latitude = lat;
      state.longitude = lng;
      state.locationNameBn = `কাস্টম (${formatDigits(lat.toFixed(2))}, ${formatDigits(lng.toFixed(2))})`;
      el.headerLocationName.textContent = state.locationNameBn;

      prayerService.updateConfig({ latitude: lat, longitude: lng });
      saveSettings();
      updateQiblaDisplay();
      renderDetailedTable(prayerService.getCurrentStatus());
      tick();
      alert('কাস্টম লোকেশন প্রয়োগ করা হয়েছে!');
    }
  });

  // ১১. অটো ডিভাইস টাইমজোন
  el.btnAutoTimezone.addEventListener('click', () => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) {
        state.timezone = userTz;
        el.selectTimezone.value = userTz;
        prayerService.updateConfig({ timezone: userTz });
        saveSettings();
        tick();
        alert(`ডিভাইসের টাইমজোন সেট করা হয়েছে: ${userTz}`);
      }
    } catch (e) {
      alert('টাইমজোন শনাক্ত করা সম্ভব হয়নি।');
    }
  });

  // ১২. অ্যালার্ম সেটিংস পরিবর্তন
  el.toggleMasterAlarm.addEventListener('change', (e) => {
    state.masterAlarm = e.target.checked;
    saveSettings();
    updateMuteUI();
  });

  el.toggleDesktopNotification.addEventListener('change', (e) => {
    state.desktopNotification = e.target.checked;
    saveSettings();
  });

  el.selectSoundTone.addEventListener('change', (e) => {
    state.soundTone = e.target.value;
    saveSettings();
  });

  el.inputVolume.addEventListener('input', (e) => {
    state.volume = parseInt(e.target.value, 10);
    el.volumePercentText.textContent = `${formatDigits(state.volume)}%`;
    saveSettings();
  });

  el.selectPreAlarm.addEventListener('change', (e) => {
    state.preAlarmMinutes = parseInt(e.target.value, 10);
    saveSettings();
  });

  const bindAlarmCheck = (chkEl, key) => {
    chkEl.addEventListener('change', (e) => {
      state.prayerAlarms[key] = e.target.checked;
      if (el.waqtAlarmBadges[key]) {
        el.waqtAlarmBadges[key].textContent = e.target.checked ? '🔔' : '🔕';
      }
      saveSettings();
    });
  };

  bindAlarmCheck(el.alarmCheckFajr, 'fajr');
  bindAlarmCheck(el.alarmCheckDhuhr, 'dhuhr');
  bindAlarmCheck(el.alarmCheckAsr, 'asr');
  bindAlarmCheck(el.alarmCheckMaghrib, 'maghrib');
  bindAlarmCheck(el.alarmCheckIsha, 'isha');

  // ১৩. পদ্ধতি ও মাজহাব
  el.selectMethod.addEventListener('change', (e) => {
    state.methodName = e.target.value;
    prayerService.updateConfig({ methodName: state.methodName });
    saveSettings();
    renderDetailedTable(prayerService.getCurrentStatus());
    tick();
  });

  el.selectMadhab.addEventListener('change', (e) => {
    state.madhabName = e.target.value;
    prayerService.updateConfig({ madhabName: state.madhabName });
    saveSettings();
    renderDetailedTable(prayerService.getCurrentStatus());
    tick();
  });

  // ১৪. সংখ্যা রূপান্তর (বাংলা / ইংরেজি)
  el.toggleBanglaDigits.addEventListener('change', (e) => {
    state.useBanglaDigits = e.target.checked;
    prayerService.updateConfig({ useBanglaDigits: state.useBanglaDigits });
    saveSettings();
    el.volumePercentText.textContent = `${formatDigits(state.volume)}%`;
    renderDetailedTable(prayerService.getCurrentStatus());
    tick();
  });

  // ১৫. ডিফল্ট রিসেট
  el.btnResetSettings.addEventListener('click', () => {
    if (confirm('আপনি কি নিশ্চিত যে সকল সেটিংস রিসেট করে ডিফল্ট করতে চান?')) {
      localStorage.removeItem('salat_reminder_settings');
      state = { ...DEFAULT_SETTINGS };
      prayerService.updateConfig(state);
      init();
      alert('সেটিংস সফলভাবে রিসেট করা হয়েছে।');
    }
  });

  // ১৬. মেইন প্রসেস আইপিসি ইভেন্টস
  if (window.salatAPI) {
    window.salatAPI.onNavigateToTab((tabName) => {
      const targetNav = document.getElementById(`nav${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
      if (targetNav) targetNav.click();
    });

    window.salatAPI.onStopAlarm(() => {
      stopActiveAlarm();
    });
  }

  // শুরু
  init();
});

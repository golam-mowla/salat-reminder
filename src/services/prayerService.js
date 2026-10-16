const adhan = require('adhan');

// বাংলা সংখ্যা রূপান্তর
function toBanglaDigits(val) {
  if (val === null || val === undefined) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, d => bn[d]);
}

// সময় প্যাডিং (যেমন: 05)
function pad(num) {
  return String(num).padStart(2, '0');
}

// সময়কালকে বাংলা লেখা হিসেবে রূপান্তর (ঘণ্টা, মিনিট, সেকেন্ড)
function formatDurationBangla(totalSeconds, useBanglaDigits = true) {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hStr = useBanglaDigits ? toBanglaDigits(pad(hours)) : pad(hours);
  const mStr = useBanglaDigits ? toBanglaDigits(pad(minutes)) : pad(minutes);
  const sStr = useBanglaDigits ? toBanglaDigits(pad(seconds)) : pad(seconds);

  if (hours > 0) {
    return `${hStr} ঘণ্টা ${mStr} মিনিট ${sStr} সেকেন্ড`;
  }
  return `${mStr} মিনিট ${sStr} সেকেন্ড`;
}

// সংক্ষিপ্ত ডিজিটাল স্টাইল (০০:২৫:১৪)
function formatDigitalTimer(totalSeconds, useBanglaDigits = true) {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const h = useBanglaDigits ? toBanglaDigits(pad(hours)) : pad(hours);
  const m = useBanglaDigits ? toBanglaDigits(pad(minutes)) : pad(minutes);
  const s = useBanglaDigits ? toBanglaDigits(pad(seconds)) : pad(seconds);

  return `${h}:${m}:${s}`;
}

// নির্দিষ্ট টাইমজোনে তারিখ ও সময় ফরম্যাটিং
function formatTime(date, timezone = 'Asia/Dhaka', useBanglaDigits = true, includePeriod = true) {
  if (!date || isNaN(date.getTime())) return '--:--';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const parts = formatter.formatToParts(date);
    let hour = '';
    let minute = '';
    let dayPeriod = '';

    parts.forEach(p => {
      if (p.type === 'hour') hour = p.value;
      if (p.type === 'minute') minute = p.value;
      if (p.type === 'dayPeriod') dayPeriod = p.value;
    });

    const hNum = parseInt(hour, 10);
    let periodBn = '';
    if (dayPeriod.toUpperCase() === 'AM') {
      if (hNum >= 4 && hNum < 6) periodBn = 'ভোর';
      else if (hNum >= 6 && hNum < 12) periodBn = 'সকাল';
      else periodBn = 'রাত';
    } else {
      if (hNum === 12 || hNum < 3) periodBn = 'দুপুর';
      else if (hNum >= 3 && hNum < 6) periodBn = 'বিকাল';
      else if (hNum >= 6 && hNum < 8) periodBn = 'সন্ধ্যা';
      else periodBn = 'রাত';
    }

    const hStr = useBanglaDigits ? toBanglaDigits(pad(hour)) : pad(hour);
    const mStr = useBanglaDigits ? toBanglaDigits(pad(minute)) : pad(minute);

    if (includePeriod) {
      return `${periodBn} ${hStr}:${mStr}`;
    }
    return `${hStr}:${mStr}`;
  } catch (e) {
    return date.toLocaleTimeString();
  }
}

class PrayerService {
  constructor(options = {}) {
    this.latitude = options.latitude || 23.8103;
    this.longitude = options.longitude || 90.4125;
    this.timezone = options.timezone || 'Asia/Dhaka';
    this.methodName = options.methodName || 'Karachi'; // Islamic Foundation BD standard aligns with Karachi/Hanafi
    this.madhabName = options.madhabName || 'Hanafi';
    this.useBanglaDigits = options.useBanglaDigits !== undefined ? options.useBanglaDigits : true;
    this.manualOffsetMinutes = options.manualOffsetMinutes || {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    };
  }

  updateConfig(config = {}) {
    if (config.latitude !== undefined) this.latitude = parseFloat(config.latitude);
    if (config.longitude !== undefined) this.longitude = parseFloat(config.longitude);
    if (config.timezone !== undefined) this.timezone = config.timezone;
    if (config.methodName !== undefined) this.methodName = config.methodName;
    if (config.madhabName !== undefined) this.madhabName = config.madhabName;
    if (config.useBanglaDigits !== undefined) this.useBanglaDigits = config.useBanglaDigits;
    if (config.manualOffsetMinutes) {
      this.manualOffsetMinutes = { ...this.manualOffsetMinutes, ...config.manualOffsetMinutes };
    }
  }

  getCalculationParameters() {
    let params;
    switch (this.methodName) {
      case 'IslamicFoundation':
      case 'Karachi':
        params = adhan.CalculationMethod.Karachi();
        break;
      case 'MuslimWorldLeague':
        params = adhan.CalculationMethod.MuslimWorldLeague();
        break;
      case 'UmmAlQura':
        params = adhan.CalculationMethod.UmmAlQura();
        break;
      case 'Egyptian':
        params = adhan.CalculationMethod.Egyptian();
        break;
      case 'Dubai':
        params = adhan.CalculationMethod.Dubai();
        break;
      case 'NorthAmerica':
        params = adhan.CalculationMethod.NorthAmerica();
        break;
      default:
        params = adhan.CalculationMethod.Karachi();
    }

    if (this.madhabName === 'Shafi') {
      params.madhab = adhan.Madhab.Shafi;
    } else {
      params.madhab = adhan.Madhab.Hanafi;
    }

    return params;
  }

  getPrayerTimesForDate(dateObj = new Date()) {
    const coords = new adhan.Coordinates(this.latitude, this.longitude);
    const params = this.getCalculationParameters();
    const pt = new adhan.PrayerTimes(coords, dateObj, params);
    const sunnah = new adhan.SunnahTimes(pt);

    const applyOffset = (date, minutes) => {
      if (!date || !minutes) return date;
      return new Date(date.getTime() + minutes * 60 * 1000);
    };

    const fajr = applyOffset(pt.fajr, this.manualOffsetMinutes.fajr);
    const sunrise = pt.sunrise;
    const dhuhr = applyOffset(pt.dhuhr, this.manualOffsetMinutes.dhuhr);
    const asr = applyOffset(pt.asr, this.manualOffsetMinutes.asr);
    const maghrib = applyOffset(pt.maghrib, this.manualOffsetMinutes.maghrib);
    const isha = applyOffset(pt.isha, this.manualOffsetMinutes.isha);

    // অতিরিক্ত ওয়াক্ত ও নিষিদ্ধ সময়
    // সাহরি শেষ: ফজর শুরুর ৩ মিনিট পূর্বে সতর্কতামূলক সময়
    const sahriEnd = new Date(fajr.getTime() - 3 * 60 * 1000);
    // ইশরাক: সূর্যোদয়ের ১৫ মিনিট পর
    const ishraq = new Date(sunrise.getTime() + 15 * 60 * 1000);
    // জাওয়াল / মধ্যাহ্ন নিষিদ্ধ সময়: যোহরের ১০ মিনিট আগে থেকে যোহর পর্যন্ত
    const zawalStart = new Date(dhuhr.getTime() - 10 * 60 * 1000);
    // সূর্যাস্ত নিষিদ্ধ সময়: মাগরিবের ১৫ মিনিট আগে থেকে মাগরিব পর্যন্ত
    const sunsetForbiddenStart = new Date(maghrib.getTime() - 15 * 60 * 1000);

    return {
      fajr,
      sunrise,
      ishraq,
      zawalStart,
      dhuhr,
      asr,
      sunsetForbiddenStart,
      maghrib,
      isha,
      tahajjud: sunnah.lastThirdOfTheNight,
      midnight: sunnah.middleOfTheNight,
      sahriEnd
    };
  }

  // বর্তমান সার্বিক ওয়াক্ত, অবশিষ্ট সময় এবং পরবর্তী ওয়াক্ত নির্ণয়
  getCurrentStatus(now = new Date()) {
    const today = this.getPrayerTimesForDate(now);

    // গতকাল এবং আগামীকালের ওয়াক্ত দরকার হতে পারে (মধ্যরাত বা এশার ট্রানজিশনের জন্য)
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = this.getPrayerTimesForDate(yesterdayDate);
    const tomorrow = this.getPrayerTimesForDate(tomorrowDate);

    const nowMs = now.getTime();

    let currentWaqt = null;
    let nextWaqt = null;
    let isForbiddenTime = false;
    let forbiddenReason = '';

    // নিষিদ্ধ সময় চেক:
    // ১. সূর্যোদয়ের সময় (Sunrise to Ishraq)
    if (nowMs >= today.sunrise.getTime() && nowMs < today.ishraq.getTime()) {
      isForbiddenTime = true;
      forbiddenReason = 'সূর্যোদয় কালীন সময় (নামাজ পড়া নিষিদ্ধ)';
    }
    // ২. দ্বিপ্রহর / জাওয়াল (Zawal to Dhuhr)
    else if (nowMs >= today.zawalStart.getTime() && nowMs < today.dhuhr.getTime()) {
      isForbiddenTime = true;
      forbiddenReason = 'দ্বিপ্রহর / সূর্য মাথার উপর (নামাজ পড়া নিষিদ্ধ)';
    }
    // ৩. সূর্যাস্ত কালীন সময় (মাগরিবের পূর্বের ১৫ মিনিট - আসর কাজা না থাকলে নফল নিষিদ্ধ)
    else if (nowMs >= today.sunsetForbiddenStart.getTime() && nowMs < today.maghrib.getTime()) {
      isForbiddenTime = true;
      forbiddenReason = 'সূর্যাস্ত কালীন সময় (নামাজ পড়া নিষিদ্ধ)';
    }

    // ওয়াক্ত ট্র্যাকিং
    if (nowMs < today.fajr.getTime()) {
      // মধ্যরাত থেকে ফজর পর্যন্ত
      currentWaqt = {
        id: 'tahajjud_or_isha',
        nameBn: 'তাহাজ্জুদ / সাহরির সময় (এশার শেষাংশ)',
        shortNameBn: 'তাহাজ্জুদ ও সাহরি',
        startTime: yesterday.isha,
        endTime: today.fajr,
        accentColor: '#6366f1' // Indigo
      };
      nextWaqt = {
        id: 'fajr',
        nameBn: 'ফজর',
        shortNameBn: 'ফজর',
        startTime: today.fajr,
        endTime: today.sunrise,
        accentColor: '#10b981' // Emerald
      };
    } else if (nowMs < today.sunrise.getTime()) {
      // ফজর চলছে
      currentWaqt = {
        id: 'fajr',
        nameBn: 'ফজরের ওয়াক্ত',
        shortNameBn: 'ফজর',
        startTime: today.fajr,
        endTime: today.sunrise,
        accentColor: '#10b981'
      };
      nextWaqt = {
        id: 'sunrise',
        nameBn: 'সূর্যোদয় (ফজর সমাপ্তি ও নিষিদ্ধ সময়)',
        shortNameBn: 'সূর্যোদয়',
        startTime: today.sunrise,
        endTime: today.ishraq,
        accentColor: '#f59e0b'
      };
    } else if (nowMs < today.dhuhr.getTime()) {
      // সূর্যোদয় থেকে যোহর পর্যন্ত (ইশরাক/চাশত ও মধ্যাহ্ন)
      currentWaqt = {
        id: 'ishraq_chasht',
        nameBn: nowMs < today.ishraq.getTime() ? 'সূর্যোদয় (নামাজ নিষিদ্ধ)' : 'ইশরাক / চাশতের সময়',
        shortNameBn: 'ইশরাক/চাশত',
        startTime: today.sunrise,
        endTime: today.dhuhr,
        accentColor: '#0ea5e9'
      };
      nextWaqt = {
        id: 'dhuhr',
        nameBn: 'যোহর',
        shortNameBn: 'যোহর',
        startTime: today.dhuhr,
        endTime: today.asr,
        accentColor: '#10b981'
      };
    } else if (nowMs < today.asr.getTime()) {
      // যোহর চলছে
      currentWaqt = {
        id: 'dhuhr',
        nameBn: 'যোহরের ওয়াক্ত',
        shortNameBn: 'যোহর',
        startTime: today.dhuhr,
        endTime: today.asr,
        accentColor: '#10b981'
      };
      nextWaqt = {
        id: 'asr',
        nameBn: 'আসর',
        shortNameBn: 'আসর',
        startTime: today.asr,
        endTime: today.maghrib,
        accentColor: '#059669'
      };
    } else if (nowMs < today.maghrib.getTime()) {
      // আসর চলছে
      currentWaqt = {
        id: 'asr',
        nameBn: 'আসরের ওয়াক্ত',
        shortNameBn: 'আসর',
        startTime: today.asr,
        endTime: today.maghrib,
        accentColor: '#059669'
      };
      nextWaqt = {
        id: 'maghrib',
        nameBn: 'মাগরিব (ইফতারের সময়)',
        shortNameBn: 'মাগরিব',
        startTime: today.maghrib,
        endTime: today.isha,
        accentColor: '#f97316'
      };
    } else if (nowMs < today.isha.getTime()) {
      // মাগরিব চলছে
      currentWaqt = {
        id: 'maghrib',
        nameBn: 'মাগরিবের ওয়াক্ত',
        shortNameBn: 'মাগরিব',
        startTime: today.maghrib,
        endTime: today.isha,
        accentColor: '#f97316'
      };
      nextWaqt = {
        id: 'isha',
        nameBn: 'এশা',
        shortNameBn: 'এশা',
        startTime: today.isha,
        endTime: tomorrow.fajr,
        accentColor: '#8b5cf6'
      };
    } else {
      // এশা চলছে (মধ্যরাত পর্যন্ত ও ফজরের পূর্ব পর্যন্ত)
      currentWaqt = {
        id: 'isha',
        nameBn: 'এশার ওয়াক্ত',
        shortNameBn: 'এশা',
        startTime: today.isha,
        endTime: tomorrow.fajr,
        accentColor: '#8b5cf6'
      };
      nextWaqt = {
        id: 'fajr',
        nameBn: 'ফজর (আগামীকাল)',
        shortNameBn: 'ফজর',
        startTime: tomorrow.fajr,
        endTime: tomorrow.sunrise,
        accentColor: '#10b981'
      };
    }

    // অবশিষ্ট সময় গণনা (সেকেন্ডে)
    const currentRemainingSeconds = Math.max(0, Math.floor((currentWaqt.endTime.getTime() - nowMs) / 1000));
    const nextStartSeconds = Math.max(0, Math.floor((nextWaqt.startTime.getTime() - nowMs) / 1000));

    // ওয়াক্তের প্রগ্রেস পার্সেন্টেজ
    const totalWaqtDuration = (currentWaqt.endTime.getTime() - currentWaqt.startTime.getTime());
    const elapsed = (nowMs - currentWaqt.startTime.getTime());
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalWaqtDuration) * 100)));

    return {
      currentWaqt: {
        id: currentWaqt.id,
        nameBn: currentWaqt.nameBn,
        shortNameBn: currentWaqt.shortNameBn,
        accentColor: currentWaqt.accentColor,
        startTimeMs: currentWaqt.startTime.getTime(),
        endTimeMs: currentWaqt.endTime.getTime(),
        startTimeFormatted: formatTime(currentWaqt.startTime, this.timezone, this.useBanglaDigits),
        endTimeFormatted: formatTime(currentWaqt.endTime, this.timezone, this.useBanglaDigits),
        remainingSeconds: currentRemainingSeconds,
        remainingText: formatDurationBangla(currentRemainingSeconds, this.useBanglaDigits),
        remainingTimerDigital: formatDigitalTimer(currentRemainingSeconds, this.useBanglaDigits),
        progressPercent
      },
      nextWaqt: {
        id: nextWaqt.id,
        nameBn: nextWaqt.nameBn,
        shortNameBn: nextWaqt.shortNameBn,
        accentColor: nextWaqt.accentColor,
        startTimeMs: nextWaqt.startTime.getTime(),
        startTimeFormatted: formatTime(nextWaqt.startTime, this.timezone, this.useBanglaDigits),
        startsInSeconds: nextStartSeconds,
        startsInText: formatDurationBangla(nextStartSeconds, this.useBanglaDigits),
        startsInTimerDigital: formatDigitalTimer(nextStartSeconds, this.useBanglaDigits)
      },
      isForbiddenTime,
      forbiddenReason,
      allTimings: {
        fajr: {
          nameBn: 'ফজর',
          timeFormatted: formatTime(today.fajr, this.timezone, this.useBanglaDigits),
          timeMs: today.fajr.getTime()
        },
        sunrise: {
          nameBn: 'সূর্যোদয় (ফজর শেষ)',
          timeFormatted: formatTime(today.sunrise, this.timezone, this.useBanglaDigits),
          timeMs: today.sunrise.getTime()
        },
        ishraq: {
          nameBn: 'ইশরাক ও চাশত',
          timeFormatted: formatTime(today.ishraq, this.timezone, this.useBanglaDigits),
          timeMs: today.ishraq.getTime()
        },
        dhuhr: {
          nameBn: 'যোহর',
          timeFormatted: formatTime(today.dhuhr, this.timezone, this.useBanglaDigits),
          timeMs: today.dhuhr.getTime()
        },
        asr: {
          nameBn: 'আসর',
          timeFormatted: formatTime(today.asr, this.timezone, this.useBanglaDigits),
          timeMs: today.asr.getTime()
        },
        maghrib: {
          nameBn: 'মাগরিব (ইফতার)',
          timeFormatted: formatTime(today.maghrib, this.timezone, this.useBanglaDigits),
          timeMs: today.maghrib.getTime()
        },
        isha: {
          nameBn: 'এশা',
          timeFormatted: formatTime(today.isha, this.timezone, this.useBanglaDigits),
          timeMs: today.isha.getTime()
        },
        tahajjud: {
          nameBn: 'তাহাজ্জুদ (শেষ তৃতীয়াংশ)',
          timeFormatted: formatTime(today.tahajjud, this.timezone, this.useBanglaDigits),
          timeMs: today.tahajjud.getTime()
        },
        sahriEnd: {
          nameBn: 'সাহরি শেষ (সতর্কতামূলক)',
          timeFormatted: formatTime(today.sahriEnd, this.timezone, this.useBanglaDigits),
          timeMs: today.sahriEnd.getTime()
        }
      }
    };
  }

  // কিবলা দিক নির্ণয়
  getQiblaDirection() {
    const coords = new adhan.Coordinates(this.latitude, this.longitude);
    const compass = adhan.Qibla(coords);
    return Math.round(compass);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PrayerService,
    toBanglaDigits,
    formatDurationBangla,
    formatDigitalTimer,
    formatTime
  };
}

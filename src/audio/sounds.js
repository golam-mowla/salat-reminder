// সালাত রিমাইন্ডার সাউন্ড ইঞ্জিন (Web Audio API)
class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentSources = [];
    this.customAudio = null;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  stop() {
    this.isPlaying = false;
    this.currentSources.forEach(src => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    this.currentSources = [];

    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // ১. আজান মেলোডি (Melodic Adhan Call - Allahu Akbar)
  playAdhanMelody(volume = 0.8) {
    this.stop();
    this.isPlaying = true;
    const ctx = this.getAudioContext();

    // নোট সিকোয়েন্স (মাঝারি ও গম্ভীর হারমোনিকস সহ "আল্লাহু আকবার, আল্লাহু আকবার")
    // D4, F4, G4, A4, G4, F4, E4, D4...
    const notes = [
      { freq: 293.66, dur: 1.2, delay: 0.0 },   // আল্-
      { freq: 349.23, dur: 1.8, delay: 1.1 },   // লাহু
      { freq: 392.00, dur: 1.4, delay: 2.8 },   // আক্-
      { freq: 440.00, dur: 2.5, delay: 4.1 },   // বার্...
      { freq: 392.00, dur: 1.2, delay: 7.0 },   // আল্-
      { freq: 440.00, dur: 1.8, delay: 8.1 },   // লাহু
      { freq: 523.25, dur: 1.6, delay: 9.8 },   // আক্-
      { freq: 440.00, dur: 3.2, delay: 11.3 }   // বার্...
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.45, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(note => {
      const start = ctx.currentTime + note.delay;
      const end = start + note.dur;

      // মূল সুর + ওভারটোন
      [1, 2, 3].forEach((harmonic, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'sine' : (idx === 1 ? 'triangle' : 'sine');
        osc.frequency.setValueAtTime(note.freq * harmonic, start);

        // ভাইব্রেটো (Vibrato)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5.2, start);
        lfoGain.gain.setValueAtTime(idx === 0 ? 3.5 : 1.5, start);
        lfo.connect(osc.frequency);
        lfo.start(start);
        lfo.stop(end);
        this.currentSources.push(lfo);

        // এনভেলপ (Attack & Decay)
        const harmVol = idx === 0 ? 0.7 : (idx === 1 ? 0.25 : 0.1);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(harmVol, start + 0.35);
        gain.gain.exponentialRampToValueAtTime(harmVol * 0.7, start + note.dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(start);
        osc.stop(end);
        this.currentSources.push(osc);
      });
    });

    const totalDur = (notes[notes.length - 1].delay + notes[notes.length - 1].dur) * 1000;
    setTimeout(() => {
      if (this.isPlaying) this.isPlaying = false;
    }, totalDur + 500);
  }

  // ২. প্রশান্তিময় মসজিদের ঘণ্টা / গং (Mosque Bell / Gong)
  playBellGong(volume = 0.8) {
    this.stop();
    this.isPlaying = true;
    const ctx = this.getAudioContext();

    const strikes = [0, 2.2, 4.4];
    const baseFreq = 220; // A3

    strikes.forEach(strikeTime => {
      const start = ctx.currentTime + strikeTime;
      const harmonics = [
        { f: baseFreq * 1.0, g: 0.6, dec: 3.5 },
        { f: baseFreq * 2.76, g: 0.35, dec: 2.8 },
        { f: baseFreq * 5.4, g: 0.2, dec: 1.9 },
        { f: baseFreq * 8.9, g: 0.12, dec: 1.2 }
      ];

      harmonics.forEach(h => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.f, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(h.g * volume, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + h.dec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + h.dec);
        this.currentSources.push(osc);
      });
    });
  }

  // ৩. মধুর ইসলামিক চিম (Sweet Islamic Chime)
  playSweetChime(volume = 0.8) {
    this.stop();
    this.isPlaying = true;
    const ctx = this.getAudioContext();

    const notes = [
      { f: 587.33, d: 0.8, t: 0 },    // D5
      { f: 659.25, d: 0.8, t: 0.25 }, // E5
      { f: 783.99, d: 0.8, t: 0.5 },  // G5
      { f: 880.00, d: 1.2, t: 0.75 }, // A5
      { f: 1046.50, d: 2.2, t: 1.1 }  // C6
    ];

    notes.forEach(n => {
      const start = ctx.currentTime + n.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume * 0.5, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + n.d);
      this.currentSources.push(osc);
    });
  }

  // ৪. ডিজিটাল অ্যালার্ম বিপ (Classic Beep Pulse)
  playDigitalBeep(volume = 0.8) {
    this.stop();
    this.isPlaying = true;
    const ctx = this.getAudioContext();

    // ৩ সেট বিপ-বিপ-বিপ
    for (let set = 0; set < 3; set++) {
      for (let b = 0; b < 3; b++) {
        const start = ctx.currentTime + (set * 1.4) + (b * 0.16);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, start); // A5 beep

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.setValueAtTime(volume * 0.25, start + 0.01);
        gain.gain.setValueAtTime(0.0001, start + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.1);
        this.currentSources.push(osc);
      }
    }
  }

  // ৫. কাস্টম অডিও ফাইল প্লেয়ার (যদি ব্যবহারকারী এমপি৩ ফাইল সিলেক্ট করেন)
  playCustomFile(fileUrl, volume = 0.8) {
    this.stop();
    this.isPlaying = true;
    try {
      this.customAudio = new Audio(fileUrl);
      this.customAudio.volume = Math.max(0, Math.min(1, volume));
      this.customAudio.play().catch(e => {
        console.warn('Custom audio playback failed, falling back to adhan melody', e);
        this.playAdhanMelody(volume);
      });
      this.customAudio.onended = () => {
        this.isPlaying = false;
      };
    } catch (e) {
      this.playAdhanMelody(volume);
    }
  }

  // প্রধান প্লেয়ার মেথড
  playSelectedSound(soundType, volume = 0.8, customFilePath = null) {
    if (soundType === 'custom' && customFilePath) {
      this.playCustomFile(customFilePath, volume);
    } else if (soundType === 'gong') {
      this.playBellGong(volume);
    } else if (soundType === 'chime') {
      this.playSweetChime(volume);
    } else if (soundType === 'beep') {
      this.playDigitalBeep(volume);
    } else {
      // ডিফল্ট: আজান সুর
      this.playAdhanMelody(volume);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundEngine;
}

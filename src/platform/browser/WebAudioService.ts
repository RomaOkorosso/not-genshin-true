import type { AudioEvent, AudioService } from '../types';

const MAX_VOICES = 8;

/** Lightweight WebAudio placeholder SFX — no binary assets. */
export class WebAudioService implements AudioService {
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.7;
  private musicVolume = 0.5;
  private active = 0;

  play(event: AudioEvent): void {
    if (this.active >= MAX_VOICES || this.sfxVolume <= 0) return;
    try {
      const ctx = this.ensureCtx();
      const now = ctx.currentTime;
      const spec = toneFor(event);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.freq, now);
      if (spec.freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, spec.freqEnd), now + spec.dur);
      }
      const vol = this.sfxVolume * spec.gain;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      this.active += 1;
      osc.start(now);
      osc.stop(now + spec.dur + 0.02);
      osc.onended = () => {
        this.active = Math.max(0, this.active - 1);
      };
    } catch {
      // AudioContext unavailable — ignore
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = clamp01(volume);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = clamp01(volume);
    void this.musicVolume;
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function toneFor(event: AudioEvent): {
  type: OscillatorType;
  freq: number;
  freqEnd?: number;
  dur: number;
  gain: number;
} {
  switch (event) {
    case 'archer_shot':
      return { type: 'triangle', freq: 680, freqEnd: 420, dur: 0.08, gain: 0.12 };
    case 'hit':
      return { type: 'square', freq: 220, freqEnd: 120, dur: 0.05, gain: 0.08 };
    case 'crit_hit':
      return { type: 'sawtooth', freq: 520, freqEnd: 260, dur: 0.1, gain: 0.14 };
    case 'enemy_death':
      return { type: 'triangle', freq: 180, freqEnd: 60, dur: 0.14, gain: 0.1 };
    case 'tower_hit':
      return { type: 'square', freq: 90, freqEnd: 50, dur: 0.12, gain: 0.15 };
    case 'elite_arrival':
      return { type: 'sawtooth', freq: 140, freqEnd: 280, dur: 0.2, gain: 0.12 };
    case 'boss_arrival':
      return { type: 'sawtooth', freq: 70, freqEnd: 160, dur: 0.35, gain: 0.18 };
    case 'level_up':
      return { type: 'sine', freq: 440, freqEnd: 880, dur: 0.25, gain: 0.14 };
    case 'upgrade_selected':
      return { type: 'sine', freq: 660, freqEnd: 990, dur: 0.15, gain: 0.12 };
    case 'evolution':
      return { type: 'sine', freq: 330, freqEnd: 990, dur: 0.4, gain: 0.16 };
    case 'almanac_open':
      return { type: 'triangle', freq: 300, dur: 0.08, gain: 0.08 };
    case 'almanac_close':
      return { type: 'triangle', freq: 240, dur: 0.08, gain: 0.08 };
    case 'victory':
      return { type: 'sine', freq: 523, freqEnd: 784, dur: 0.45, gain: 0.16 };
    case 'defeat':
      return { type: 'sawtooth', freq: 200, freqEnd: 60, dur: 0.4, gain: 0.14 };
  }
}

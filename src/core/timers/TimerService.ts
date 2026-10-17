export type TimerCallback = () => void;

interface TimerEntry {
  id: number;
  remaining: number;
  interval: number;
  repeat: boolean;
  callback: TimerCallback;
  paused: boolean;
}

export class TimerService {
  private nextId = 1;
  private readonly timers = new Map<number, TimerEntry>();
  private worldPaused = false;

  setTimeout(callback: TimerCallback, delayMs: number): number {
    return this.add(callback, delayMs, false);
  }

  setInterval(callback: TimerCallback, intervalMs: number): number {
    return this.add(callback, intervalMs, true);
  }

  clear(id: number): void {
    this.timers.delete(id);
  }

  clearAll(): void {
    this.timers.clear();
  }

  setWorldPaused(paused: boolean): void {
    this.worldPaused = paused;
  }

  update(deltaMs: number): void {
    if (this.worldPaused || deltaMs <= 0) return;
    const due: TimerEntry[] = [];
    for (const timer of this.timers.values()) {
      if (timer.paused) continue;
      timer.remaining -= deltaMs;
      if (timer.remaining <= 0) due.push(timer);
    }
    for (const timer of due) {
      timer.callback();
      if (timer.repeat) {
        timer.remaining += timer.interval;
        if (timer.remaining <= 0) timer.remaining = timer.interval;
      } else {
        this.timers.delete(timer.id);
      }
    }
  }

  private add(callback: TimerCallback, delayMs: number, repeat: boolean): number {
    const id = this.nextId++;
    this.timers.set(id, {
      id,
      remaining: delayMs,
      interval: delayMs,
      repeat,
      callback,
      paused: false,
    });
    return id;
  }
}

export class ObjectPool<T> {
  private readonly free: T[] = [];
  private activeCount = 0;

  constructor(
    private readonly factory: () => T,
    private readonly reset: (item: T) => void,
    initialSize = 0,
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.free.push(factory());
    }
  }

  acquire(): T {
    const item = this.free.pop() ?? this.factory();
    this.activeCount += 1;
    return item;
  }

  release(item: T): void {
    this.reset(item);
    this.free.push(item);
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  releaseAll(items: T[]): void {
    for (const item of items) this.release(item);
    items.length = 0;
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  getFreeCount(): number {
    return this.free.length;
  }
}

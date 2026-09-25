// All values, including session records and dashboard state, are JSON.
export interface FoundryKV {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: { nx?: boolean; ttl?: number }): Promise<boolean>;
  delete(key: string): Promise<void>;
  compareAndSet(key: string, before: unknown, after: unknown): Promise<boolean>;
  attempts(key: string, seconds: number): Promise<number>;
}

export class StorageUnavailable extends Error {}

class UnconfiguredKV implements FoundryKV {
  private fail(): never { throw new StorageUnavailable("Foundry storage is not configured."); }
  async get<T>(): Promise<T | null> { return this.fail(); }
  async set(): Promise<boolean> { return this.fail(); }
  async delete(): Promise<void> { this.fail(); }
  async compareAndSet(): Promise<boolean> { return this.fail(); }
  async attempts(): Promise<number> { return this.fail(); }
}

class RestKV implements FoundryKV {
  constructor(private url: string, private token: string) {}
  private async command<T>(...command: (string | number)[]): Promise<T> {
    try {
      const response = await fetch(this.url, {
        method: "POST", headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.error) throw new Error();
      return data.result as T;
    } catch { throw new StorageUnavailable("Foundry storage is unavailable."); }
  }
  async get<T>(key: string): Promise<T | null> {
    const value = await this.command<string | null>("GET", key);
    return value === null ? null : JSON.parse(value) as T;
  }
  async set(key: string, value: unknown, options: { nx?: boolean; ttl?: number } = {}) {
    const args: (string | number)[] = ["SET", key, JSON.stringify(value)];
    if (options.nx) args.push("NX");
    if (options.ttl) args.push("EX", options.ttl);
    return (await this.command(...args)) === "OK";
  }
  async delete(key: string) { await this.command("DEL", key); }
  async compareAndSet(key: string, before: unknown, after: unknown) {
    return await this.command<number>("EVAL", "if redis.call('GET',KEYS[1]) == ARGV[1] then redis.call('SET',KEYS[1],ARGV[2]); return 1 else return 0 end", 1, key, JSON.stringify(before), JSON.stringify(after)) === 1;
  }
  async attempts(key: string, seconds: number) {
    return this.command<number>("EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n", 1, key, seconds);
  }
}

export function storageConfigured() { return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN); }
export const kv: FoundryKV = storageConfigured()
  ? new RestKV(process.env.KV_REST_API_URL!, process.env.KV_REST_API_TOKEN!)
  : new UnconfiguredKV();

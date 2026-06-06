import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const url = config.get<string>('REDIS_URL');
        if (!url) {
          console.warn(
            '[Redis] REDIS_URL absent — utilisation d\'un Redis in-memory (dev only).',
          );
          try {
            const RedisMock = require('ioredis-mock');
            return new RedisMock();
          } catch {
            return createInMemoryRedisStub() as any;
          }
        }
        return new Redis(url, {
          maxRetriesPerRequest: 3,
          lazyConnect: false,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}


function createInMemoryRedisStub() {
  const store = new Map<string, { value: string; expireAt?: number }>();

  const checkExpiry = (key: string) => {
    const entry = store.get(key);
    if (entry && entry.expireAt && Date.now() > entry.expireAt) {
      store.delete(key);
      return null;
    }
    return entry;
  };

  return {
    async get(key: string) {
      const entry = checkExpiry(key);
      return entry ? entry.value : null;
    },
    async set(key: string, value: string, ...args: any[]) {
      const entry: any = { value };
      for (let argIndex = 0; argIndex < args.length; argIndex++) {
        if (args[argIndex] === 'EX' && args[argIndex + 1]) {
          entry.expireAt = Date.now() + Number(args[argIndex + 1]) * 1000;
        }
      }
      store.set(key, entry);
      return 'OK';
    },
    async setex(key: string, seconds: number, value: string) {
      store.set(key, { value, expireAt: Date.now() + seconds * 1000 });
      return 'OK';
    },
    async del(...keys: string[]) {
      let deletedCount = 0;
      for (const key of keys) {
        if (store.delete(key)) deletedCount++;
      }
      return deletedCount;
    },
    async incr(key: string) {
      const entry = checkExpiry(key);
      const next = (entry ? Number(entry.value) : 0) + 1;
      store.set(key, {
        value: String(next),
        expireAt: entry?.expireAt,
      });
      return next;
    },
    async expire(key: string, seconds: number) {
      const entry = store.get(key);
      if (!entry) return 0;
      entry.expireAt = Date.now() + seconds * 1000;
      return 1;
    },
    async keys(pattern: string) {
      const regex = new RegExp(
        '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      );
      return Array.from(store.keys()).filter((key) => regex.test(key));
    },
    async exists(key: string) {
      return checkExpiry(key) ? 1 : 0;
    },
    async ttl(key: string) {
      const entry = checkExpiry(key);
      if (!entry) return -2;
      if (!entry.expireAt) return -1;
      return Math.max(0, Math.floor((entry.expireAt - Date.now()) / 1000));
    },
    on() {
      return this;
    },
    async quit() {
      store.clear();
      return 'OK';
    },
  };
}

import { Redis } from "@upstash/redis";

// ENV değişkenleri var mı?
export const hasRedis =
  Boolean(process.env.REDIS_URL) && Boolean(process.env.REDIS_TOKEN);

// Eğer env varsa gerçek Redis client, yoksa null
export const redis = hasRedis
  ? new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_TOKEN!,
    })
  : null as unknown as Redis;

// Yardımcı fonksiyonlar
export async function incr(key: string) {
  if (!hasRedis) return 1; // env yoksa hep 1 dönelim
  // @ts-ignore
  return await redis.incr(key);
}

export async function expire(key: string, seconds: number) {
  if (!hasRedis) return;
  // @ts-ignore
  await redis.expire(key, seconds);
}

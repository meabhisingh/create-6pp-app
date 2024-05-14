import Redis from "ioredis";

export const connectRedis = async () =>
  new Redis({
    host: "54.153.230.90",
    port: 6379,
  });

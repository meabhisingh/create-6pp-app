import Redis from "ioredis";

export const connectRedis = async () =>
  new Redis({
    host: "88.222.215.201",
    port: 6379,
    password: "kutta123",
  });

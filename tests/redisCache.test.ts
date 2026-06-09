import { afterEach, describe, expect, it } from "vitest";
import { cacheGet, cacheSet, clearMemoryCache } from "../src/utils/redisCache.js";

describe("redisCache", () => {
  afterEach(() => {
    clearMemoryCache();
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HOST;
  });

  it("stores edge scan cache", async () => {
    await cacheSet("edges:0.03", [{ fixtureId: "A1" }], 60);
    const v = await cacheGet<unknown[]>("edges:0.03");
    expect(v?.length).toBe(1);
  });
});

import { describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows up to 5 requests per minute", () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    const ip = "127.0.0.1";
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(ip).ok).toBe(true);
    }
    expect(checkRateLimit(ip).ok).toBe(false);
    vi.restoreAllMocks();
  });
});

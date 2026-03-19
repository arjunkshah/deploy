import { describe, expect, it } from "vitest";

import { buildSlug, parseSlug } from "@/lib/slug";

describe("slug helpers", () => {
  it("builds and parses slugs", () => {
    const slug = buildSlug("vercel", "next.js");
    const parsed = parseSlug(slug);
    expect(parsed).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("returns null for invalid slugs", () => {
    expect(parseSlug("invalid")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { normalizeEnvVars, parseEnvQuery } from "@/lib/env";

describe("parseEnvQuery", () => {
  it("parses key value pairs", () => {
    const result = parseEnvQuery("API_KEY=abc,DB_URL=postgres://db");
    expect(result).toEqual([
      { key: "API_KEY", value: "abc" },
      { key: "DB_URL", value: "postgres://db" }
    ]);
  });

  it("drops empty values", () => {
    const result = parseEnvQuery("API_KEY=,EMPTY= ,VALID=ok");
    expect(result).toEqual([{ key: "VALID", value: "ok" }]);
  });
});

describe("normalizeEnvVars", () => {
  it("deduplicates keys and trims", () => {
    const result = normalizeEnvVars([
      { key: "API_KEY", value: "one" },
      { key: " API_KEY ", value: "two" },
      { key: "DB_URL", value: "db" }
    ]);
    expect(result).toEqual([
      { key: "API_KEY", value: "one" },
      { key: "DB_URL", value: "db" }
    ]);
  });
});

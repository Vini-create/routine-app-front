import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production security headers", () => {
  const headers = readFileSync(join(process.cwd(), "public", "_headers"), "utf8");

  it("allows Google Identity Services without opening the CSP to other hosts", () => {
    expect(headers).toContain("script-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/client");
    expect(headers).toContain("connect-src 'self' https://routine-app-back-production.up.railway.app https://accounts.google.com/gsi/");
    expect(headers).toContain("frame-src https://accounts.google.com/gsi/");
    expect(headers).toContain("style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style");
  });

  it("allows the Google sign-in popup to communicate with its opener", () => {
    expect(headers).toContain("Cross-Origin-Opener-Policy: same-origin-allow-popups");
  });
});

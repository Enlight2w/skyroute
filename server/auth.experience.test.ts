import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const workbenchSource = readFileSync(resolve(projectRoot, "client/src/components/BookingWorkbench.tsx"), "utf8");

describe("authentication experience safeguards", () => {
  it("keeps sign-in initiation in an explicit user event and displays an account state in public navigation", () => {
    expect(homeSource).toContain('onClick={startLogin}');
    expect(homeSource).toContain("isAuthenticated");
    expect(homeSource).toContain("Sign in");
    expect(homeSource).toContain("logout");
  });

  it("offers a clear sign-in path when a traveller opens persistent notification settings", () => {
    expect(workbenchSource).toContain("Sign in to save settings");
    expect(workbenchSource).toContain('onClick={startLogin}');
  });
});

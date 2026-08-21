import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const styles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("SkyRoute accessibility safeguards", () => {
  it("keeps primary interactive controls keyboard-operable native buttons and labels input fields", () => {
    expect(homeSource).toContain('className="search-submit" onClick={handleSearch}');
    expect(homeSource).toContain('aria-label="Promo code"');
    expect(homeSource).toContain('aria-pressed={activeFilter === filter}');
    expect(homeSource).toContain('aria-expanded={detailsOpen === flight.id}');
  });

  it("provides visible keyboard focus and stops decorative movement for reduced-motion users", () => {
    expect(styles).toContain("button:focus-visible, input:focus-visible");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".hero-plane, .hero-flight-path, .orbit-plane { animation: none; }");
  });
});

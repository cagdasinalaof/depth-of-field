// Pure helpers for the tools panel: DoF math, CSV export, named saves.

export type DofNumbers = {
  nearMm: number;
  farMm: number; // Infinity when focus is beyond the hyperfocal limit
  totalMm: number;
  hyperMm: number;
};

// Same formulas as the main calculator (App.tsx).
export function computeDof(
  focalMm: number,
  aperture: number,
  distanceMm: number,
  cocMm: number,
): DofNumbers {
  const hyperMm = focalMm + (focalMm * focalMm) / (aperture * cocMm);
  const farDenominator = hyperMm - (distanceMm - focalMm);
  const farMm = farDenominator <= 0 ? Infinity : (hyperMm * distanceMm) / farDenominator;
  const nearMm = (hyperMm * distanceMm) / (hyperMm + (distanceMm - focalMm));
  return {
    nearMm,
    farMm,
    totalMm: farMm === Infinity ? Infinity : farMm - nearMm,
    hyperMm,
  };
}

// Distance table in metres for the same lens and aperture.
export function buildDofCsv(
  focalMm: number,
  aperture: number,
  cocMm: number,
  distancesM: number[] = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20],
): string {
  const fmt = (mm: number) => (mm === Infinity ? "sonsuz" : (mm / 1000).toFixed(3));
  const rows = distancesM.map((m) => {
    const d = computeDof(focalMm, aperture, m * 1000, cocMm);
    return [m.toFixed(2), fmt(d.nearMm), fmt(d.farMm), fmt(d.totalMm)].join(",");
  });
  return ["mesafe_m,yakin_m,uzak_m,toplam_m", ...rows].join("\n");
}

export type NamedSetup = { name: string; query: string };

export const NAMED_KEY = "dof-named-setups";

export function loadNamedSetups(): NamedSetup[] {
  try {
    const raw = window.localStorage.getItem(NAMED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is NamedSetup =>
        typeof x === "object" && x !== null &&
        typeof (x as NamedSetup).name === "string" &&
        typeof (x as NamedSetup).query === "string",
    );
  } catch {
    return [];
  }
}

export function storeNamedSetups(list: NamedSetup[]): void {
  try {
    window.localStorage.setItem(NAMED_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: list lives only for this page view.
  }
}

// Per-device source record. Left empty on purpose: fill an entry only after
// the address and check date have been verified by hand.
export type GearSource = { address: string; checkedOn: string };

export const GEAR_SOURCES: Record<string, GearSource> = {};

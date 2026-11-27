// Shareable / restorable setup: distance, focal length, aperture, sensor.
// Read order: URL query string first, then the last saved setup in localStorage.

export const SETUP_STORAGE_KEY = "dof-setup";

export type SetupState = {
  distanceInches: number;
  focalMm: number;
  aperture: number;
  sensor: string;
};

const RANGES = {
  distanceInches: [10, 400],
  focalMm: [1, 1000],
  aperture: [0.5, 64],
} as const;

function inRange(value: unknown, [min, max]: readonly [number, number]) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

// Keeps only valid fields; anything else is dropped so defaults apply.
function validate(
  raw: Record<keyof SetupState, unknown>,
  validSensors: readonly string[],
): Partial<SetupState> {
  const out: Partial<SetupState> = {};
  if (inRange(raw.distanceInches, RANGES.distanceInches)) out.distanceInches = raw.distanceInches as number;
  if (inRange(raw.focalMm, RANGES.focalMm)) out.focalMm = raw.focalMm as number;
  if (inRange(raw.aperture, RANGES.aperture)) out.aperture = raw.aperture as number;
  if (typeof raw.sensor === "string" && validSensors.includes(raw.sensor)) out.sensor = raw.sensor;
  return out;
}

// Pure: "?d=72&f=50&n=1.8&s=..." -> partial setup. Missing keys stay undefined.
export function parseSetup(
  search: string,
  validSensors: readonly string[],
): Partial<SetupState> {
  const params = new URLSearchParams(search);
  const num = (key: string) => (params.get(key) === null ? undefined : Number(params.get(key)));
  return validate(
    {
      distanceInches: num("d"),
      focalMm: num("f"),
      aperture: num("n"),
      sensor: params.get("s") ?? undefined,
    } as unknown as Record<keyof SetupState, unknown>,
    validSensors,
  );
}

export function serializeSetup(state: SetupState): string {
  const params = new URLSearchParams({
    d: String(Math.round(state.distanceInches * 10) / 10),
    f: String(Math.round(state.focalMm * 100) / 100),
    n: String(state.aperture),
    s: state.sensor,
  });
  return `?${params.toString()}`;
}

// Browser side: URL wins over localStorage. Never throws (private mode,
// disabled storage, corrupt JSON).
export function loadSetup(validSensors: readonly string[]): Partial<SetupState> {
  if (typeof window === "undefined") return {};
  let stored: Partial<SetupState> = {};
  try {
    const raw = window.localStorage.getItem(SETUP_STORAGE_KEY);
    if (raw) {
      stored = validate(JSON.parse(raw) as Record<keyof SetupState, unknown>, validSensors);
    }
  } catch {
    stored = {};
  }
  return { ...stored, ...parseSetup(window.location.search, validSensors) };
}

export function saveSetup(state: SetupState): void {
  try {
    window.localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(state));
    const url = `${window.location.pathname}${serializeSetup(state)}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  } catch {
    // Storage or history unavailable: the in-memory state still works.
  }
}

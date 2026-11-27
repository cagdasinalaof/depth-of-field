import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSetup, serializeSetup } from "./setupState";

const SENSORS = ["35mm (full frame)", "1/1.3-inch"];

test("round-trips a setup through the query string", () => {
  const state = {
    distanceInches: 72,
    focalMm: 50,
    aperture: 1.8,
    sensor: "35mm (full frame)",
  };
  assert.deepEqual(parseSetup(serializeSetup(state), SENSORS), state);
});

test("drops out-of-range and non-numeric values", () => {
  const parsed = parseSetup("?d=5&f=abc&n=99&s=Unknown", SENSORS);
  assert.deepEqual(parsed, {});
});

test("keeps valid values and ignores missing keys", () => {
  const parsed = parseSetup("?f=6.67&n=1.7&s=1%2F1.3-inch", SENSORS);
  assert.deepEqual(parsed, { focalMm: 6.67, aperture: 1.7, sensor: "1/1.3-inch" });
});

test("rejects a sensor that is not in the known list", () => {
  assert.equal(parseSetup("?s=Imaginary", SENSORS).sensor, undefined);
});

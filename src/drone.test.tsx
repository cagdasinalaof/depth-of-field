import test from "node:test";
import assert from "node:assert/strict";
import { droneGround } from "./drone";

const close = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("straight down: slant equals altitude, ground distance is zero", () => {
  const g = droneGround(30, 90, 40);
  close(g.slantM, 30);
  close(g.groundM, 0);
});

test("45 degrees tilt at 10 m: slant and ground distance match trigonometry", () => {
  const g = droneGround(10, 45, 0.0001);
  close(g.slantM, 10 * Math.SQRT2, 1e-3);
  close(g.groundM, 10, 1e-3);
});

test("near and far edges bracket the centre distance", () => {
  const g = droneGround(20, 45, 30);
  assert.ok(g.nearGroundM < g.groundM);
  assert.ok(g.groundM < g.farGroundM);
});

test("far edge at or above the horizon is infinite", () => {
  const g = droneGround(20, 10, 40); // 10 - 20 < 0
  assert.equal(g.farGroundM, Infinity);
});

test("near edge past straight down reaches the ground under the drone", () => {
  const g = droneGround(20, 80, 30); // 80 + 15 >= 90
  assert.equal(g.nearGroundM, 0);
});

test("rejects invalid input", () => {
  assert.throws(() => droneGround(0, 45, 30), RangeError);
  assert.throws(() => droneGround(10, 0, 30), RangeError);
  assert.throws(() => droneGround(10, 91, 30), RangeError);
  assert.throws(() => droneGround(10, 45, 0), RangeError);
});

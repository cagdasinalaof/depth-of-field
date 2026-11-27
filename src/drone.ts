// Drone camera geometry: where the frame centre and its edges land on the ground.
// tiltDownDeg: camera angle below the horizon (0 = level, 90 = straight down).
// vfovDeg: vertical field of view of the lens/sensor combination.

export type DroneGround = {
  slantM: number; // straight-line distance from the drone to the frame centre
  groundM: number; // horizontal distance from the drone to the frame centre
  nearGroundM: number; // ground distance to the near (bottom) edge of the frame
  farGroundM: number; // ground distance to the far (top) edge; Infinity at/above the horizon
};

const RAD = Math.PI / 180;

export function droneGround(altitudeM: number, tiltDownDeg: number, vfovDeg: number): DroneGround {
  if (!(altitudeM > 0)) throw new RangeError("altitudeM must be > 0");
  if (!(tiltDownDeg > 0 && tiltDownDeg <= 90)) throw new RangeError("tiltDownDeg must be in (0, 90]");
  if (!(vfovDeg > 0 && vfovDeg < 180)) throw new RangeError("vfovDeg must be in (0, 180)");

  const half = vfovDeg / 2;
  const nearAngle = tiltDownDeg + half;
  const farAngle = tiltDownDeg - half;

  const groundFromAngle = (deg: number) => altitudeM / Math.tan(deg * RAD);

  return {
    slantM: altitudeM / Math.sin(tiltDownDeg * RAD),
    groundM: tiltDownDeg >= 90 ? 0 : groundFromAngle(tiltDownDeg),
    // Near edge at or past straight-down: the frame reaches the ground under the drone.
    nearGroundM: nearAngle >= 90 ? 0 : groundFromAngle(nearAngle),
    // Far edge at or above the horizon: the frame never reaches the ground.
    farGroundM: farAngle <= 0 ? Infinity : groundFromAngle(farAngle),
  };
}

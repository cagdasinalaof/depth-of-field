// KNOWN ISSUE (original code): 11.96 in prints as "0' 12.0\"" because the rounding happens after splitting feet. See CHANGES.md.
export const toImperial = (inches: number, precision = 1) => {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}' ${remainingInches.toFixed(precision)}"`;
};

export const toMetric = (inches: number, precision = 1) => {
  const cm = inches * 2.54;
  return `${cm.toFixed(precision)} cm`;
};

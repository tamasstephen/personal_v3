export const duration = 3600;
/** @param {number} value */
const clamp = value => Math.min(1, Math.max(0, value));
/** @param {number} time @param {{start: number, end: number}} interval */
const range = (time, { start, end }) => clamp((time - start) / (end - start));
/** @param {number} value */
const ease = value => 1 - Math.pow(1 - value, 3);

/** @param {number} time */
function getPhase(time) {
  if (time < 900) return 'Structure';
  if (time < 2450) return 'Assembly';
  if (time < 3500) return 'Experience';
  return 'Clarity';
}

/** @param {number} milliseconds @param {boolean} reducedMotion */
export function sample(milliseconds, reducedMotion = false) {
  const safeTime = Number.isFinite(milliseconds) ? milliseconds : 0;
  const time = reducedMotion ? duration : Math.max(0, Math.min(duration, safeTime));
  const assembly = ease(range(time, { start: 650, end: 2450 }));
  const surface = ease(range(time, { start: 1750, end: 2800 }));
  const grid = ease(range(time, { start: 0, end: 750 })) * (1 - .75 * range(time, { start: 2600, end: 3600 }));
  const scan = range(time, { start: 2800, end: 3450 });
  const highlight = time > 2800 && time < 3450 ? Math.sin(Math.PI * scan) : 0;
  const phase = getPhase(time);
  return { assembly, surface, grid, highlight, scan, phase, progress: time / duration };
}

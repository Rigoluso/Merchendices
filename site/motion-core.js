const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function deriveScrollMotion({ scrollY, previousY, maxScroll }) {
  const delta = scrollY - previousY;
  return {
    progress: maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0,
    direction: delta === 0 ? 0 : delta > 0 ? 1 : -1,
    intensity: clamp(Math.abs(delta) / 60, 0, 1),
  };
}

export function staggerDelay(index, step = 70, maximum = 560) {
  return clamp(Math.max(0, index) * step, 0, maximum);
}

export function motionProfile({ reduced, finePointer }) {
  return {
    animate: !reduced,
    pointer: !reduced && finePointer,
    transitions: !reduced,
  };
}

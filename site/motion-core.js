const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const round = (value, precision = 3) => {
  const factor = 10 ** precision;
  const result = Math.round(value * factor) / factor;
  return Object.is(result, -0) ? 0 : result;
};

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

export function motionProfile({ reduced, finePointer, force = false }) {
  const animate = force || !reduced;
  return {
    animate,
    pointer: animate && finePointer,
    transitions: animate,
  };
}

export function deriveCardMotion({ pointerX, pointerY, left, top, width, height, maximumTilt = 12, maximumShift = 10 }) {
  const normalizedX = clamp(((pointerX - left) / Math.max(1, width)) * 2 - 1, -1, 1);
  const normalizedY = clamp(((pointerY - top) / Math.max(1, height)) * 2 - 1, -1, 1);

  return {
    rotateX: round(-normalizedY * maximumTilt),
    rotateY: round(normalizedX * maximumTilt),
    translateX: round(normalizedX * maximumShift),
    translateY: round(normalizedY * maximumShift),
    innerX: round(normalizedX * maximumShift * -0.45),
    innerY: round(normalizedY * maximumShift * -0.45),
    shineX: round((normalizedX + 1) * 50),
    shineY: round((normalizedY + 1) * 50),
  };
}

export function deriveTextMotion({ viewportOffset, direction, intensity, index }) {
  const offset = clamp(viewportOffset, -1, 1);
  const energy = clamp(intensity, 0, 1);
  const scrollDirection = direction === 0 ? 0 : direction > 0 ? 1 : -1;
  const polarity = index % 2 === 0 ? 1 : -1;

  return {
    x: round(offset * 7 * polarity + scrollDirection * energy * 6 * polarity),
    y: round(offset * -8 + scrollDirection * energy * 4),
    skew: round(scrollDirection * energy * 5 * polarity + offset),
    rotate: round(scrollDirection * energy * 1.75 * polarity),
    scaleX: round(1 + energy * 0.055),
    scaleY: round(1 - energy * 0.035),
  };
}

export function settleMotion(value, decay = 0.82, threshold = 0.01) {
  if (Math.abs(value) < threshold) return 0;
  return round(value * decay);
}

export function createMotionFrameGuard() {
  let generation = 0;
  return {
    issue() {
      generation += 1;
      return generation;
    },
    cancel() {
      generation += 1;
    },
    isCurrent(candidate) {
      return candidate === generation;
    },
  };
}

export function withMotionPreference({ href, base, force }) {
  const destination = new URL(href, base);
  if (force) destination.searchParams.set("motion", "full");
  return destination;
}

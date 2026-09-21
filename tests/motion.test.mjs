import test from "node:test";
import assert from "node:assert/strict";

let motion = null;
try {
  motion = await import("../site/motion-core.js");
} catch {
  // The first TDD run intentionally exercises the missing motion core.
}

test("scroll motion reports bounded progress, direction, and intensity", () => {
  assert.equal(typeof motion?.deriveScrollMotion, "function");

  assert.deepEqual(
    motion.deriveScrollMotion({ scrollY: 600, previousY: 540, maxScroll: 1200 }),
    { progress: 0.5, direction: 1, intensity: 1 },
  );
  assert.deepEqual(
    motion.deriveScrollMotion({ scrollY: -20, previousY: 20, maxScroll: 1200 }),
    { progress: 0, direction: -1, intensity: 2 / 3 },
  );
  assert.deepEqual(
    motion.deriveScrollMotion({ scrollY: 1800, previousY: 1800, maxScroll: 1200 }),
    { progress: 1, direction: 0, intensity: 0 },
  );
});

test("stagger delays stay rhythmic without growing forever", () => {
  assert.equal(typeof motion?.staggerDelay, "function");

  assert.equal(motion.staggerDelay(0), 0);
  assert.equal(motion.staggerDelay(3), 210);
  assert.equal(motion.staggerDelay(20), 560);
  assert.equal(motion.staggerDelay(-4), 0);
});

test("full motion is the default unless the visitor explicitly reduces it", () => {
  assert.equal(typeof motion?.motionProfile, "function");

  assert.deepEqual(motion.motionProfile({ explicitReduced: false, finePointer: true }), {
    animate: true,
    pointer: true,
    transitions: true,
  });
  assert.deepEqual(motion.motionProfile({ explicitReduced: true, finePointer: true }), {
    animate: false,
    pointer: false,
    transitions: false,
  });
  assert.deepEqual(motion.motionProfile({ explicitReduced: false, finePointer: false }), {
    animate: true,
    pointer: false,
    transitions: true,
  });
});

test("card motion follows the pointer and stays inside safe tilt bounds", () => {
  assert.equal(typeof motion?.deriveCardMotion, "function");

  assert.deepEqual(
    motion.deriveCardMotion({ pointerX: 150, pointerY: 100, left: 50, top: 50, width: 200, height: 100 }),
    { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0, innerX: 0, innerY: 0, shineX: 50, shineY: 50 },
  );
  assert.deepEqual(
    motion.deriveCardMotion({ pointerX: 250, pointerY: 50, left: 50, top: 50, width: 200, height: 100 }),
    { rotateX: 12, rotateY: 12, translateX: 10, translateY: -10, innerX: -4.5, innerY: 4.5, shineX: 100, shineY: 0 },
  );
  assert.deepEqual(
    motion.deriveCardMotion({ pointerX: 500, pointerY: -100, left: 50, top: 50, width: 200, height: 100 }),
    { rotateX: 12, rotateY: 12, translateX: 10, translateY: -10, innerX: -4.5, innerY: 4.5, shineX: 100, shineY: 0 },
  );
});

test("text motion responds to scroll direction, speed, viewport position, and word rhythm", () => {
  assert.equal(typeof motion?.deriveTextMotion, "function");

  assert.deepEqual(
    motion.deriveTextMotion({ viewportOffset: 0.5, direction: 1, intensity: 0.8, index: 0 }),
    { x: 8.3, y: -0.8, skew: 4.5, rotate: 1.4, scaleX: 1.044, scaleY: 0.972 },
  );
  assert.deepEqual(
    motion.deriveTextMotion({ viewportOffset: 0.5, direction: 1, intensity: 0.8, index: 1 }),
    { x: -8.3, y: -0.8, skew: -3.5, rotate: -1.4, scaleX: 1.044, scaleY: 0.972 },
  );
  assert.deepEqual(
    motion.deriveTextMotion({ viewportOffset: 0, direction: -5, intensity: 2, index: 0 }),
    { x: -6, y: -4, skew: -5, rotate: -1.75, scaleX: 1.055, scaleY: 0.965 },
  );
});

test("motion energy settles smoothly to rest", () => {
  assert.equal(typeof motion?.settleMotion, "function");

  assert.equal(motion.settleMotion(0.5), 0.41);
  assert.equal(motion.settleMotion(-0.5), -0.41);
  assert.equal(motion.settleMotion(0.005), 0);
});

test("motion frame guard invalidates queued card work after pointer exit", () => {
  assert.equal(typeof motion?.createMotionFrameGuard, "function");

  const guard = motion.createMotionFrameGuard();
  const queuedFrame = guard.issue();
  assert.equal(guard.isCurrent(queuedFrame), true);
  guard.cancel();
  assert.equal(guard.isCurrent(queuedFrame), false);
  const nextFrame = guard.issue();
  assert.equal(guard.isCurrent(nextFrame), true);
});

test("only an explicit reduced-motion choice is carried across internal pages", () => {
  assert.equal(typeof motion?.withMotionPreference, "function");

  assert.equal(
    motion.withMotionPreference({ href: "/services/", base: "http://localhost:8080/", explicitReduced: false }).href,
    "http://localhost:8080/services/",
  );
  assert.equal(
    motion.withMotionPreference({ href: "/services/", base: "http://localhost:8080/", explicitReduced: true }).href,
    "http://localhost:8080/services/?motion=reduced",
  );
});

test("scroll reveals content reached or skipped before the current viewport", () => {
  assert.equal(typeof motion?.shouldRevealOnScroll, "function");

  assert.equal(motion.shouldRevealOnScroll({ top: 860, viewportHeight: 800, preload: 120 }), true);
  assert.equal(motion.shouldRevealOnScroll({ top: -1400, viewportHeight: 800, preload: 120 }), true);
  assert.equal(motion.shouldRevealOnScroll({ top: 1000, viewportHeight: 800, preload: 120 }), false);
});

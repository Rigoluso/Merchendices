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

test("motion profile disables intensive effects for reduced motion", () => {
  assert.equal(typeof motion?.motionProfile, "function");

  assert.deepEqual(motion.motionProfile({ reduced: true, finePointer: true }), {
    animate: false,
    pointer: false,
    transitions: false,
  });
  assert.deepEqual(motion.motionProfile({ reduced: false, finePointer: false }), {
    animate: true,
    pointer: false,
    transitions: true,
  });
});

import {
  createMotionFrameGuard,
  deriveCardMotion,
  deriveScrollMotion,
  deriveTextMotion,
  motionProfile,
  shouldRevealOnScroll,
  settleMotion,
  staggerDelay,
  withMotionPreference,
} from "./motion-core.js";

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const explicitReduced = new URLSearchParams(window.location.search).get("motion") === "reduced";
let profile = motionProfile({ explicitReduced, finePointer: finePointer.matches });

const revealNodes = [...document.querySelectorAll("[data-reveal]")];
const closingSection = document.querySelector(".closing");
const processVisual = document.querySelector(".process-visual");
const processStages = [...document.querySelectorAll(".process-stage")];
const processNumber = document.querySelector(".process-stage-number");
const processProgress = document.querySelector(".process-progress");
let activeStage = 0;
const scrollMeter = document.querySelector(".scroll-meter span");
const root = document.documentElement;
const kineticHeadings = [];
const resetPointerCards = [];
if (profile.animate) root.classList.add("force-motion");

function installMotionLayer() {
  if (!profile.animate) return;
  root.classList.add("motion-enabled");
}

function splitKineticText(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
  }

  let wordIndex = 0;
  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) {
        fragment.append(part);
        return;
      }
      const word = document.createElement("span");
      word.className = "kinetic-word";
      word.style.setProperty("--word-index", String(wordIndex));
      word.textContent = part;
      fragment.append(word);
      wordIndex += 1;
    });
    node.replaceWith(fragment);
  });
}

function prepareKineticType() {
  document.querySelectorAll("h1, h2, .service-card h3, .process-stage h3, .work-card h3").forEach((heading) => {
    splitKineticText(heading);
    heading.classList.add("motion-heading");
    kineticHeadings.push({ heading, words: [...heading.querySelectorAll(".kinetic-word")] });
  });
  revealNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${staggerDelay(index % 9)}ms`);
  });
}

function setActiveStage(stageIndex) {
  if (!processVisual || !processStages.length) return;
  const safeIndex = Math.max(0, Math.min(processStages.length - 1, stageIndex));
  activeStage = safeIndex;
  processVisual?.setAttribute("data-stage", String(safeIndex));
  const stage = processStages[safeIndex];
  const title = stage.querySelector("h3").textContent;
  processNumber.textContent = `${String(safeIndex + 1).padStart(2, "0")} / 04`;
  processVisual.querySelector(".process-step-label").textContent = stage.querySelector("p").textContent;
  processVisual.querySelector(".process-panel-title").textContent = title;
  processVisual.querySelector(".process-panel-description").textContent = stage.querySelector("p:last-of-type").textContent;
  processStages.forEach((item, index) => {
    item.classList.toggle("is-active", index === safeIndex);
    const button = item.querySelector("[data-process-select]");
    if (button) button.setAttribute("aria-current", String(index === safeIndex));
  });
  processProgress.setAttribute("aria-valuenow", String(safeIndex + 1));
  processProgress.setAttribute("aria-valuetext", `Step ${safeIndex + 1} of 4: ${title}`);
  processProgress.querySelector("span").style.width = `${(safeIndex + 1) * 25}%`;
  processVisual.querySelector("[data-process-prev]").disabled = safeIndex === 0;
  processVisual.querySelector("[data-process-next]").disabled = safeIndex === processStages.length - 1;
}

function setupProcessNavigation() {
  if (!processVisual) return;
  processVisual.querySelector(".process-navigation").hidden = false;
  processVisual.querySelector("[data-process-prev]").addEventListener("click", () => setActiveStage(activeStage - 1));
  processVisual.querySelector("[data-process-next]").addEventListener("click", () => setActiveStage(activeStage + 1));
  processStages.forEach((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.processSelect = String(index);
    button.textContent = "View stage";
    button.setAttribute("aria-label", `View stage ${index + 1}: ${stage.querySelector("h3").textContent}`);
    button.addEventListener("click", () => setActiveStage(index));
    stage.append(button);
  });
  setActiveStage(0);
}

function showEverything() {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
  closingSection?.classList.add("is-visible");
  document.querySelectorAll("main > section, .store-showcase").forEach((section) => section.classList.add("motion-section-active"));
  setActiveStage(0);
}

function revealTraversedContent() {
  revealNodes.forEach((node) => {
    if (node.classList.contains("is-visible")) return;
    if (shouldRevealOnScroll({ top: node.getBoundingClientRect().top, viewportHeight: window.innerHeight })) {
      node.classList.add("is-visible");
    }
  });

  if (closingSection && !closingSection.classList.contains("is-visible")) {
    if (shouldRevealOnScroll({ top: closingSection.getBoundingClientRect().top, viewportHeight: window.innerHeight })) {
      closingSection.classList.add("is-visible");
    }
  }
}

function setupObservers() {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.02, rootMargin: "0px 0px 12%" });

  revealNodes.forEach((node) => revealObserver.observe(node));
  if (closingSection) revealObserver.observe(closingSection);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.classList.contains("motion-section-active")) return;
      entry.target.classList.add("motion-section-active");
    });
  }, { threshold: 0.04, rootMargin: "0px 0px 10%" });
  document.querySelectorAll("main > section, .store-showcase").forEach((section) => sectionObserver.observe(section));

}

function setupPointerMotion() {
  if (!profile.pointer) return;
  const aura = document.querySelector(".cursor-aura");

  window.addEventListener("pointermove", (event) => {
    const normalizedX = event.clientX / window.innerWidth - 0.5;
    const normalizedY = event.clientY / window.innerHeight - 0.5;
    root.style.setProperty("--pointer-shift-x", `${(normalizedX * 20).toFixed(2)}px`);
    root.style.setProperty("--pointer-shift-y", `${(normalizedY * 16).toFixed(2)}px`);
    root.style.setProperty("--pointer-rotate", `${(normalizedX * 2.4).toFixed(2)}deg`);
    if (aura) aura.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  }, { passive: true });

  document.querySelectorAll(".service-card, .work-card, .model-card, .store-browser").forEach((card) => {
    card.classList.add("motion-card");
    card.insertAdjacentHTML("afterbegin", '<i class="card-glare" aria-hidden="true"></i>');
    const frameGuard = createMotionFrameGuard();
    let cardFrame = 0;
    let cardRect = null;
    let pointerEvent = null;

    card.addEventListener("pointerenter", () => {
      cardRect = card.getBoundingClientRect();
      card.classList.add("is-motion-hovered");
    });
    card.addEventListener("pointermove", (event) => {
      pointerEvent = event;
      if (cardFrame) return;
      const frameToken = frameGuard.issue();
      cardFrame = requestAnimationFrame(() => {
        if (!frameGuard.isCurrent(frameToken)) {
          cardFrame = 0;
          return;
        }
        const rect = cardRect || card.getBoundingClientRect();
        const motion = deriveCardMotion({
          pointerX: pointerEvent.clientX,
          pointerY: pointerEvent.clientY,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
        card.style.setProperty("--card-rx", `${motion.rotateX}deg`);
        card.style.setProperty("--card-ry", `${motion.rotateY}deg`);
        card.style.setProperty("--card-x", `${motion.translateX}px`);
        card.style.setProperty("--card-y", `${motion.translateY}px`);
        card.style.setProperty("--card-inner-x", `${motion.innerX}px`);
        card.style.setProperty("--card-inner-y", `${motion.innerY}px`);
        card.style.setProperty("--spot-x", `${motion.shineX}%`);
        card.style.setProperty("--spot-y", `${motion.shineY}%`);
        cardFrame = 0;
      });
    });
    const resetCard = () => {
      frameGuard.cancel();
      if (cardFrame) cancelAnimationFrame(cardFrame);
      cardFrame = 0;
      pointerEvent = null;
      card.classList.remove("is-motion-hovered");
      cardRect = null;
      card.style.setProperty("--card-rx", "0deg");
      card.style.setProperty("--card-ry", "0deg");
      card.style.setProperty("--card-x", "0px");
      card.style.setProperty("--card-y", "0px");
      card.style.setProperty("--card-inner-x", "0px");
      card.style.setProperty("--card-inner-y", "0px");
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", "50%");
    };
    resetPointerCards.push(resetCard);
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointercancel", resetCard);
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = Math.max(-11, Math.min(11, (event.clientX - rect.left - rect.width / 2) * 0.16));
      const y = Math.max(-11, Math.min(11, (event.clientY - rect.top - rect.height / 2) * 0.16));
      button.style.transform = `translate(${x}px, ${y}px) scale(1.035)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

function setupPageTransitions() {
  // Native navigation starts immediately and preserves browser link behavior.
  document.querySelectorAll("a[href]").forEach((anchor) => {
    if (anchor.origin !== location.origin || anchor.getAttribute("href").startsWith("#")) return;
    anchor.href = withMotionPreference({ href: anchor.href, base: location.href, explicitReduced }).href;
  });
}

const parallaxNodes = [...document.querySelectorAll(".hero-grid, .page-hero > div, .process-symbol, .store-copy, .store-browser")];
let previousY = window.scrollY;
let scrollDirection = 0;
let scrollEnergy = 0;
let scrollFrame = 0;

function updateKineticText() {
  kineticHeadings.forEach(({ heading, words }) => {
    const rect = heading.getBoundingClientRect();
    if (rect.bottom < -160 || rect.top > window.innerHeight + 160) return;
    const viewportOffset = ((rect.top + rect.height / 2) / window.innerHeight - 0.5) * 2;
    words.forEach((word, index) => {
      const motion = deriveTextMotion({ viewportOffset, direction: scrollDirection, intensity: scrollEnergy, index });
      word.style.setProperty("--word-scroll-x", `${motion.x}px`);
      word.style.setProperty("--word-scroll-y", `${motion.y}px`);
      word.style.setProperty("--word-skew", `${motion.skew}deg`);
      word.style.setProperty("--word-rotate", `${motion.rotate}deg`);
      word.style.setProperty("--word-scale-x", String(motion.scaleX));
      word.style.setProperty("--word-scale-y", String(motion.scaleY));
    });
  });
}

function updateMotionFrame() {
  revealTraversedContent();
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const state = deriveScrollMotion({ scrollY: window.scrollY, previousY, maxScroll });
  previousY = window.scrollY;
  if (state.direction) scrollDirection = state.direction;
  scrollEnergy = Math.max(state.intensity, scrollEnergy);
  root.style.setProperty("--scroll-progress", state.progress.toFixed(4));
  root.style.setProperty("--scroll-direction", String(scrollDirection));
  root.style.setProperty("--scroll-energy", scrollEnergy.toFixed(3));
  root.style.setProperty("--marquee-speed", `${Math.max(9, 26 - scrollEnergy * 15).toFixed(2)}s`);
  if (scrollMeter) scrollMeter.style.width = `${state.progress * 100}%`;

  if (profile.animate) {
    parallaxNodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const depth = 10 + (index % 4) * 5;
      node.style.setProperty("--parallax-y", `${Math.max(-28, Math.min(28, -distance * depth)).toFixed(2)}px`);
    });
    updateKineticText();
  }

  scrollEnergy = settleMotion(scrollEnergy);
  return scrollEnergy !== 0;
}

function requestMotionFrame() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (updateMotionFrame()) requestMotionFrame();
  });
}

installMotionLayer();
setupProcessNavigation();
setupPageTransitions();
prepareKineticType();
if (profile.animate) {
  setupObservers();
  setupPointerMotion();
} else {
  showEverything();
}

function resetCardsAndRequestMotion() {
  resetPointerCards.forEach((resetCard) => resetCard());
  requestMotionFrame();
}

window.addEventListener("scroll", resetCardsAndRequestMotion, { passive: true });
window.addEventListener("resize", resetCardsAndRequestMotion, { passive: true });
window.addEventListener("pageshow", () => {
  document.body.classList.remove("is-leaving");
  document.querySelector(".page-curtain")?.classList.remove("is-closing");
});

reduceMotion.addEventListener("change", () => {
  profile = motionProfile({ explicitReduced, finePointer: finePointer.matches });
});

updateMotionFrame();

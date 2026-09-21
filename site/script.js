import { deriveScrollMotion, motionProfile, staggerDelay } from "./motion-core.js";

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let profile = motionProfile({ reduced: reduceMotion.matches, finePointer: finePointer.matches });

const revealNodes = [...document.querySelectorAll("[data-reveal]")];
const closingSection = document.querySelector(".closing");
const processVisual = document.querySelector(".process-visual");
const processStages = [...document.querySelectorAll(".process-stage")];
const processNumber = document.querySelector(".process-stage-number");
const processBars = [...document.querySelectorAll(".process-progress i")];
const scrollMeter = document.querySelector(".scroll-meter span");
const root = document.documentElement;

function installMotionLayer() {
  if (!profile.animate) return;
  root.classList.add("motion-enabled");
  document.body.insertAdjacentHTML("beforeend", `
    <div class="motion-field" aria-hidden="true">
      <i class="motion-orb motion-orb--green"></i>
      <i class="motion-orb motion-orb--violet"></i>
      <i class="motion-orb motion-orb--orange"></i>
      <i class="motion-scan"></i>
    </div>
    <div class="page-curtain is-intro" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="cursor-aura" aria-hidden="true"></div>
  `);
  window.setTimeout(() => document.querySelector(".page-curtain")?.classList.remove("is-intro"), 1100);
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
  document.querySelectorAll("h1, h2, .service-card h3, .process-stage h3, .work-card h3").forEach(splitKineticText);
  revealNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${staggerDelay(index % 9)}ms`);
  });
}

function setActiveStage(stageIndex) {
  const safeIndex = Math.max(0, Math.min(processStages.length - 1, stageIndex));
  const stageChanged = processVisual?.dataset.stage !== String(safeIndex);
  processVisual?.setAttribute("data-stage", String(safeIndex));
  if (processNumber) processNumber.textContent = String(safeIndex + 1).padStart(2, "0");
  processStages.forEach((stage, index) => stage.classList.toggle("is-active", index === safeIndex));
  processBars.forEach((bar, index) => { bar.style.opacity = index === safeIndex ? "1" : ".28"; });
  if (stageChanged && processVisual && profile.animate) {
    processVisual.classList.remove("stage-burst");
    requestAnimationFrame(() => processVisual.classList.add("stage-burst"));
  }
}

function showEverything() {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
  closingSection?.classList.add("is-visible");
  document.querySelectorAll("main > section, .store-showcase").forEach((section) => section.classList.add("motion-section-active"));
  setActiveStage(0);
}

function setupObservers() {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5%" });

  revealNodes.forEach((node) => revealObserver.observe(node));
  if (closingSection) revealObserver.observe(closingSection);

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.classList.contains("motion-section-active")) return;
      entry.target.classList.add("motion-section-active");
    });
  }, { threshold: 0.16 });
  document.querySelectorAll("main > section, .store-showcase").forEach((section) => sectionObserver.observe(section));

  const stageObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveStage(Number(visible.target.dataset.stageIndex));
  }, { threshold: [0.25, 0.5, 0.75], rootMargin: "-18% 0px -35%" });

  processStages.forEach((stage) => stageObserver.observe(stage));
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

  document.querySelectorAll(".tilt-card, .store-browser").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateZ(8px)`;
      card.style.setProperty("--spot-x", `${((x + 0.5) * 100).toFixed(1)}%`);
      card.style.setProperty("--spot-y", `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
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
  if (!profile.transitions) return;
  const curtain = document.querySelector(".page-curtain");
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (anchor.target || anchor.hasAttribute("download")) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.hash) return;

    event.preventDefault();
    curtain?.classList.add("is-closing");
    document.body.classList.add("is-leaving");
    window.setTimeout(() => { window.location.href = destination.href; }, 820);
  });
}

const parallaxNodes = [...document.querySelectorAll(".hero-grid, .page-hero > div, .process-symbol, .store-copy, .store-browser")];
let previousY = window.scrollY;
let scrollFrame = 0;

function updateMotionFrame() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const state = deriveScrollMotion({ scrollY: window.scrollY, previousY, maxScroll });
  previousY = window.scrollY;
  root.style.setProperty("--scroll-progress", state.progress.toFixed(4));
  root.style.setProperty("--scroll-direction", String(state.direction));
  root.style.setProperty("--scroll-energy", state.intensity.toFixed(3));
  root.style.setProperty("--marquee-speed", `${Math.max(11, 26 - state.intensity * 12).toFixed(2)}s`);
  if (scrollMeter) scrollMeter.style.width = `${state.progress * 100}%`;

  if (profile.animate) {
    parallaxNodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      const depth = 10 + (index % 4) * 5;
      node.style.setProperty("--parallax-y", `${Math.max(-28, Math.min(28, -distance * depth)).toFixed(2)}px`);
    });
  }
}

function requestMotionFrame() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    updateMotionFrame();
    scrollFrame = 0;
  });
}

installMotionLayer();
prepareKineticType();
if (profile.animate) {
  setupObservers();
  setupPointerMotion();
  setupPageTransitions();
} else {
  showEverything();
}

window.addEventListener("scroll", requestMotionFrame, { passive: true });
window.addEventListener("resize", requestMotionFrame, { passive: true });
window.addEventListener("pageshow", () => {
  document.body.classList.remove("is-leaving");
  document.querySelector(".page-curtain")?.classList.remove("is-closing");
});

reduceMotion.addEventListener("change", (event) => {
  profile = motionProfile({ reduced: event.matches, finePointer: finePointer.matches });
  if (event.matches) {
    root.classList.remove("motion-enabled");
    showEverything();
  }
});

updateMotionFrame();

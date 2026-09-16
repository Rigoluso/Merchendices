document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealNodes = [...document.querySelectorAll("[data-reveal]")];
const closingSection = document.querySelector(".closing");
const processVisual = document.querySelector(".process-visual");
const processStages = [...document.querySelectorAll(".process-stage")];
const processNumber = document.querySelector(".process-stage-number");
const processBars = [...document.querySelectorAll(".process-progress i")];
const scrollMeter = document.querySelector(".scroll-meter span");

function setActiveStage(stageIndex) {
  const safeIndex = Math.max(0, Math.min(processStages.length - 1, stageIndex));
  processVisual?.setAttribute("data-stage", String(safeIndex));
  if (processNumber) processNumber.textContent = String(safeIndex + 1).padStart(2, "0");
  processStages.forEach((stage, index) => stage.classList.toggle("is-active", index === safeIndex));
  processBars.forEach((bar, index) => { bar.style.opacity = index === safeIndex ? "1" : ".28"; });
}

function showEverything() {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
  closingSection?.classList.add("is-visible");
  setActiveStage(0);
}

function setupObservers() {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -5%" });

  revealNodes.forEach((node) => revealObserver.observe(node));
  if (closingSection) revealObserver.observe(closingSection);

  const stageObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveStage(Number(visible.target.dataset.stageIndex));
  }, { threshold: [0.25, 0.5, 0.75], rootMargin: "-18% 0px -35%" });

  processStages.forEach((stage) => stageObserver.observe(stage));
}

function setupPointerMotion() {
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!hasFinePointer || reduceMotion.matches) return;

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = Math.max(-8, Math.min(8, (event.clientX - rect.left - rect.width / 2) * 0.12));
      const y = Math.max(-8, Math.min(8, (event.clientY - rect.top - rect.height / 2) * 0.12));
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener("pointerleave", () => { button.style.transform = ""; });
  });
}

function updateScrollMeter() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  if (scrollMeter) scrollMeter.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;
}

if (reduceMotion.matches) showEverything();
else { setupObservers(); setupPointerMotion(); }

let scrollFrame = 0;
window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => { updateScrollMeter(); scrollFrame = 0; });
}, { passive: true });

reduceMotion.addEventListener("change", (event) => { if (event.matches) showEverything(); });
updateScrollMeter();

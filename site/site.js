const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealNodes = [...document.querySelectorAll("[data-reveal]")];

if (!reducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
  revealNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 70}ms`);
    observer.observe(node);
  });
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

(function () {
  const envelope = document.getElementById("envelope");
  const hint = document.getElementById("envelopeHint");
  const panel = document.getElementById("letterPanel");
  const backdrop = document.getElementById("letterBackdrop");
  const closeBtn = document.getElementById("letterClose");
  const sheet = document.getElementById("letterSheet");

  if (!envelope || !panel) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  /** Match flap transition (~0.78s), then show letter modal. */
  const FLAP_MS = reduceMotion ? 0 : 820;

  let busy = false;
  let openTimer = null;

  function openLetter() {
    if (busy || envelope.classList.contains("is-open")) return;
    busy = true;
    envelope.setAttribute("aria-expanded", "true");
    envelope.classList.remove("is-open");
    requestAnimationFrame(() => {
      if (hint) hint.style.opacity = "0";
      envelope.classList.add("is-opening");

      openTimer = window.setTimeout(() => {
        envelope.classList.add("is-open");
        envelope.classList.remove("is-opening");
        panel.hidden = false;
        busy = false;
        openTimer = null;
      }, FLAP_MS);
    });
  }

  function closeLetter() {
    if (openTimer) window.clearTimeout(openTimer);
    openTimer = null;
    panel.hidden = true;
    envelope.classList.remove("is-open", "is-opening");
    envelope.setAttribute("aria-expanded", "false");
    if (hint) hint.style.opacity = "";
  }

  envelope.addEventListener("click", openLetter);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLetter();
    }
  });

  closeBtn?.addEventListener("click", closeLetter);
  backdrop?.addEventListener("click", closeLetter);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closeLetter();
  });

  const observer = new MutationObserver(() => {
    if (!panel.hidden && sheet) {
      sheet.style.animation = "none";
      void sheet.offsetHeight;
      sheet.style.animation = "";
    }
  });
  observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
})();

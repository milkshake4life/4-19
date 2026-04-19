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
  const openDelayMs = reduceMotion ? 50 : 1100;
  let busy = false;

  function openLetter() {
    if (busy || envelope.classList.contains("is-open")) return;
    busy = true;
    envelope.setAttribute("aria-expanded", "true");
    envelope.classList.remove("is-open");
    /* Next frame so the flap can transition from “closed” (hover no longer fights .is-opening). */
    requestAnimationFrame(() => {
      envelope.classList.add("is-opening");
      if (hint) hint.style.opacity = "0";

      window.setTimeout(() => {
        envelope.classList.add("is-open");
        envelope.classList.remove("is-opening");
        panel.hidden = false;
        busy = false;
      }, openDelayMs);
    });
  }

  function closeLetter() {
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

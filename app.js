(function () {
  const envelope = document.getElementById("envelope");
  const hint = document.getElementById("envelopeHint");
  const panel = document.getElementById("letterPanel");
  const backdrop = document.getElementById("letterBackdrop");
  const closeBtn = document.getElementById("letterClose");
  const sheet = document.getElementById("letterSheet");
  const photoLightbox = document.getElementById("photoLightbox");
  const photoLightboxImg = document.getElementById("photoLightboxImg");
  const photoLightboxBackdrop = document.getElementById("photoLightboxBackdrop");
  const photoLightboxClose = document.getElementById("photoLightboxClose");

  if (!envelope || !panel) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  /** Flap CSS transition is 0.78s — wait for it before paper lifts. */
  const FLAP_MS = reduceMotion ? 0 : 780;
  /** Small beat after flap lands, then paper animates. */
  const AFTER_FLAP_MS = reduceMotion ? 0 : 160;
  /** Paper transform transition ~0.65s + buffer before modal. */
  const AFTER_PAPER_MS = reduceMotion ? 50 : 720;

  let busy = false;
  let openTimer1 = null;
  let openTimer2 = null;

  function openLetter() {
    if (busy || envelope.classList.contains("is-open")) return;
    busy = true;
    envelope.setAttribute("aria-expanded", "true");
    envelope.classList.remove("is-open", "is-opening-paper");
    /* Next frame so the flap can transition from “closed” (hover no longer fights .is-opening). */
    requestAnimationFrame(() => {
      if (hint) hint.style.opacity = "0";

      if (reduceMotion) {
        envelope.classList.add("is-opening", "is-opening-paper");
        openTimer2 = window.setTimeout(() => {
          envelope.classList.add("is-open");
          envelope.classList.remove("is-opening", "is-opening-paper");
          panel.hidden = false;
          busy = false;
          openTimer2 = null;
        }, AFTER_PAPER_MS);
        return;
      }

      envelope.classList.add("is-opening");

      openTimer1 = window.setTimeout(() => {
        envelope.classList.add("is-opening-paper");
      }, FLAP_MS + AFTER_FLAP_MS);

      openTimer2 = window.setTimeout(() => {
        envelope.classList.add("is-open");
        envelope.classList.remove("is-opening", "is-opening-paper");
        panel.hidden = false;
        busy = false;
        openTimer1 = null;
        openTimer2 = null;
      }, FLAP_MS + AFTER_FLAP_MS + AFTER_PAPER_MS);
    });
  }

  function closeLetter() {
    if (openTimer1) window.clearTimeout(openTimer1);
    if (openTimer2) window.clearTimeout(openTimer2);
    openTimer1 = null;
    openTimer2 = null;
    panel.hidden = true;
    envelope.classList.remove("is-open", "is-opening", "is-opening-paper");
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

  function openPhotoLightbox(img) {
    if (!photoLightbox || !photoLightboxImg || !img?.src) return;
    photoLightboxImg.src = img.currentSrc || img.src;
    photoLightboxImg.alt = img.alt || "Photo";
    photoLightbox.hidden = false;
    document.body.style.overflow = "hidden";
    photoLightboxClose?.focus();
  }

  function closePhotoLightbox() {
    if (!photoLightbox || photoLightbox.hidden) return;
    photoLightbox.hidden = true;
    document.body.style.overflow = "";
    if (photoLightboxImg) photoLightboxImg.src = "";
  }

  document.querySelectorAll(".photo-card img").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      openPhotoLightbox(img);
    });
  });

  photoLightboxBackdrop?.addEventListener("click", closePhotoLightbox);
  photoLightboxClose?.addEventListener("click", closePhotoLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (photoLightbox && !photoLightbox.hidden) {
      closePhotoLightbox();
      return;
    }
    if (!panel.hidden) closeLetter();
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

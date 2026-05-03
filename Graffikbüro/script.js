/* ================================================================
   STUDIO MAYER — script.js
   Funktionen:
     1. Navigation: Scrolled-State & Hamburger-Menü
     2. Scroll-Reveal (IntersectionObserver)
     3. Zahlen-Counter (Statistiken)
     4. Portfolio-Filter
     5. Testimonial-Slider (Auto-Rotate + Dots)
     6. Kontaktformular-Validierung & Pseudo-Submit
     7. Scroll-to-Top Button
================================================================ */

"use strict";

/* ----------------------------------------------------------------
   1. NAVIGATION — Scrolled-State & Hamburger
---------------------------------------------------------------- */
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const drawer = document.getElementById("drawer");

// Fügt "scrolled" hinzu sobald die Seite nach unten gescrollt wird
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    handleScrollTopBtn();
  },
  { passive: true },
);

// Hamburger öffnet / schließt den mobilen Drawer
hamburger.addEventListener("click", () => {
  const isOpen = drawer.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  drawer.setAttribute("aria-hidden", String(!isOpen));
});

// Drawer schließen wenn ein Drawer-Link geklickt wird
drawer.querySelectorAll(".nav__drawer-link").forEach((link) => {
  link.addEventListener("click", () => {
    drawer.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
  });
});

/* ----------------------------------------------------------------
   2. SCROLL-REVEAL (IntersectionObserver)
   Elemente mit der Klasse .reveal werden sichtbar, wenn sie
   in den Viewport eintreten.
---------------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Gestaffelte Verzögerung für Geschwister-Elemente
        const siblings = [
          ...entry.target.parentElement.querySelectorAll(
            ".reveal:not(.visible)",
          ),
        ];
        const delay = siblings.indexOf(entry.target) * 80;

        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

/* ----------------------------------------------------------------
   3. ZAHLEN-COUNTER (Statistiken in der About-Sektion)
   Animiert die Zahlen von 0 bis zum Zielwert wenn sie sichtbar
   werden.
---------------------------------------------------------------- */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400; // ms
      const step = 16; // ~60fps
      const steps = duration / step;
      const increment = target / steps;
      let current = 0;

      const tick = () => {
        current += increment;
        if (current < target) {
          el.textContent = Math.floor(current);
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 },
);

document
  .querySelectorAll(".stat__num[data-target]")
  .forEach((el) => counterObserver.observe(el));

/* ----------------------------------------------------------------
   4. PORTFOLIO-FILTER
   Filtert Kacheln nach Datenkategorie (data-cat)
---------------------------------------------------------------- */
const filterBtns = document.querySelectorAll(".filter-btn");
const portfolioItems = document.querySelectorAll(".portfolio-item");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Aktiv-Klasse wechseln
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    portfolioItems.forEach((item) => {
      const cats = item.dataset.cat || "";

      if (filter === "all" || cats.includes(filter)) {
        item.classList.remove("hidden");
        // Mini-Einblend-Animation
        item.style.animation = "none";
        void item.offsetWidth; // Reflow erzwingen
        item.style.animation = "fadeInUp 0.45s ease both";
      } else {
        item.classList.add("hidden");
      }
    });
  });
});

// Keyframe für Filter-Animation per JS injiziert
(function injectFilterKeyframe() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: none; }
    }
  `;
  document.head.appendChild(style);
})();

/* ----------------------------------------------------------------
   5. TESTIMONIAL-SLIDER
   Automatischer Wechsel alle 5 Sekunden; Dots als Navigation
---------------------------------------------------------------- */
const testimonials = document.querySelectorAll(".testimonial");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;
let autoSlideTimer;

function showSlide(index) {
  // Alte Folie ausblenden
  testimonials[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  // Neue Folie einblenden
  currentSlide = (index + testimonials.length) % testimonials.length;
  testimonials[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function startAutoSlide() {
  autoSlideTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

// Dot-Navigation
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(parseInt(dot.dataset.index, 10));
    resetAutoSlide();
  });
});

startAutoSlide();

/* ----------------------------------------------------------------
   6. KONTAKTFORMULAR — Validierung & Pseudo-Submit
   Zeigt Fehlerstatus an den Eingabefeldern und eine
   Erfolgsmeldung nach dem Absenden.
---------------------------------------------------------------- */
const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  // Validierung (bleibt gleich)
  ["name", "email", "message"].forEach((id) => {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      field.classList.add("error");
      valid = false;
    } else field.classList.remove("error");
  });

  const emailField = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailField.value.trim() && !emailRegex.test(emailField.value.trim())) {
    emailField.classList.add("error");
    valid = false;
  }

  if (!valid) return;

  // Sende-Button deaktivieren während des Versands
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = "Wird gesendet …";
  btn.disabled = true;

  try {
    const data = new FormData(form);
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data,
    });
    const result = await response.json();

    if (result.success) {
      formSuccess.textContent =
        "✓ Ihre Nachricht wurde erfolgreich gesendet – wir melden uns bald!";
      form.reset();
    } else {
      formSuccess.style.color = "#c0392b";
      formSuccess.textContent =
        "✗ Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.";
    }
  } catch (err) {
    formSuccess.style.color = "#c0392b";
    formSuccess.textContent =
      "✗ Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung.";
  } finally {
    btn.textContent = "Nachricht senden ✦";
    btn.disabled = false;
    setTimeout(() => {
      formSuccess.textContent = "";
      formSuccess.style.color = "";
    }, 6000);
  }
});

// Fehlerklasse bei erneuter Eingabe entfernen
form.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => field.classList.remove("error"));
});

/* ----------------------------------------------------------------
   7. SCROLL-TO-TOP BUTTON
   Erscheint wenn mehr als 400px gescrollt wurde
---------------------------------------------------------------- */
const scrollTopBtn = document.getElementById("scrollTop");

function handleScrollTopBtn() {
  scrollTopBtn.classList.toggle("visible", window.scrollY > 400);
}

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ----------------------------------------------------------------
   INIT — Scrolled-State beim Laden prüfen (bei page-reload)
---------------------------------------------------------------- */
(function init() {
  if (window.scrollY > 40) nav.classList.add("scrolled");
  if (window.scrollY > 400) scrollTopBtn.classList.add("visible");
})();

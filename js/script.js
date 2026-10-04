const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const cursorGlow = document.querySelector(".cursor-glow");
const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (supportsFinePointer.matches && !prefersReducedMotion.matches) {
  let cursorFrame = 0;
  let cursorX = -500;
  let cursorY = -500;
  let targetX = -500;
  let targetY = -500;

  function animateCursor() {
    cursorX += (targetX - cursorX) * 0.18;
    cursorY += (targetY - cursorY) * 0.18;
    cursorGlow.style.setProperty("--cursor-x", `${cursorX}px`);
    cursorGlow.style.setProperty("--cursor-y", `${cursorY}px`);

    if (Math.abs(targetX - cursorX) > 0.5 || Math.abs(targetY - cursorY) > 0.5) {
      cursorFrame = requestAnimationFrame(animateCursor);
      return;
    }

    cursorX = targetX;
    cursorY = targetY;
    cursorGlow.style.setProperty("--cursor-x", `${cursorX}px`);
    cursorGlow.style.setProperty("--cursor-y", `${cursorY}px`);
    cursorFrame = 0;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!cursorGlow.classList.contains("visible")) {
      cursorX = targetX;
      cursorY = targetY;
    }
    cursorGlow.classList.add("visible");

    if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor);
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    cursorGlow.classList.remove("visible");
  });
}

function closeMenu() {
  navMenu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
  navMenu.classList.toggle("open", !isExpanded);
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const fields = [
  {
    input: document.querySelector("#name"),
    error: document.querySelector("#name-error"),
    validate: (value) => value.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters)."
  },
  {
    input: document.querySelector("#email"),
    error: document.querySelector("#email-error"),
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address."
  },
  {
    input: document.querySelector("#message"),
    error: document.querySelector("#message-error"),
    validate: (value) => value.trim().length >= 10 ? "" : "Please enter a message of at least 10 characters."
  }
];

function validateField(field) {
  const errorMessage = field.validate(field.input.value);
  field.error.textContent = errorMessage;
  field.input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  return !errorMessage;
}

fields.forEach((field) => {
  field.input.addEventListener("input", () => {
    validateField(field);
    formStatus.textContent = "";
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  const isValid = fields.map(validateField).every(Boolean);
  if (!isValid) {
    fields.find((field) => field.input.getAttribute("aria-invalid") === "true").input.focus();
    return;
  }

  const name = document.querySelector("#name").value.trim();
  formStatus.textContent = `Thanks, ${name}. Your details are valid, but this form does not send messages. Please use GitHub or LinkedIn to get in touch.`;
  contactForm.reset();
  fields.forEach((field) => {
    field.error.textContent = "";
    field.input.removeAttribute("aria-invalid");
  });
});

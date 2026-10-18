/* Yuval's Light Codes */

// Fill these in to activate direct contact. WhatsApp: international format, digits only (e.g. "972501234567").
const CONTACT = {
  whatsapp: "972505822182",
  email: "",
  instagram: "",
  tiktok: "",
};

const SERVICE_LABELS = {
  channeling: "תקשור אישי",
  custom: "ציור Light Code בהתאמה אישית",
  ready: "ציור מהגלריה",
  general: "עוד לא בטוחה, רוצה לשמוע עוד",
};

document.documentElement.classList.add("js");

/* Header hairline once the page moves */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* Mobile nav */
const nav = document.getElementById("main-nav");
const toggle = document.querySelector(".nav-toggle");

const pageParts = [document.getElementById("main"), document.querySelector(".site-footer"), document.querySelector(".header-cta")];
function setNav(open) {
  nav.classList.toggle("open", open);
  pageParts.forEach((el) => { el.inert = open; });
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "סגירת תפריט" : "פתיחת תפריט");
  document.body.classList.toggle("nav-open", open);
  if (open) nav.querySelector("a")?.focus();
}

// Keep Tab inside the full-screen menu while it is open
document.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !nav.classList.contains("open")) return;
  const items = [...nav.querySelectorAll("a"), toggle];
  const i = items.indexOf(document.activeElement);
  const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === -1 || i === items.length - 1 ? 0 : i + 1);
  e.preventDefault();
  items[next].focus();
});
toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link || !nav.classList.contains("open")) return;
  setNav(false);
  // Hand focus to the section we jump to, so it doesn't stay on a hidden menu link
  const target = document.querySelector(link.getAttribute("href"));
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); toggle.focus(); } });
document.querySelector(".site-header .brand").addEventListener("click", () => { if (nav.classList.contains("open")) setNav(false); });
const desktopMq = window.matchMedia("(min-width: 961px)");
const onDesktop = (e) => { if (e.matches) setNav(false); };
if (desktopMq.addEventListener) desktopMq.addEventListener("change", onDesktop);
else if (desktopMq.addListener) desktopMq.addListener(onDesktop);

/* Headings rise word by word as they enter */
function splitWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
  let i = 0;
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const w = document.createElement("span");
      w.className = "w";
      w.style.setProperty("--i", i++);
      w.textContent = part;
      frag.append(w);
    }
    node.replaceWith(frag);
  }
  el.classList.add("split");
}
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && !new URLSearchParams(location.search).has("static")) {
  document.querySelectorAll(".reveal .h2, .display").forEach(splitWords);
}

/* Reveal on scroll + active nav link */
// "?static" shows everything immediately (used for screenshots / QA)
const staticMode = new URLSearchParams(location.search).has("static") || !("IntersectionObserver" in window);
const io = staticMode ? null : new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
  }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  if (staticMode) { el.classList.add("in"); return; }
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
  io.observe(el);
});

const navLinks = [...document.querySelectorAll(".main-nav ul a")];
const spy = staticMode ? null : new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const id = entry.target.id;
    navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
if (spy) document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

/* Artwork rail: prev/next buttons + "01 / 05" counter */
const rail = document.getElementById("rail");
const works = [...rail.querySelectorAll(".work")];
const railNow = document.getElementById("rail-now");
const [prevBtn, nextBtn] = ["prev", "next"].map((d) => document.querySelector(`.rail-btn[data-dir="${d}"]`));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = -1;

function setCurrent(i) {
  if (i === current) return;
  current = i;
  railNow.textContent = String(i + 1).padStart(2, "0");
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === works.length - 1;
}
// RTL: align the artwork's right (start) edge with the rail's, scrolling only the rail
function goTo(i) {
  i = Math.max(0, Math.min(works.length - 1, i));
  const delta = works[i].getBoundingClientRect().right - rail.getBoundingClientRect().right;
  rail.scrollBy({ left: delta, behavior: reduceMotion.matches ? "auto" : "smooth" });
  setCurrent(i);
}
prevBtn.addEventListener("click", () => goTo(current - 1));
nextBtn.addEventListener("click", () => goTo(current + 1));
rail.addEventListener("keydown", (e) => {
  const moves = { ArrowLeft: current + 1, ArrowRight: current - 1, Home: 0, End: works.length - 1 };
  if (e.key in moves) { e.preventDefault(); goTo(moves[e.key]); }
});
// Follow manual swiping: the first artwork that is (almost) fully in view is "current"
function trackRail() {
  const box = rail.getBoundingClientRect();
  const seen = works.map((w) => {
    const r = w.getBoundingClientRect();
    return Math.max(0, Math.min(r.right, box.right) - Math.max(r.left, box.left)) / r.width;
  });
  let best = seen.findIndex((f) => f > 0.95);
  if (best === -1) best = seen.indexOf(Math.max(...seen));
  if (Math.abs(rail.scrollLeft) + rail.clientWidth >= rail.scrollWidth - 4) best = works.length - 1;
  setCurrent(best);
}
let railTick = 0;
rail.addEventListener("scroll", () => { cancelAnimationFrame(railTick); railTick = requestAnimationFrame(trackRail); }, { passive: true });
setCurrent(0);

/* CTA buttons preselect the service in the form */
document.querySelectorAll("[data-service]").forEach((el) => {
  el.addEventListener("click", () => {
    const radio = document.querySelector(`input[name="service"][value="${el.dataset.service}"]`);
    if (radio) radio.checked = true;
  });
});

/* Lightbox: browse the paintings, ask about the one you're looking at */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbCaption = document.getElementById("lightbox-caption");
const lbNow = document.getElementById("lb-now");
const lbAsk = document.getElementById("lb-ask");
const artButtons = [...document.querySelectorAll(".art-open")];
document.getElementById("lb-total").textContent = String(artButtons.length).padStart(2, "0");
let lbIndex = 0;
let lastTrigger = null;

function showArt(i) {
  lbIndex = (i + artButtons.length) % artButtons.length;
  const btn = artButtons[lbIndex];
  lbImg.src = btn.dataset.full;
  lbImg.alt = btn.querySelector("img").alt;
  lbCaption.textContent = btn.dataset.caption || "";
  lbImg.classList.toggle("is-round", "round" in btn.dataset);
  lbNow.textContent = String(lbIndex + 1).padStart(2, "0");
  document.getElementById("lb-live").textContent = `ציור ${lbIndex + 1} מתוך ${artButtons.length}: ${btn.dataset.title}`;
  const ready = btn.dataset.kind === "ready";
  lbAsk.textContent = ready ? "אני רוצה את הציור הזה" : "אני רוצה ציור כזה, משלי";
  lbAsk.dataset.service = ready ? "ready" : "custom";
}

function openArt(btn) {
  lastTrigger = btn;
  if (typeof lightbox.showModal !== "function") { window.location.href = btn.dataset.full; return; }
  const thumb = btn.querySelector("img");
  const open = () => { showArt(artButtons.indexOf(btn)); lightbox.showModal(); };
  // The painting grows out of its frame where View Transitions are supported
  if (document.startViewTransition && !reduceMotion.matches) {
    thumb.style.viewTransitionName = "art";
    document.startViewTransition(() => {
      thumb.style.viewTransitionName = "";
      lbImg.style.viewTransitionName = "art";
      open();
    }).finished.finally(() => { lbImg.style.viewTransitionName = ""; });
  } else open();
}
artButtons.forEach((btn) => btn.addEventListener("click", () => openArt(btn)));

const step = (d) => showArt(lbIndex + d);
lightbox.querySelector(".lb-prev").addEventListener("click", () => step(-1));
lightbox.querySelector(".lb-next").addEventListener("click", () => step(1));
lightbox.addEventListener("keydown", (e) => {
  // RTL: the left arrow moves forward
  if (e.key === "ArrowLeft") step(1);
  if (e.key === "ArrowRight") step(-1);
});
let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) step(dx > 0 ? 1 : -1);
});
lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
lightbox.addEventListener("close", () => { lbImg.src = ""; if (!lbAsk.dataset.going) lastTrigger?.focus(); delete lbAsk.dataset.going; });

// "I want this painting": close, pick the service and start the message for her
lbAsk.addEventListener("click", (e) => {
  e.preventDefault();
  const btn = artButtons[lbIndex];
  const ready = btn.dataset.kind === "ready";
  const radio = document.querySelector(`input[name="service"][value="${lbAsk.dataset.service}"]`);
  if (radio) radio.checked = true;
  // Replace our own earlier suggestion, but never text the visitor wrote herself
  const msg = document.getElementById("f-message");
  if (!msg.value.trim() || msg.value === lbAsk.dataset.auto) {
    msg.value = ready ? `אני מתעניינת בציור "${btn.dataset.title}".` : `ראיתי את הציור "${btn.dataset.title}" ואני רוצה ציור אישי משלי.`;
    lbAsk.dataset.auto = msg.value;
  }
  lbAsk.dataset.going = "1";
  lightbox.close();
  document.getElementById("contact").scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
  document.getElementById("f-name").focus({ preventScroll: true });
});

/* Soft light that follows the pointer across a painting (mouse only) */
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".art-open .mat, .hero-art .round").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* Contact form */
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const nameInput = document.getElementById("f-name");
const nameError = document.getElementById("err-name");
const copyBox = document.getElementById("copy-box");
const copyText = document.getElementById("copy-text");
const copyBtn = document.getElementById("copy-btn");
form.querySelector("button[type=submit]").disabled = false;

function buildMessage(data) {
  const lines = [
    "היי יובל 🤍",
    `שמי ${data.name}.`,
    `אני מתעניינת ב: ${SERVICE_LABELS[data.service] || SERVICE_LABELS.general}`,
  ];
  if (data.phone) lines.push(`טלפון: ${data.phone}`);
  if (data.message) lines.push("", data.message);
  return lines.join("\n");
}

function contactUrl(text) {
  if (CONTACT.whatsapp) return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  if (CONTACT.email) return `mailto:${CONTACT.email}?subject=${encodeURIComponent("פנייה מהאתר · Light Codes")}&body=${encodeURIComponent(text)}`;
  return "";
}

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) { nameInput.removeAttribute("aria-invalid"); nameInput.removeAttribute("aria-describedby"); nameError.textContent = ""; }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = {
    service: fd.get("service"),
    name: String(fd.get("name") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    message: String(fd.get("message") || "").trim(),
  };

  if (!data.name) {
    nameInput.setAttribute("aria-invalid", "true");
    nameInput.setAttribute("aria-describedby", "err-name");
    nameError.textContent = "איך לקרוא לך?";
    nameInput.focus();
    return;
  }

  const text = buildMessage(data);
  const url = contactUrl(text);

  if (url) {
    // A real link click: opens WhatsApp / the mail app once, without popup heuristics.
    // On phones (incl. Instagram/TikTok in-app browsers) stay in the same tab: new windows may be blocked there.
    const a = document.createElement("a");
    a.href = url;
    const isPhone = window.matchMedia("(pointer: coarse)").matches;
    if (url.startsWith("https:") && !isPhone) { a.target = "_blank"; a.rel = "noopener"; }
    document.body.append(a);
    a.click();
    a.remove();
    statusEl.textContent = CONTACT.whatsapp
      ? "ההודעה נפתחה ב־WhatsApp. נשאר רק ללחוץ שליחה שם, ואחזור אלייך בהקדם 🤍"
      : "ההודעה נפתחה באפליקציית המייל. נשאר רק ללחוץ שליחה שם, ואחזור אלייך בהקדם 🤍";
    showDone(url);
    return;
  }

  // No contact channel configured: be honest, and hand the visitor a ready-to-copy message
  copyText.value = text;
  copyBox.hidden = false;
  statusEl.textContent = socials.length
    ? "ההודעה עדיין לא נשלחה. אפשר להעתיק אותה ולשלוח לי באחד הערוצים כאן למטה."
    : "ההודעה עדיין לא נשלחה. אפשר להעתיק אותה ולשלוח לי ישירות.";
});

/* Thank-you state after the hand-off */
const formDone = document.getElementById("form-done");
function showDone(url) {
  const reopen = document.getElementById("done-reopen");
  reopen.href = url;
  if (url.startsWith("https:") && !window.matchMedia("(pointer: coarse)").matches) { reopen.target = "_blank"; reopen.rel = "noopener"; }
  form.classList.add("sent");
  formDone.hidden = false;
  formDone.focus({ preventScroll: true });
}
document.getElementById("done-reset").addEventListener("click", () => {
  form.reset();
  form.classList.remove("sent");
  formDone.hidden = true;
  statusEl.textContent = "";
  nameInput.focus();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyText.value);
    copyBtn.textContent = "הועתק ✓";
  } catch {
    copyText.select();
    copyBtn.textContent = "מסומן, אפשר להעתיק";
  }
});

/* Social + direct links from CONTACT */
const socials = [
  CONTACT.whatsapp && { label: "WhatsApp", href: `https://wa.me/${CONTACT.whatsapp}` },
  CONTACT.instagram && { label: "Instagram", href: CONTACT.instagram },
  CONTACT.tiktok && { label: "TikTok", href: CONTACT.tiktok },
  CONTACT.email && { label: CONTACT.email, href: `mailto:${CONTACT.email}` },
].filter(Boolean);

const socialList = document.getElementById("social-links");
for (const s of socials) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = s.href;
  a.textContent = s.label;
  if (s.href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
  li.append(a);
  socialList.append(li);
}

// "Or straight on WhatsApp: 050-582-2182" next to the form
if (CONTACT.whatsapp) {
  const local = "0" + CONTACT.whatsapp.replace(/^972/, "");
  const pretty = local.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2-$3");
  const direct = document.getElementById("contact-direct");
  const a = document.createElement("a");
  a.href = `https://wa.me/${CONTACT.whatsapp}`;
  a.dir = "ltr";
  a.textContent = pretty;
  direct.append("או ישירות ב־WhatsApp: ", a);
}

if (!CONTACT.whatsapp && !CONTACT.email) {
  document.getElementById("form-intro").textContent = "משאירים כמה פרטים, ומקבלים הודעה מוכנה לשליחה אליי.";
}

document.getElementById("year").textContent = new Date().getFullYear();

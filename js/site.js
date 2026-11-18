/* ==========================================================================
   DETAILERS INC — site behaviour
   The page scrolls natively: no pinning, no scroll-jacking, no smooth-scroll
   library. Scroll position only *drives* transforms on things already moving
   past (parallax, reveals, the opening frame), via GSAP ScrollTrigger scrub.
   Without GSAP or with reduced motion, everything is simply shown.
   1. navigation, chapters, menu     5. gallery strip + booking
   2. services stage                 6. comparison slider, cursor
   3. videos play while visible      7. scroll-driven motion
   4. detail film chapters
   ========================================================================== */
(function () {
'use strict';
const DI = (window.DI = window.DI || {});
const { SERVICES, VEHICLE_TYPES, money } = DI;
const { gsap, ScrollTrigger } = window;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const root = document.documentElement;
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]rm\b/.test(location.search);
const fx = !rm && !!gsap && !!ScrollTrigger;
const mobile = matchMedia('(max-width: 900px)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
root.classList.toggle('fx', fx);
if (rm) root.classList.add('rm');
$('#year').textContent = new Date().getFullYear();

/* ---------- 1. navigation, chapter index, progress, dock ---------- */
const nav = $('#nav'), bar = $('#progressBar'), dock = $('#dock');
const light = $$('.lightsec:not([hidden])'), chapters = $$('[data-chapter]'), chLinks = $$('#chapters a'), topLinks = $$('.nav__links a');
let lastY = 0, ticking = false, activeCh = '';
function onScroll() {
  ticking = false;
  const y = scrollY, vh = innerHeight, max = root.scrollHeight - vh;
  nav.classList.toggle('is-solid', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > vh * 0.6 && !root.classList.contains('menu-open'));
  nav.classList.toggle('is-ink', light.some((s) => { const r = s.getBoundingClientRect(); return r.top <= 36 && r.bottom > 36; }));
  bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  const cur = chapters.find((s) => { const r = s.getBoundingClientRect(); return r.top <= vh / 2 && r.bottom > vh / 2; });
  if (cur && cur.dataset.chapter !== activeCh) {
    activeCh = cur.dataset.chapter;
    chLinks.forEach((a) => { const on = a.dataset.ch === activeCh; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    topLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur.id));
  }
  const book = $('#book').getBoundingClientRect();
  dock.classList.toggle('is-on', y > vh * 0.7 && (book.top > vh * 0.6 || book.bottom < 0) && $('#contact').getBoundingClientRect().top > vh);
  lastY = y;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

const toggle = $('#menuToggle'), menu = $('#menu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  root.classList.toggle('menu-open', open);
  root.style.overflow = open ? 'hidden' : '';
  if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); }
  else { menu.classList.remove('is-open'); setTimeout(() => { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 700); }
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); } });
matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setMenu(false));

/* ---------- 2. services stage (click, tap or arrow keys; never tied to scroll) ---------- */
const tabsEl = $('#svcTabs'), media = $('#svcMedia'), panel = $('#svcPanel'), stage = $('#services'), bigNo = $('#svcBigNo');
tabsEl.innerHTML = SERVICES.map((s, i) => `<button class="svc__tab" role="tab" id="svc-tab-${i}" aria-controls="svcPanel" aria-selected="false" tabindex="-1" data-i="${i}"><small>${s.no}</small><b>${s.short}</b></button>`).join('');
media.innerHTML = SERVICES.map((s) => `<video muted loop playsinline preload="none" poster="assets/video/${s.video}-poster.webp" data-src="assets/video/${s.video}.mp4" aria-label="${s.footage}"${rm ? ' controls' : ''}></video>`).join('') + '<span class="svc__cap" id="svcCap"></span>';
const tabs = $$('.svc__tab', tabsEl), vids = $$('video', media), cap = $('#svcCap');
let svcIndex = -1, svcInView = false;
function setService(i, instant) {
  if (i === svcIndex) return;
  const prev = svcIndex, dir = i > prev ? 1 : -1, s = SERVICES[i];
  svcIndex = i;
  tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
  stage.style.setProperty('--tint', s.tint);
  bigNo.textContent = s.no;
  cap.textContent = `Detailers Inc. footage — ${s.footage}`;
  const v = vids[i], old = vids[prev];
  if (!v.src) v.src = v.dataset.src;
  vids.forEach((x) => { x.style.zIndex = x === v ? 2 : x === old ? 1 : 0; });
  v.classList.add('is-active');
  if (fx && !instant && old) {
    gsap.fromTo(v, { clipPath: dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9, ease: 'expo.out', overwrite: true,
      onComplete() { if (svcIndex === i) { old.pause(); old.classList.remove('is-active'); } } });
  } else vids.forEach((x) => { if (x !== v) { x.pause(); x.classList.remove('is-active'); } });
  if (svcInView && !rm) v.play().catch(() => {});
  const from = Math.min(...s.packages.map((p) => p.prices.sedan));
  panel.setAttribute('aria-labelledby', `svc-tab-${i}`);
  panel.innerHTML = `<div class="svc__info">
    <h3>${s.name}</h3>
    <p>${s.desc}</p>
    <ul class="svc__inc" aria-label="Includes">${s.includes.map((x) => `<li>${x}</li>`).join('')}</ul>
    <table class="pk">
      <thead><tr><th scope="col">Package</th>${VEHICLE_TYPES.map((t) => `<th scope="col">${t.label}</th>`).join('')}</tr></thead>
      <tbody>${s.packages.map((p) => `<tr><td>${p.name}<small>${p.duration}</small></td>${VEHICLE_TYPES.map((t) => `<td>${money(p.prices[t.id])}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <p class="svc__fine">From ${money(from)}. Final price is confirmed when we reply to your booking request.</p>
    <a class="btn btn--blue" href="#book" data-book="${s.id}"><span>Book ${s.short.toLowerCase()}</span></a>
  </div>`;
  if (fx && !instant) {
    gsap.fromTo($$('.svc__info > *', panel), { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out' });
    gsap.fromTo(bigNo, { opacity: 0, x: 40 * dir }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
  }
  if (mobile && !instant) tabs[i].scrollIntoView({ inline: 'center', block: 'nearest' });
}
tabsEl.addEventListener('click', (e) => { const t = e.target.closest('.svc__tab'); if (t) setService(+t.dataset.i); });
tabsEl.addEventListener('keydown', (e) => {
  const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  if (!(e.key in map) && e.key !== 'Home' && e.key !== 'End') return;
  e.preventDefault();
  const n = e.key === 'Home' ? 0 : e.key === 'End' ? SERVICES.length - 1 : (svcIndex + map[e.key] + SERVICES.length) % SERVICES.length;
  setService(n); tabs[n].focus({ preventScroll: true });
});
media.addEventListener('click', () => { const v = vids[svcIndex]; if (v) v.paused ? v.play().catch(() => {}) : v.pause(); });
new IntersectionObserver((es) => {
  svcInView = es[0].isIntersecting; const v = vids[svcIndex]; if (!v) return;
  svcInView && !rm ? v.play().catch(() => {}) : v.pause();
}, { threshold: 0.2 }).observe(media);
setService(0, true);

/* ---------- 3. videos play only while on screen ---------- */
$$('video[data-autoplay]').forEach((v) => {
  if (rm) { v.controls = true; return; }
  new IntersectionObserver((es) => { if (es[0].isIntersecting) { if (v.dataset.userPaused !== '1') v.play().catch(() => {}); } else v.pause(); }, { threshold: 0.2 }).observe(v);
});
const hero = $('#heroVideo');
if (rm) { hero.removeAttribute('autoplay'); hero.pause(); }
else new IntersectionObserver((es) => (es[0].isIntersecting ? hero.play().catch(() => {}) : hero.pause()), { threshold: 0.05 }).observe(hero);

/* ---------- 4. detail film: chapter buttons follow and control the video ---------- */
const film = $('#filmVideo'), steps = $$('#filmSteps button'), filmBar = $('#filmBar'), filmToggle = $('#filmToggle');
const times = steps.map((b) => +b.dataset.t);
let activeStep = -1;
function syncFilm() {
  const t = film.currentTime; let i = 0;
  times.forEach((x, k) => { if (t >= x - 0.05) i = k; });
  if (i !== activeStep) { activeStep = i; steps.forEach((b, k) => { b.classList.toggle('is-active', k === i); k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); }); }
  if (film.duration) filmBar.style.transform = `scaleX(${t / film.duration})`;
}
film.addEventListener('timeupdate', syncFilm);
steps.forEach((b) => b.addEventListener('click', () => {
  const go = () => { film.currentTime = +b.dataset.t + 0.02; film.dataset.userPaused = ''; film.play().catch(() => {}); syncFilm(); };
  film.readyState >= 1 ? go() : (film.addEventListener('loadedmetadata', go, { once: true }), film.load());
}));
filmToggle.addEventListener('click', () => { if (film.paused) { film.dataset.userPaused = ''; film.play().catch(() => {}); } else { film.dataset.userPaused = '1'; film.pause(); } });
const filmLabel = () => { filmToggle.textContent = film.paused ? 'Play' : 'Pause'; filmToggle.setAttribute('aria-pressed', String(film.paused)); };
film.addEventListener('play', filmLabel); film.addEventListener('pause', filmLabel); filmLabel();
syncFilm();

/* ---------- 5. gallery strip + booking ---------- */
DI.buildGallery({ stopScroll() { root.style.overflow = 'hidden'; }, startScroll() { root.style.overflow = ''; } });
const vp = $('#galViewport');
const stepBy = (d) => vp.scrollBy({ left: d * vp.clientWidth * 0.7, behavior: rm ? 'auto' : 'smooth' });
$('#galPrev').addEventListener('click', () => stepBy(-1));
$('#galNext').addEventListener('click', () => stepBy(1));
vp.addEventListener('keydown', (e) => { if (e.target === vp && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); stepBy(e.key === 'ArrowRight' ? 1 : -1); } });
// mouse drag-to-scroll (touch already swipes natively); a drag does not open the viewer
let dragX = null, dragStart = 0, dragged = false;
vp.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; dragX = e.clientX; dragStart = vp.scrollLeft; dragged = false; });
addEventListener('pointermove', (e) => { if (dragX === null) return; const d = e.clientX - dragX; if (Math.abs(d) > 6) { dragged = true; vp.classList.add('is-drag'); } if (dragged) vp.scrollLeft = dragStart - d; });
addEventListener('pointerup', () => { dragX = null; vp.classList.remove('is-drag'); });
vp.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);

const booking = DI.booking();
document.addEventListener('click', (e) => { const a = e.target.closest('[data-book]'); if (a) booking.selectService(a.dataset.book); });
const q = (new URLSearchParams(location.search).get('service') || '').toLowerCase();
if (q) { const m = SERVICES.find((s) => s.id === q || s.name.toLowerCase() === q) || SERVICES.find((s) => q.includes(s.short.toLowerCase().split(' ')[0])); if (m) booking.selectService(m.id); }

/* ---------- 6. comparison slider + cursor ---------- */
const cmp = $('#compare'), handle = $('#compareHandle');
let cmpTouched = false;
function setCmp(p) {
  p = Math.min(100, Math.max(0, p));
  cmp.style.setProperty('--pos', p + '%');
  handle.setAttribute('aria-valuenow', String(Math.round(p)));
  handle.setAttribute('aria-valuetext', `${Math.round(p)}% snow foam stage, ${100 - Math.round(p)}% finished`);
}
const cmpFrom = (e) => { const r = cmp.getBoundingClientRect(); setCmp(((e.clientX - r.left) / r.width) * 100); };
let cmpDrag = false;
cmp.addEventListener('pointerdown', (e) => { cmpDrag = true; cmpTouched = true; cmp.setPointerCapture(e.pointerId); cmpFrom(e); });
cmp.addEventListener('pointermove', (e) => { if (cmpDrag) cmpFrom(e); });
cmp.addEventListener('pointerup', () => { cmpDrag = false; }); cmp.addEventListener('pointercancel', () => { cmpDrag = false; });
handle.addEventListener('keydown', (e) => {
  const now = +handle.getAttribute('aria-valuenow'), step = e.shiftKey ? 10 : 4;
  const map = { ArrowLeft: now - step, ArrowRight: now + step, Home: 0, End: 100 };
  if (e.key in map) { cmpTouched = true; setCmp(map[e.key]); e.preventDefault(); }
});
setCmp(50);

if (finePointer && !rm) {
  const dot = $('#cursor'); let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0;
  const loop = () => { cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25; dot.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : 0; };
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; dot.classList.add('is-on'); if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
  addEventListener('pointerover', (e) => dot.classList.toggle('is-link', !!e.target.closest('a, button, summary, label, [role="slider"], .svc__media')), { passive: true });
  root.addEventListener('pointerleave', () => dot.classList.remove('is-on'));
}

/* in-page links: move keyboard focus to the section as well as scrolling */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
  if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
  setTimeout(() => t.focus({ preventScroll: true }), 0);
});

/* ---------- 7. scroll-driven motion ---------- */
if (fx) {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const SCRUB = 0.5;                                    // eases the transforms; the page scroll itself is untouched
  const on = (trigger, start, end, extra) => ({ trigger, start, end, scrub: SCRUB, ...extra });

  // split text (the accessible name stays on the parent)
  $$('[data-chars]').forEach((el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="wd">${[...w].map((ch) => `<span class="ch">${ch}</span>`).join('')}</span>`).join(' '); });
  $$('[data-words]').forEach((el) => { const t = el.textContent.trim(); el.setAttribute('aria-label', t); el.innerHTML = t.split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><i>${w}</i></span>`).join(' '); });
  $$('[data-fill]').forEach((el) => { const t = el.textContent.trim(); el.setAttribute('aria-label', t); el.innerHTML = t.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' '); });

  // 01 hero: intro once, then the film drifts back and the title tracks out as you leave
  gsap.to('.hero__title .ch', { y: 0, duration: 1.3, stagger: 0.022, ease: 'expo.out', delay: 0.15 });
  gsap.to('[data-intro]', { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'expo.out', delay: 0.7 });
  gsap.to('#heroBg', { yPercent: 12, scale: 1.14, ease: 'none', scrollTrigger: on('#top', 'top top', 'bottom top') });
  gsap.to('#heroInner', { yPercent: -30, autoAlpha: 0, ease: 'none', scrollTrigger: on('#top', 'top top', '70% top') });
  gsap.to('.hero__title [data-chars]', { letterSpacing: '.07em', ease: 'none', scrollTrigger: on('#top', 'top top', '70% top') });
  gsap.to('.hero__light', { opacity: 0.85, ease: 'none', scrollTrigger: on('#top', 'top top', 'bottom top') });
  gsap.to('.hero__meta', { autoAlpha: 0, ease: 'none', scrollTrigger: on('#top', 'top top', '20% top') });


  // 02 cinematic Detailers Inc. film: scrub the exact Porsche sequence with page scroll.
  const craft = $('#craft');
  if (craft) {
    const craftVideo = $('#craftScrollVideo');
    const craftSteps = $$('[data-craft-step]', craft);
    const craftCount = $('#craftCount');
    const craftPhaseNo = $('#craftPhaseNo');
    const craftPhaseName = $('#craftPhaseName');
    const craftProgress = $('#craftProgressFill');
    const craftStamp = $('#craftStamp');
    const craftClosing = $('#craftClosing');
    const stepRanges = [
      { end: 2.8, label: 'THE REVEAL' },
      { end: 5.1, label: 'THE DETAIL' },
      { end: 8.9, label: 'PAINT CORRECTION' },
      { end: 11.3, label: 'LIGHT & REFLECTION' },
      { end: Infinity, label: 'THE FINISH' }
    ];
    let craftActive = -1;
    let craftDuration = 16.433;
    if (craftVideo) {
      craftVideo.pause();
      craftVideo.controls = rm || !fx;
      craftVideo.addEventListener('loadedmetadata', () => {
        if (Number.isFinite(craftVideo.duration) && craftVideo.duration > 0) craftDuration = craftVideo.duration;
        if (craftVideo.dataset.pendingTime) {
          craftVideo.currentTime = Math.min(craftDuration - .04, Number(craftVideo.dataset.pendingTime));
          delete craftVideo.dataset.pendingTime;
        }
        if (fx) ScrollTrigger.refresh();
      }, { once: true });
    }

    if (fx && craftVideo) {
      // Hold the end of the car film briefly, then blend into the Detailers Inc. service finish.
      const VIDEO_END_PROGRESS = .92;
      const OUTRO_START = .88;
      const OUTRO_END = .99;
      const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
      // Ease the video toward the scroll position so scrubbing glides instead of jumping.
      let scrubTarget = 0, scrubCur = 0, scrubRun = false;
      const scrubStep = () => {
        if (craftVideo.seeking) { requestAnimationFrame(scrubStep); return; }
        const d = scrubTarget - scrubCur;
        if (Math.abs(d) < .008) { scrubCur = scrubTarget; craftVideo.currentTime = scrubCur; scrubRun = false; return; }
        scrubCur += d * .16;
        craftVideo.currentTime = scrubCur;
        requestAnimationFrame(scrubStep);
      };
      const scrubKick = () => { if (!scrubRun) { scrubRun = true; requestAnimationFrame(scrubStep); } };
      ScrollTrigger.create({
        trigger: craft,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate(self) {
          const pageProgress = self.progress;
          const videoProgress = clamp(pageProgress / VIDEO_END_PROGRESS);
          const targetTime = clamp(videoProgress * craftDuration, 0, craftDuration - .04);
          scrubTarget = targetTime;
          if (craftVideo.readyState >= 2) scrubKick();
          else craftVideo.dataset.pendingTime = String(targetTime);

          const activeIndex = stepRanges.findIndex((step) => targetTime < step.end);
          const next = activeIndex < 0 ? stepRanges.length - 1 : activeIndex;
          if (next !== craftActive) {
            craftActive = next;
            if (craftCount) craftCount.textContent = String(next + 1).padStart(2, '0');
            if (craftPhaseNo) craftPhaseNo.textContent = String(next + 1).padStart(2, '0');
            if (craftPhaseName) craftPhaseName.textContent = stepRanges[next].label;
            craftSteps.forEach((step, i) => step.classList.toggle('is-active', i === next));
          }

          if (craftProgress) craftProgress.style.transform = `scaleX(${pageProgress})`;
          if (craftStamp) craftStamp.style.opacity = clamp((targetTime - 13.55) / .45).toFixed(3);
          if (craftClosing) {
            const closeProgress = clamp((pageProgress - OUTRO_START) / (OUTRO_END - OUTRO_START));
            craftClosing.style.opacity = closeProgress.toFixed(3);
            craftClosing.style.visibility = closeProgress > .005 ? 'visible' : 'hidden';
            craftClosing.style.pointerEvents = closeProgress > .82 ? 'auto' : 'none';
            craftClosing.setAttribute('aria-hidden', String(closeProgress < .8));
          }
        }
      });
    } else if (craftVideo) {
      // Reduced-motion / no-GSAP fallback: an accessible, user-playable copy of the same film.
      craftVideo.controls = true;
      craftVideo.removeAttribute('autoplay');
      craftVideo.currentTime = 0;
      if (craftClosing) craftClosing.setAttribute('aria-hidden', 'true');
    }
  }

  // curtains: the curved edge flattens as the light section rises
  $$('.curtain').forEach((sec) => gsap.fromTo($('.curtain__edge', sec), { scaleY: 1 }, { scaleY: 0, ease: 'none', scrollTrigger: on(sec, 'top bottom', 'top 25%') }));

  // editorial headings: words rise out of their masks with the scroll
  $$('[data-words]').forEach((h) => gsap.fromTo($$('.w > i', h), { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, stagger: 0.08, ease: 'power3.out', scrollTrigger: on(h, 'top 94%', 'top 58%') }));
  $$('h2').filter((h) => $('.m', h)).forEach((h) => gsap.fromTo($$('.m > i', h), { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, stagger: 0.12, ease: 'power3.out', scrollTrigger: on(h, 'top 96%', 'top 72%') }));

  // Original Full HD footage: reveal the copy and portrait video as the section enters.
  gsap.fromTo('.real-film__copy > *', { y: 34, opacity: 0 }, {
    y: 0, opacity: 1, stagger: 0.08, ease: 'power2.out',
    scrollTrigger: on('#real-footage', 'top 78%', 'top 38%')
  });
  gsap.fromTo('.real-film__media', { y: 60, opacity: 0, scale: .97 }, {
    y: 0, opacity: 1, scale: 1, ease: 'none',
    scrollTrigger: on('#real-footage', 'top 88%', 'top 30%')
  });

  // 03 story: the paragraph inks in; images wipe open and drift inside their frames
  const p = $('.story__p'), words = $$('.w', p);
  ScrollTrigger.create({ trigger: p, start: 'top 85%', end: 'bottom 50%', scrub: true, onUpdate(self) { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle('is-on', i < n)); } });
  $$('[data-reveal]').forEach((m) => {
    gsap.to(m, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: on(m, 'top 92%', 'top 45%') });
    gsap.fromTo($('img', m), { yPercent: -14 }, { yPercent: 0, ease: 'none', scrollTrigger: on(m, 'top bottom', 'bottom top') });
  });
  $$('.row__text').forEach((t) => gsap.fromTo(t.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: on(t, 'top 90%', 'top 60%') }));

  // 04 angles: a framed film on paper opens to full screen as it arrives
  gsap.to('#anglesStage', { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: on('#angles', 'top 85%', 'top top') });
  gsap.fromTo('#angles', { backgroundColor: '#f1f0ec' }, { backgroundColor: '#000000', ease: 'none', scrollTrigger: on('#angles', 'top 60%', 'top top') });
  gsap.fromTo('#anglesVideo', { yPercent: -4, scale: 1.1 }, { yPercent: 4, scale: 1, ease: 'none', scrollTrigger: on('#angles', 'top bottom', 'bottom top') });
  gsap.fromTo('.angles__list li', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, ease: 'power2.out', scrollTrigger: on('#angles', 'top 40%', 'top top') });

  // 05 film: the gate turns in space and the title word travels behind it
  if (!mobile) gsap.fromTo('#filmGate', { rotationY: 14, rotationX: 5, y: 60 }, { rotationY: -10, rotationX: -3, y: -60, ease: 'none', scrollTrigger: on('#film', 'top bottom', 'bottom top') });
  gsap.fromTo('#filmWord', { x: () => innerWidth * 0.35 }, { x: () => -($('#filmWord').offsetWidth - innerWidth * 0.5), ease: 'none', scrollTrigger: on('#film', 'top bottom', 'bottom top', { invalidateOnRefresh: true }) });
  gsap.fromTo('#filmSteps button', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.05, ease: 'power2.out', scrollTrigger: on('#filmSteps', 'top 92%', 'top 55%') });

  // 06 services + 07 result + 08 gallery + 10 contact
  gsap.fromTo('#svcBigNo', { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: on('#services', 'top bottom', 'bottom top') });
  gsap.fromTo('#svcMedia', { y: 70, scale: 0.92 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: on('#services', 'top 90%', 'top 30%') });
  ScrollTrigger.create({ trigger: '#compare', start: 'top 80%', end: 'bottom 35%', scrub: true, onUpdate(self) { if (!cmpTouched) setCmp(86 - self.progress * 72); } });
  gsap.fromTo('#compare', { y: 80 }, { y: -30, ease: 'none', scrollTrigger: on('#result', 'top bottom', 'bottom top') });
  gsap.fromTo('#galTrack', { x: () => innerWidth * 0.3 }, { x: 0, ease: 'none', scrollTrigger: on('#gallery', 'top bottom', 'top 20%', { invalidateOnRefresh: true }) });
  gsap.fromTo('#contactBg', { scale: 1.3, yPercent: -6 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: on('#contact', 'top bottom', 'bottom bottom') });
  gsap.fromTo(['.contact__copy p', '.contact__cta'], { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: on('.contact__copy', 'top 85%', 'top 60%') });

  addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  matchMedia('(max-width: 900px)').addEventListener('change', () => location.reload());
}
window.DI_BOOTED = true;
})();

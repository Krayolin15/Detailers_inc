/* ==========================================================================
   Gallery — a strip of short muted previews; clicking one opens the WHOLE
   video, with sound, in the full-screen viewer. Every video is Detailers
   Inc's own footage. Previews: assets/video/p-ID.mp4 (+ -poster.webp);
   full videos: assets/video/full-ID.mp4. Only the previews near the screen
   are loaded; a full video loads only when opened.
   ========================================================================== */
(function () {
'use strict';
const DI = (window.DI = window.DI || {});
const { gsap } = window;

const GALLERY = [
  { id: 'clubsport', w: 1276, h: 718, cap: 'Golf GTI Clubsport — the film', alt: 'A white Golf GTI Clubsport filmed on the road and up close.' },
  { id: 'redgolf', w: 720, h: 1280, cap: 'Red Golf GTI — full wash', alt: 'A red Golf GTI being foamed, washed and rinsed.' },
  { id: 'compilation', w: 1276, h: 718, cap: 'On-site washes — full session', alt: 'Team members washing several vehicles on site.' },
  { id: 'polish', w: 720, h: 1280, cap: 'Machine polishing — black paint', alt: 'A detailer machine-polishing the panels of a black vehicle.' },
  { id: 'detail', w: 720, h: 1280, cap: 'Golf GTI — interior and exterior detail', alt: 'A white Golf GTI being cleaned outside and steamed and detailed inside.' },
  { id: 'bmw', w: 480, h: 854, cap: 'BMW 4 Series — full wash', alt: 'A dark blue BMW 4 Series being washed and rinsed.' },
  { id: 'whitegolf', w: 720, h: 1280, cap: 'White Golf — wash on site', alt: 'A team member washing a white Golf outside a workshop.' },
  { id: 'suv', w: 480, h: 854, cap: 'SUV foam wash and hand finish', alt: 'A grey SUV covered in foam, then dried by hand.' },
  { id: 'fleet', w: 720, h: 1280, cap: 'Vehicles washed on site', alt: 'A row of vehicles in a car park being washed.' },
  { id: 'foam', w: 720, h: 1280, cap: 'Snow foam to finish', alt: 'A Golf covered in snow foam, then clean.' },
  { id: 'team', w: 720, h: 1280, cap: 'On site with the team', alt: 'A Detailers Inc. team member talking to camera, then washing vehicles.' }
];

function buildGallery({ stopScroll, startScroll }) {
  const track = document.getElementById('galTrack');
  track.innerHTML = GALLERY.map((g, i) => `
    <li class="gal__item" style="--ar:${g.w}/${g.h}">
      <figure>
        <button type="button" data-i="${i}" aria-label="Open video: ${g.cap}">
          <video muted loop playsinline preload="none" width="${g.w}" height="${g.h}" poster="assets/video/p-${g.id}-poster.webp" data-src="assets/video/p-${g.id}.mp4" aria-label="${g.alt}"></video>
        </button>
        <figcaption><b>${String(i + 1).padStart(2, '0')}</b>${g.cap}</figcaption>
      </figure>
    </li>`).join('');

  /* clips load when they come near the screen and play only while mostly visible */
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clips = [...track.querySelectorAll('video')];
  if ('IntersectionObserver' in window) {
    const near = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !v.getAttribute('src')) v.src = v.dataset.src;
    }), { rootMargin: '300px 200px' });
    const seen = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (still) return;
      if (e.isIntersecting && !document.getElementById('lightbox').open) { if (!v.getAttribute('src')) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    }), { threshold: 0.5 });
    clips.forEach((v) => { near.observe(v); seen.observe(v); });
  }

  const dlg = document.getElementById('lightbox'), img = document.getElementById('lbVid'), cap = document.getElementById('lbCap');
  let idx = 0, opener = null;

  const show = (i, dir = 0) => {
    idx = (i + GALLERY.length) % GALLERY.length;
    const g = GALLERY[idx];
    const swap = () => {
      img.poster = `assets/video/p-${g.id}-poster.webp`; img.src = `assets/video/full-${g.id}.mp4`; img.setAttribute('aria-label', g.alt); img.width = g.w; img.height = g.h; img.muted = false; img.play().catch(() => {});
      cap.textContent = `${String(idx + 1).padStart(2, '0')} / ${GALLERY.length} — ${g.cap}`;
      if (gsap && dir) gsap.fromTo(img, { xPercent: dir * 8, opacity: 0, clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { xPercent: 0, opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.6, ease: 'power3.out' });
    };
    if (gsap && dir) gsap.to(img, { xPercent: -dir * 6, opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: swap }); else swap();
  };
  const open = (i, btn) => {
    opener = btn; show(i);
    dlg.showModal(); stopScroll();
    if (gsap) {
      const r = btn.getBoundingClientRect();
      gsap.fromTo(dlg, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(img, { scale: 0.7, x: r.left + r.width / 2 - innerWidth / 2, y: r.top + r.height / 2 - innerHeight / 2, opacity: 0 }, { scale: 1, x: 0, y: 0, opacity: 1, duration: 0.7, ease: 'expo.out' });
    }
  };
  const close = () => {
    const done = () => { img.pause(); dlg.close(); };
    if (gsap) gsap.to(dlg, { opacity: 0, duration: 0.25, onComplete: done }); else done();
  };
  dlg.addEventListener('close', () => { img.removeAttribute('src'); img.load(); startScroll(); if (opener) opener.focus(); });
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });           // Esc
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.tagName === 'FIGURE') close(); });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(idx - 1, -1));
  document.getElementById('lbNext').addEventListener('click', () => show(idx + 1, 1));
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(idx + 1, 1); if (e.key === 'ArrowLeft') show(idx - 1, -1); });
  // swipe
  let sx = null;
  dlg.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  dlg.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); sx = null; }, { passive: true });

  track.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) open(+b.dataset.i, b); });

}

Object.assign(DI, { GALLERY, buildGallery });
})();

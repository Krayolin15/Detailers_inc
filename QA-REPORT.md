# QA report — 14 Nov 2026 (fourth build: cinematic, no pinning, 1080p media)

Tested in headless Google Chrome via Playwright, opened from disk (`file://`) and over HTTP.
"Mobile" means Chrome's phone emulation with touch, not a physical phone.

## Passed

- **Scroll never sticks.** A mouse wheel was stepped from top to bottom (31 steps over 9,644px):
  every step moved the page by the full amount. No sticky or pinned elements exist.
- Hero video is 1920px wide and plays. Detail film and service clips are 1080x1920. Stills are 1080p.
- Opens by double-click; fonts load from disk.
- Services stage: click, touch and arrow keys; full price table (all packages x three sizes);
  "Book" pre-selects the service in the form.
- Detail film chapter buttons seek the video (tested from disk).
- Gallery: arrows move the strip; viewer opens; Esc closes. Comparison slider: keyboard and drag.
- Booking: POSTs the correct row to the backend (simulated), confirmation shown.
- Mobile: menu, service tabs, no horizontal overflow, all buttons at least 44px tall.
- Reduced motion: all text visible, nothing clipped or hidden.
- No script errors.

## Fixed after the test run, not re-run

- The final headline ("deserves this.") had not finished revealing 400px before the end of the
  page. Its reveal now completes earlier. A mobile headline that overflowed was made smaller.

## Not verified

- **Live database.** The Supabase project was hibernated and unreachable, so the table does not
  exist yet and no real booking has been saved end to end. `staff.html` is untested for the same reason.
- Real phones, Safari, Firefox. Only Chrome was used.
- Frame rate on low-end phones, and loading time on mobile data (about 90 MB of video in total,
  loaded section by section).
- The film chapter buttons do not work on Python's local test server (it cannot seek video).

---

## Responsive update — 15 Nov 2026

### Tested in Chromium / Playwright

- Responsive layout checked at **18 viewport sizes**, from **240 × 600** (ultra-narrow phone) through **7680 × 4320** (8K display), including compact phones, common phone sizes, tablets, laptops, 1080p, ultrawide and 4K screens.
- The document's horizontal scroll width stayed within the viewport at every tested size. The gallery and service-tab rails remain intentionally horizontally scrollable inside their own sections.
- The hero call-to-action buttons remained above the following section's curved transition in the tested viewport matrix.
- Mobile navigation opened and closed; Escape closed the open menu.
- All four service tabs hydrated. The Ceramic Coating tab selected correctly and displayed its five package rows.
- The booking form advanced from step 1 to step 2. This checks the form's client-side step flow only; it does not submit a real booking.
- No JavaScript runtime errors were reported in the interaction harness. All four CSS files parsed without stylesheet syntax errors.

The responsive harness inlined the site's CSS and removed image/video source attributes while checking layout; this isolates the layout from network/media-loading issues. It is not a physical-device test, a video-playback test, or a cross-browser test. Safari, Firefox, real phones, TV browsers and low-powered devices still require device testing.

### Resolution audit of supplied video assets

The existing media files were preserved without recompression, replacement or artificial upscaling. The archive does **not** contain native 4K footage, and not every supplied gallery clip is HD. The primary clips include 1920 × 1080 and 1920 × 972 footage, while the service clips are 1080 × 1920. Some gallery masters are 720 × 1280 / 1276 × 718, and the BMW and SUV gallery masters are 480 × 854 (their short previews are 540 × 960). These lower-resolution originals can look softer on large 4K/8K panels. True HD/4K gallery quality requires higher-resolution source footage from the owner; upscaling the available files would not restore real detail.

### Booking and backend limitation

The booking flow creates a pre-written WhatsApp enquiry for the customer to send. It does not save bookings to a live database. This update does not change that existing behaviour or verify the live backend.

# QA addendum — 18 Nov 2026 (reference Porsche scroll film)

## Implemented

- Replaced the earlier five-still crossfade process with a pinned, scroll-scrubbed 16.43-second film.
- Isolated the laptop display from the newly supplied vertical phone recording so the exact car/action sequence is used without showing the laptop or room.
- Kept the reference choreography: dark reveal, headlight close-up, water on the paint, machine-polisher passes, moving reflections, side profile and the perfection headline.
- Covered the unrelated AXON marks with Detailers Inc. branding and rebuilt the clip's final product-page-style screen as a Detailers Inc. services finish.
- Added a reduced-motion / no-GSAP fallback with native video controls.

## Checks completed in this revision

- `node --check` passed for `js/site.js`.
- `index.html` parsed successfully.
- `style.css` and `responsive.css` parsed without CSS syntax errors.
- The new process video was probed as H.264, 1280 × 800, 30 fps, 16.43 seconds.
- All newly referenced local video, poster and image assets exist.

## Not verified in this revision

- The interactive scroll/seek experience was not browser-verified in this run; the local browser harness blocked navigation to the local preview server and file URL. The final website should be tested on its deployed static host, which must support HTTP byte-range requests for smooth video seeking.
- The phone recording captures the source laptop display at roughly 512 × 320. The 1280 × 800 process asset is an upscale of that screen crop, not native HD footage. The exact motion and car are retained, but the available source limits fine detail.
- Real mobile devices, Safari, Firefox, low-end-device frame rate and mobile-data load time still require testing.

---

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


## Third-section black BMW video repair — 18 Nov 2026

- The `#real-footage` section referenced `assets/video/detailers-inc-full-hd.mp4`, but that file was missing from the supplied website archive.
- Added the newly supplied video at that exact path. It is H.264/AAC, 1080 × 1920, 30 fps, and 59.58 seconds.
- Remuxed for progressive playback with `+faststart` using stream copy only. The decoded video-stream and audio-stream packet hashes match the uploaded source; no re-encoding or quality reduction was performed.
- Regenerated `detailers-inc-full-hd-poster.jpg` from the supplied clip and changed the video element to `preload="metadata"`. Native controls and inline playback remain enabled.
- `node --check js/site.js` passed, and the MP4 metadata, expected asset path and updated HTML reference were verified.
- A live browser/device playback test was not performed in this environment.
- **GitHub Pages limitation:** this source MP4 is about 109.6 MiB, larger than GitHub's 100 MiB ordinary Git file limit. Git LFS is not supported for GitHub Pages. See `INSTALL_FULL_HD_VIDEO.txt` for the deployment route that preserves the original video.

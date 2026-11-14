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

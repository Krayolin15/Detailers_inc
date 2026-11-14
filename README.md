# Detailers Inc. — website

The cinematic Detailers Inc. site (mobile car detailing, Mount Edgecombe, Durban): dark, film-led,
oversized type, scroll-driven motion. The page scrolls natively from top to bottom. Nothing is
pinned and there is no scroll-jacking: scroll position only drives parallax and reveals on things
that are already moving past.

Plain HTML, CSS and vanilla JavaScript. One animation library (GSAP + ScrollTrigger, bundled).

## Open it

Double-click `index.html`. It runs straight from disk.

To test the way it will run when hosted:

```bash
cd detailers-inc
python3 -m http.server 8000     # then open http://localhost:8000
```

(Python's test server cannot seek inside videos, so the film chapter buttons only work when the
page is opened from disk or on real hosting.)

## Deploy

Static site; `CNAME` (www.detailersinc.co.za) is included. Replace the contents of the GitHub Pages
repo with this folder, commit and push. The old root-level media (`car_wash.mp4`, `data_*.mp4`,
`hero-car.png`, `gallery-*.jpg`) is no longer referenced and can be deleted from the repo.

## Structure

```
index.html            the site: reveal, story, angles, film, services, result, gallery, booking, FAQ, contact
booking.html          redirect to index.html#book (old links keep working)
legacy/               the original booking page
css/fonts.css         fonts embedded as data URIs (so they load from disk too)
css/style.css         tokens, components, scenes
css/animations.css    pre-animation states, accordion, form steps, reduced-motion rules
css/responsive.css    tablet and phone layouts
js/data.js            ALL business data: backend, contacts, services, packages, prices, vehicle sizes
js/site.js            navigation, services stage, video playback, film chapters, gallery strip,
                      comparison slider, and all scroll-driven motion
js/gallery.js         gallery video clips + full-screen viewer
js/booking.js         4-step booking -> pre-written WhatsApp message
assets/video/         1080p masters: hero, detail film, Clubsport film, four service clips (+ posters)
assets/img/           1080p stills, posters, logo
assets/vendor/        GSAP 3.15 + ScrollTrigger
tools/                the scripts used to prepare the footage (reference)
```

## Video and image quality

Every video and still on the site is delivered at **1080p** (1920x1080 landscape, 1080x1920
portrait; the hero is 1920x972 because the corner watermark was cropped off).

Be aware of what that means: **all twelve files supplied are 720p** (1280x720 / 720x1280), which is
what Instagram and WhatsApp export. The 1080p masters are high-quality Lanczos upscales with light
sharpening, encoded at high bitrate (H.264 CRF 17-18) so nothing further is lost. They look cleaner
on large screens, but upscaling cannot add detail that was never recorded.

For true 1080p or 4K, export the films from the editing project or the camera at full resolution
and send those files (as documents or via Drive, not through WhatsApp). They drop straight into
`assets/video/` under the same names.

Total size is about 90 MB. Only the hero video (6 MB) loads up front; every other video loads when
it is scrolled to.

## Booking

The booking form has no backend. On the last step the customer presses **Send on WhatsApp** and
WhatsApp opens with a ready-written message (name, phone, email, vehicle, service, package, date,
time, location, notes, listed price, reference) addressed to the primary line (+27 84 877 2847).
The customer only has to press send. A second button offers the second line (+27 62 890 4914).
Numbers are set in `js/data.js`.

## Editing content

- **Prices, packages, phone numbers, hours, vehicle sizes:** `js/data.js`.
- **Gallery:** the `GALLERY` array in `js/gallery.js`. Each item has a short muted preview (`assets/video/p-ID.mp4` + `p-ID-poster.webp`) shown in the strip, and the whole video with sound (`assets/video/full-ID.mp4`) that opens in the viewer. To add one, drop in both files and add a line to the array.
- **Reviews:** `index.html` has a hidden `#reviews` section. Add real reviews and remove `hidden`.
- **FAQ:** plain `<details>` elements in `index.html`.

## Needs the owner

1. Customer reviews (none exist; the section is hidden).
2. Service area: only "mobile, based in Mount Edgecombe" is stated.
3. Confirm the prices (taken from the old booking page) are current.
4. Customer number plates and staff faces are visible in the footage: confirm consent.

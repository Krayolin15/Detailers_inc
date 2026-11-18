# Detailers Inc. — website

The cinematic Detailers Inc. site (mobile car detailing, Mount Edgecombe, Durban): dark, film-led,
oversized type, scroll-driven motion. The page scrolls natively from top to bottom; the cinematic
Detailers Inc. process chapter is the exception: it pins a full-screen stage and scrubs the reference
car film directly from scroll position. There is no wheel hijacking or forced smooth-scroll library.

Plain HTML, CSS and vanilla JavaScript. One animation library (GSAP + ScrollTrigger, bundled).

## Open it

Double-click `index.html`. It runs straight from disk.

To test the way it will run when hosted:

```bash
cd detailers-inc
python3 -m http.server 8000     # then open http://localhost:8000
```

The cinematic process chapter needs efficient video seeking (HTTP byte-range support). Some simple
development servers do not support that; verify the scroll scrub on the deployed static host.

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
js/site.js            navigation, services stage, video playback, scroll-scrubbed process film, gallery,
                      comparison slider, and all other scroll-driven motion
js/gallery.js         gallery video clips + full-screen viewer
js/booking.js         4-step booking -> pre-written WhatsApp message
assets/video/         original video masters, service clips and posters; includes the cropped reference Porsche film
assets/img/           1080p stills, posters, logo
assets/vendor/        GSAP 3.15 + ScrollTrigger
tools/                the scripts used to prepare the footage (reference)
```

## Video and image quality

Most supplied master footage is delivered at 1080p (1920x1080 landscape, 1080x1920 portrait;
the hero is 1920x972). Some gallery sources are lower-resolution and are preserved as supplied.

The reference Porsche process film is a special case: it is 1280 × 800, cropped from the supplied
phone recording of a laptop display. The visible screen source is approximately 512 × 320, so this
file is an upscale and does not contain native HD detail. It preserves the exact car movement and
shot order from the reference; higher-detail footage would require the original website/video export.

For true 1080p or 4K, export the films from the editing project or the camera at full resolution
and send those files (as documents or via Drive, not through WhatsApp). They drop straight into
`assets/video/` under the same names.

The reference Porsche process film is saved as a 1280 × 800 H.264 clip. It was extracted from the
supplied phone recording of a laptop display; the visible screen source is approximately 512 × 320,
so the delivered file is an upscale and does not contain native HD detail. The existing vehicle and
service footage remains unchanged. The process film is preloaded for reliable scroll seeking.

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

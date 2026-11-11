# Anwar & Shamna — Luxury Wedding Invitation

A self-contained, responsive wedding invitation website built with plain HTML, CSS and JavaScript. It has no build step, framework, package installation or external runtime dependency, so it can be opened locally and hosted almost anywhere.

## Run locally

1. Extract the ZIP file.
2. Open the `anwar-shamna-wedding` folder.
3. Double-click `index.html` to open it in a modern browser.

For a local web server (recommended for testing), open a terminal in this folder and run one of:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Personalise the invitation

Open `wedding-config.js` and edit the values:

```js
window.WEDDING_CONFIG = {
  groom: "Anwar",
  bride: "Shamna",
  dateLabel: "Sunday, January 10, 2027",
  ceremonyTime: "6:30 PM",
  venue: "Your venue name",
  address: "Your complete venue address",
  mapQuery: "Your venue name, Your city",
  eventDateISO: "2027-01-10T00:00:00+05:30"
};
```

The ceremony time, venue, address and map link are intentionally left unfilled. The Maps button becomes active when `mapQuery` is supplied. The countdown date is set to January 10, 2027 at midnight in India Standard Time; adjust `eventDateISO` only if your event start time or time zone is different.

## Replace the gallery artwork

The gallery images are local SVG placeholders in `assets/images/`:

- `gallery-01.svg` through `gallery-06.svg`
- `story-arch.svg`
- `hero.svg`

Replace a gallery SVG with your own photograph (JPG, PNG or WebP) and update the corresponding `src` and `data-full` values in `index.html`. Keep `src` and `data-full` pointing to the same file so the lightbox opens the full-size image. For best performance, use WebP or compressed JPEG images around 1600px on the long edge.

## RSVP integration

The RSVP form is deliberately a front-end demo. It validates the fields and displays a confirmation state, but it does **not** send, save or transmit guest information. To collect real replies, connect it to a trusted form provider or your own backend. In `script.js`, replace the demo submit handler with your service's documented submission flow and only display a successful submission after the service confirms it.

## Interactions included

- Envelope opening intro and replay button
- Responsive navigation and smooth anchor scrolling
- Live countdown to the event
- Scroll reveal and subtle hero parallax
- Ambient sound toggle (generated locally with Web Audio; no audio file or network request)
- Accessible gallery lightbox with previous/next, Escape and arrow-key support
- RSVP demo form with explicit non-delivery notice
- Add-to-calendar `.ics` download
- Google Maps link activation after venue details are configured
- Back-to-top control and reduced-motion support

## Project structure

```text
anwar-shamna-wedding/
├── index.html
├── styles.css
├── script.js
├── wedding-config.js
├── README.md
└── assets/
    ├── favicon.svg
    └── images/
        ├── hero.svg
        ├── story-arch.svg
        └── gallery-01.svg ... gallery-06.svg
```

## Hosting

Upload the contents of this folder to any static web host (for example, GitHub Pages, Netlify or Cloudflare Pages). No server-side runtime is required unless you later connect RSVP collection.

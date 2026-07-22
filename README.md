# Meadow Putt

A responsive single-hole browser mini-golf game built with vanilla HTML, CSS, JavaScript, Matter.js, and canvas-confetti.

## Play locally

Open `index.html` in a browser, or serve the repository with any static file server. Internet access is currently required for the pinned CDN libraries.

## Controls

- Start on the glowing ball, drag backward, and release to putt.
- Longer drags create stronger shots.
- Use the recover button to return to the previous shot position with a one-stroke penalty.
- Keyboard: `R` restarts, `H` toggles help, and `M` toggles sound.

## Deploy

The repository is ready for static hosting. For Cloudflare Pages, use no build command and set the output directory to `/`.

## Structure

- `index.html`: game UI and CDN dependencies
- `styles.css`: responsive interface styling
- `js/setup.js`: tuning, state, physics world, and terrain setup
- `js/physics.js`: pointer controls, rolling physics, cup logic, and resets
- `js/ui.js`: sound, scoring, confetti, shortcuts, and responsive canvas setup
- `js/render.js`: custom canvas renderer
- `js/main.js`: fixed-step animation loop and startup

The original all-in-one prototype remains in `mini-golf-first-hole.html` as a fallback while the modular version is tested.

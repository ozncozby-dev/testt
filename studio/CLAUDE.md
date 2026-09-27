# Motion Studio — House Rules

This folder is a motion design studio operated by Claude. Every video is an HTML page whose
frames come from a pure function `seek(t)`. It is rendered frame by frame to mp4, and **Claude
looks at its own frames before calling anything done.**

Default failure mode we are designing against: *centred text on a gradient, everything fading
in, a logo at the end.* That happens when there is no reference, no render engine, and no look
at the output. This studio has all three. Use them.

## The loop (always, in this order)

1. **Brief.** `npm run new -- <name>` then fill in `scenes/<name>/brief.md` completely: purpose,
   format, references, look, motion language, beat sheet, exact copy, acceptance criteria.
   Do not write scene code until the brief has a beat sheet with times. If the user gave
   only a one-line idea, draft the brief yourself and show it to them before building.
2. **References.** Put reference stills or videos in `references/<name>/`. For each one, say
   what to take from it and what to ignore. When there is no reference, name a concrete style
   (a studio, a title sequence, a brand) instead of adjectives.
3. **Build.** `scenes/<name>/scene.js`: `setup(root)` builds the DOM once; `seek(t)` sets every
   animated property from `t`. Mirror the beat sheet as a `T = {...}` object at the top.
4. **Verify.** `npm run verify -- <name>`. Must pass before any critique. It proves
   determinism and order independence and scans for forbidden APIs.
5. **Look.** `npm run critique -- <name>` renders stills and `sheet.png` into
   `critique/<name>/round-N/`. **Open sheet.png (and any stills you need) with the Read tool.**
   Fill in `critique.md` honestly: scores, problems with frame numbers, and exact fixes. Use
   `--at 1.2,1.3,1.4` to inspect a specific moment.
6. **Fix.** Apply the 1–3 changes listed under "Next round". Keep the brief's beat sheet in sync.
   Go back to 4. **Max 3 full rounds**, then ship, or tell the user what is blocking.
7. **Render.** `npm run render:draft -- <name>` for review, `npm run render -- <name>` for the
   master (`--scale 2` gives 4K from a 1080p scene).

Never report a scene as done without at least one critique round whose `critique.md` you
actually wrote after viewing the sheet.

## seek(t) contract — hard rules

- `seek(t)` is a **pure function of t** (seconds). Same t → same pixels, in any order.
- Set **every** animated property on every call. Don't write "only if changed" logic, don't
  use accumulators, and don't let one frame's result depend on the previous frame.
- Forbidden in scene code (verify fails on them): `Math.random`, `Date`, `performance.now`,
  `requestAnimationFrame`, `setTimeout`/`setInterval`, `element.animate`, CSS
  `transition`/`@keyframes`. Use `rng(seed)` and `noise1(x, seed)` from `motion.js`.
- No network assets at render time. Fonts and images go in `assets/` and load locally.
- Video and audio elements are not seekable deterministically. Pre-render them to image
  sequences, or leave them to the ffmpeg mux step.

## Motion rules

- **Springs are closed-form** (`spring`, `springByFeel`, `springAt` in `lib/motion.js`). Never
  integrate physics frame by frame.
- Use the **named presets** in `springs` (`snap`, `settle`, `pop`, `heavy`). Invent new numbers
  only with a reason, and add the result as a named preset.
- Easing by intent: `ease.out` to arrive, `ease.in` to leave, `ease.inOut` for moves that start
  and end at rest. `linear` only for continuous motion (tickers, rotation).
- **Type enters through masks** (outer `overflow:hidden`, inner translates). Opacity fades on
  type are allowed only if the brief explicitly asks for them.
- Stagger with `stagger(i, start, each)`. 40–120 ms between siblings. More than that reads as slow.
- At most one `pop` (visible bounce) per scene. Everything that moves needs a reason.
- No dead holds longer than 1.2 s unless the brief calls for a hold. The last frame holds
  ≥ 0.5 s and must work as a thumbnail.

## Raster rules (learned from verify failures)

- **Animate geometry, not scale, for hard edges** (lines, bars, rules): set `width`/`height`/
  `left`. Chrome antialiases a scaled edge differently depending on raster history, which
  breaks determinism.
- **No `will-change`.** Promoted layers keep their old raster scale between seeks.
- `scale()` is fine on soft or organic content, but run verify afterwards.

## Composition rules

- Start from a grid (margins, columns). Content is **not** centred by default. Decide where
  the visual weight sits and write it in the brief.
- Max 4 colours plus neutrals, all defined once at the top of the scene as `C = {...}`.
- Minimum text size on a 1080p frame: 24 px for anything the viewer must read. Check the
  contact sheet: if it is unreadable there, it is unreadable on a phone.
- Title safe area: 5 % of the frame. Leave room for platform UI on 9:16 (bottom 20 %).

## Files

```
lib/motion.js      pure motion primitives (springs, easing, tracks, rng, colour)
lib/stage.js       mounts a scene, exposes window.__stage.seek / seekFrame, preview transport
lib/base.css       fonts, kills CSS animation inside #stage
tools/             new-scene · verify · critique · render · preview
scenes/<name>/     index.html · scene.js · brief.md
references/<name>/ reference material for the brief
critique/<name>/   round-N/{sheet.png, critique.md}; the review record, committed
out/               rendered mp4s (git-ignored)
```

## Commands

```bash
npm install                          # playwright + a bundled ffmpeg (libx264)
npm test                             # spring maths vs numerical integration
npm run new -- <name>                # scaffold a scene + brief
npm run preview                      # live preview at http://127.0.0.1:5173/scenes/<name>/
npm run verify -- <name>             # seek(t) contract check
npm run critique -- <name> [--every 0.5 | --at 1.2,3.4]
npm run render:draft -- <name>       # half-res review render
npm run render -- <name> [--scale 2] [--from s --to s] [--debug]
```

Environment overrides: `CHROMIUM_PATH` (browser binary), `FFMPEG_PATH` (ffmpeg binary).

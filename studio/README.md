# seek(t) Motion Studio

A code-driven motion design pipeline built to be operated by Claude Code:
**brief → build → verify → look at the frames → fix → render.**

Each video is a plain HTML page whose frames come from a pure `seek(t)` function. A headless
Chromium seeks each frame and screenshots it, and ffmpeg encodes the result to H.264.
Because every frame is a pure function of time, renders are deterministic, can start at any
frame and can be parallelised. The studio can prove this: `npm run verify`.

```bash
cd studio
npm install
npm test                        # closed-form springs match numerical integration
npm run verify -- test-card     # determinism + order-independence
npm run critique -- test-card   # stills + contact sheet for review
npm run render -- test-card     # → out/test-card.mp4 (1920×1080, 30 fps, 6 s)
```

See **[CLAUDE.md](CLAUDE.md)** for the house rules: the loop, the seek(t) contract, and the
motion, raster and composition rules. See `scenes/test-card/brief.md` for an example director's
brief and `critique/test-card/` for a worked three-round critique record.

## Why not Remotion?
Remotion is also seek-based and a solid choice. This studio is framework-free on purpose:
a scene is one HTML file plus one JS module, with nothing to compile. Claude can write, read
and debug a scene in full, and any web technique (SVG, Canvas, WebGL, CSS) works inside `seek(t)`.

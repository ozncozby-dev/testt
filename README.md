# LUXURY PRIME — Primera Cookware Collection · Brand Film

This is a 35-second premium product film built with Remotion, React and TypeScript.
It is mastered at **3840×2160 / 30 fps / 16:9**.

> Creative direction, asset audit, scene plan and transition logic: **[docs/CREATIVE_PLAN.md](docs/CREATIVE_PLAN.md)**

## Quick start

```bash
npm install
npm run studio          # live preview (also generates the temp soundtrack)
npm run render          # 4K master  -> out/luxury-prime-primera-4k.mp4
npm run render:1080     # review copy -> out/luxury-prime-primera-1080p.mp4
npm run stills          # review stills of key frames -> out/stills/
npm run cues            # print the sound-design cue sheet
```

In sandboxed/offline environments, point Remotion at a local headless shell:
`REMOTION_BROWSER_EXECUTABLE=/path/to/headless_shell npm run render`.
Fonts are self-hosted, so rendering needs no network.

## Replacing stand-ins with real Luxury Prime assets

Nothing in the code needs to change. Drop files into `public/` with these names:

| Slot | Path |
|---|---|
| Logo | `public/assets/brand/logo.svg` (or `.png`) |
| Side cut-outs | `public/assets/pieces/side/<piece>-<finish>.png`, optional lid: `<piece>-lid-<finish>.png` |
| Top cut-outs | `public/assets/pieces/top/<piece>-<finish>.png` |
| Macro plates | `public/assets/plates/macro-{lid,handle,interior,base}.jpg` |
| Kitchen plate | `public/assets/plates/kitchen.jpg` |
| Score | `public/audio/soundtrack.wav` (or `.mp3`); overrides the generated temp track |

Pieces are `stockpot28 · casserole24 · saucepan18 · frypan24 · frypan28 · saute26`.
Finishes are `onyx · sage · granite · ivory`. Both are placeholders; edit them in
`src/components/cookware/pieces.ts` and `src/config/brand.ts`.

## Project structure

```
src/
  config/
    timeline.ts        ← single source of truth: scene lengths, transitions (+ portal geometry)
    choreography.ts    ← per-piece entries, lid timings, colour steps, macro shots
    soundCues.ts       ← sound spotting list derived from the two files above
    brand.ts           ← palette, finishes, all on-screen copy, font loading
    layouts.ts         ← 7-piece hero and 9-piece flat-lay compositions
    assets.ts          ← asset-slot resolution (real asset if present, else stand-in)
  components/
    ProductReveal.tsx        Scene 01: light travelling a rim in darkness
    ProductAssembly.tsx      depth-based assembly (side and overhead views)
    ColorTransformation.tsx  light-band finish change (not a cross-fade)
    MacroDetailScene.tsx     4 geometry-linked macros
    LifestyleScene.tsx       kitchen environment (or photo plate)
    BrandEndCard.tsx         signature, reflection, fade to darkness
    KineticTypography.tsx    masked line reveals + tracking settle
    LightSweep.tsx           reusable light band
    CameraTransition.tsx     circlePortal · lightSweepWipe · depthDissolve
    StudioBackdrop.tsx       infinity-cove backdrop
    cookware/                procedural studio renders (side + top views)
  scenes/Scenes.tsx          scene assembly (local frame 0 = nominal scene start)
  Film.tsx                   TransitionSeries driven by timeline.ts
scripts/
  generate-soundtrack.mjs    temp score + SFX synthesiser (timeline-synced)
  render-stills.mjs          review-still renderer
```

### Retiming
Edit `SCENES[].seconds` or `TRANSITIONS[].frames` in `timeline.ts`. Scene-local
choreography stays anchored to each scene's nominal start. The sound cues follow
automatically the next time you run `npm run audio`.

## Licences
Inter is © The Inter Project Authors, licensed under the SIL Open Font License 1.1 (see `public/fonts/`).

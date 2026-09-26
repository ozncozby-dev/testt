# LUXURY PRIME — Primera Cookware Collection
## Brand film · creative & technical plan

**Concept:** *Designed around your kitchen*: the collection is built from light, shape and material.
**Arc:** Detail → Product → Collection → Lifestyle → Brand
**Master:** 3840×2160 · 16:9 · 30 fps · 35.0 s (1050 frames)

---

## 1. Asset inspection (step 1 of the brief)

| Source | Finding |
|---|---|
| Repository | Empty. No product photography, logo, colour references or audio were supplied. |
| Google Drive | The only candidates are unlabelled JPGs in a folder called `WhatsApp Images` (e.g. `IMG-20260523-WA0005.jpg`, around 120 KB each). WhatsApp compresses images, so even if these are Primera shots they are too small for a 4K master. The render sandbox also can't reach Google Drive, so they could not be inspected. |

**Decision.** The film is built on an **asset-slot architecture**:

* Every product shot is drawn procedurally as a studio-lit vector stand-in, so the film renders end to end today.
* When a real file is placed in `public/assets/…` under the documented name, it **automatically replaces** the stand-in. The choreography, timing and transitions stay the same.
* Photography is always drawn with `object-fit: contain` (cut-outs) or `cover` (plates), so it is never stretched.

The stand-ins deliberately stay minimal and geometric (simple studio renders, not fake photorealism). In line with the brief, anything that couldn't be done convincingly without real assets was simplified.

### Assets needed for the final master (priority order)

1. **Logo:** vector SVG → `assets/brand/logo.svg`
2. **Side-view cut-outs for each piece and finish.** Use transparent PNGs, shot straight on at a low camera height (~10–15° elevation), in one consistent lighting setup:
   `assets/pieces/side/{stockpot28|casserole24|saucepan18|frypan24}-{onyx|sage|granite|ivory}.png`
   Lids can be supplied separately (`…-lid-<finish>.png`) for the lid-seating moment.
3. **Top-down cut-outs** of the 9-piece set in the hero finish: `assets/pieces/top/<piece>-ivory.png`
4. **Macro plates** (16:9, ≥ 3840 px): `macro-lid`, `macro-handle`, `macro-interior`, `macro-base`
5. **Lifestyle plate:** `assets/plates/kitchen.jpg`. This should be a warm, minimal kitchen island with the product, with negative space top-left for type.
6. **Real finish names and hex values** → `src/config/brand.ts › finishes`
7. **Real set contents** (what's in the 7 pc and 9 pc sets) → `src/components/cookware/pieces.ts`
8. **Score:** `public/audio/soundtrack.wav` (licensed/commissioned). If it's missing, the generated temp track is used.

### Strongest angles (to brief the photographer)
* **Hero:** eye level, slightly elevated (≈12°), soft key from the upper left, rim light from the right, seamless warm off-white cove.
* **Flat-lay:** perfectly overhead on dark charcoal, key from the upper left (matches the stand-in lighting).
* **Macros:** 100 mm macro, very shallow depth of field. Shoot the knob-on-lid, handle ferrule, granite interior at a grazing angle, and the induction base.

---

## 2. Scene & timeline plan

All timings live in `src/config/timeline.ts`. Changing a scene's `seconds` or a transition's `frames` re-flows the film, scene-local timings and the sound cue sheet.

| # | Scene | Nominal | Background | Finish | Content | Type |
|---|---|---|---|---|---|---|
| 01 | The First Light | 0:00–0:03 | Black | Dark metal | A single reflection travels along the rim of a lid; the dome and knob only hint at themselves; slow macro push + rotation | PRECISION IN EVERY DETAIL |
| 02 | The Collection Forms | 0:03–0:09 | Warm off-white | Onyx | Pieces arrive from different depths (DOF blur ∝ depth), with parallax orbit. Lids float, then seat last | PRIMERA / 7 PIECE COLLECTION |
| 03 | Colour as Personality | 0:09–0:15 | Stone | Sage → Granite → Ivory | A light band carries each new finish across the set; the camera keeps pushing; the pieces start drifting outward | YOUR KITCHEN. YOUR STYLE. / Available in multiple finishes |
| 04 | More Possibilities | 0:15–0:21 | Deep charcoal | Ivory | Overhead flat-lay; six vessels lock in one by one with a precision settle (≤1.2 % overshoot), then three lids drop | MORE PIECES. MORE POSSIBILITIES. → PRIMERA / 9 PIECE COLLECTION |
| 05 | Material Details | 0:21–0:26 | Ink / black | Ivory + granite + steel | 4 macros (~1 s each): lid & knob, handle ferrule, cooking surface, base | CRAFTED · BALANCED · — · REFINED |
| 06 | From Product to Home | 0:26–0:31 | Warm plaster kitchen | Ivory | Fluted stone island, window light across the wall, steam from the open saucepan, slow push-in | MADE FOR EVERYDAY MOMENTS → DESIGNED TO ELEVATE THEM. |
| 07 | Brand Signature | 0:31–0:35 | Charcoal studio | Ivory | Hero set is still, with a floor reflection. Soft light passes across it, then logo, wordmark and tagline. A floor glint fades to black | LUXURY PRIME / Elevate the Everyday. |

---

## 3. Transition logic

Each transition is **one continuous camera move shared by both shots**. None of them is a plain cross-fade.

| Link | Type | Geometry carried across |
|---|---|---|
| 01 → 02 | `circlePortal` | The camera accelerates into the lid rim from Scene 01. The rim becomes a lit ring, and the next scene opens inside it and settles from 1.14× to 1×. |
| 02 → 03 | `circlePortal` (perspective) | This is the object match cut. The portal starts as the stockpot lid's flattened ellipse (ry/rx = 0.2) and rounds out into a circle as the camera passes over it, reading as one camera tilt. The next colour version is waiting inside. |
| 03 → 04 | `depthDissolve` (push) | The pieces are already drifting outward (expansion). The camera pushes forward through a depth blur and arrives overhead, where the extra pieces lock in. |
| 04 → 05 | `circlePortal` | Through the stockpot lid, which is a true circle in top view, into the macro of the same lid and knob. |
| 05 internal | sweep · sweep · portal | Lid-rim arc → a light sweep along the arc → the handle line. Handle axis → a sweep along it → the cooking surface. Surface disc → circle portal → base disc. |
| 05 → 06 | `lightSweep` (warm) | Warm sunlight sweeps the dark studio away and reveals the kitchen. |
| 06 → 07 | `depthDissolve` (pull) | The camera pulls back into the quiet studio. |

**Deliberate deviation:** the macro order is **lid → handle → surface → base**, not the brief's handle → lid → …. This is so the 04 → 05 portal can go through a lid into a lid, and so the circle → circle link (surface → base) lands on the final macro. The pairings the brief asked for are all kept: handle line → next line, circular lid/surface → circular base, and metal reflection → light sweep.

---

## 4. Motion language (enforced in code)

* **Camera:** `ease.cinematic` = cubic-bezier(0.65, 0, 0.35, 1). There are no linear moves and no fast zooms.
* **Arrivals:** `ease.arrive` = cubic-bezier(0.16, 1, 0.3, 1). Scene 04 uses `precisionSettle`, which has a single overshoot capped at ~1.2 %. It reads as mechanical, not bouncy.
* **Depth:** parallax is proportional to each slot's `depth`. Depth-of-field blur is proportional to depth travel. Floor shadows tighten as a piece lands.
* **Type** (`KineticTypography`): masked vertical reveal per *line*, opacity, and a slow tracking settle (wide → set). Letters are never animated individually. Inter is used as the Helvetica/Neue Haas stand-in (self-hosted, OFL).
* **Light:** the only "effect" is light: rim reflections, softbox reflections on the enamel, and sweeps. There is no glow bloom, no particles and no lens flares.

---

## 5. Sound design

The spotting list is `src/config/soundCues.ts`. It is derived from the same timeline and choreography, so picture and sound cannot drift apart. Print it with `npm run cues`.

`npm run audio` synthesises a **temp** score and SFX pass (`public/audio/primera-temp.wav`). It is there to judge rhythm, not for delivery:

* **Bed:** a slow D-major pad (Dadd9 → Bm11 → Gmaj9 → Dadd9) that builds across the film. A very quiet low pulse and pentatonic pluck sit under the product scenes (9–29 s).
* **SFX:** a metallic shimmer on the rim light, whooshes centred on every camera transition, soft placement thuds when lids seat or drop, tactile clicks on each Scene 04 lock-in, ticks on the macro links, a warm swell into the kitchen, a tonal rise into the logo, and a bell chime on the signature.

For delivery, drop a licensed or commissioned score at `public/audio/soundtrack.wav` and give the composer the cue sheet.

---

## 6. Open items for the client
1. Supply the assets listed in §1. Every slot is plug-and-play.
2. Confirm the Primera finish names and colours (the current ones are placeholders: Onyx, Sage, Granite, Ivory).
3. Confirm the 7 pc and 9 pc contents (the placeholder 9 pc adds a 28 cm frypan and a 26 cm sauté).
4. Provide the website URL, if it should appear on the end card (`copy.website`).
5. Choose a licensed typeface if brand guidelines require one (swap the files in `public/fonts`).

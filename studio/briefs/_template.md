# Director's Brief — <scene-name>

> Fill this in BEFORE any code is written. Claude builds from the brief, not from a one-line prompt.
> Vague words ("modern", "clean", "dynamic") are not allowed without a reference that shows what they mean.

## 1. Purpose
- **What is this for?** (ad, product launch, social cut, explainer, title sting…)
- **Where does it play?** (Instagram Reel 9:16, YouTube 16:9, Amazon A+ video, marketplace listing…)
- **The one thing the viewer must remember:**

## 2. Format
| Field | Value |
|---|---|
| Resolution | 1920×1080 |
| FPS | 30 |
| Duration | 6.0 s |
| Safe area | 5% action / 10% title |
| Sound | none / music bed / SFX cues |

## 3. References (required)
Put files in `studio/references/<scene-name>/` and name what to take from each.
| File / URL | Take this | Ignore this |
|---|---|---|
| | e.g. the masked type reveal timing | e.g. the colours |

## 4. Look
- **Palette** (hex, max 4 + neutrals):
- **Type** (family, weights, tracking):
- **Layout grid** (columns, margins, where the weight sits — NOT centred by default):
- **Texture / light** (flat, grain, glow…):

## 5. Motion language
- **Personality** (precise / playful / heavy / fluid):
- **Springs used** (from `springs` in motion.js): snap / settle / pop / heavy
- **Signature move** (the one move people remember):
- **Forbidden** (e.g. no fades on type, no bounce on logo):

## 6. Beat sheet
Times in seconds. Every beat has one job.
| t | Beat | What moves | How (spring/ease) | Notes |
|---|---|---|---|---|
| 0.0 | | | | |

## 7. Copy
Exact on-screen text, line by line. No placeholder lorem.

## 8. Acceptance criteria
- [ ] Reads at phone size (check the 25% contact sheet)
- [ ] Nothing moves without a reason; nothing sits dead for > 1.2 s
- [ ] Signature move lands on its beat (±2 frames)
- [ ] Final frame holds ≥ 0.5 s and works as a thumbnail

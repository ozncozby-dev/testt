# Director's Brief — test-card

## 1. Purpose
- **What is this for?** Pipeline smoke test. Proves seek(t), closed-form springs, render and critique all work end to end.
- **Where does it play?** Internal only.
- **The one thing the viewer must remember:** "Brief → Build → Look → Fix."

## 2. Format
| Field | Value |
|---|---|
| Resolution | 1920×1080 |
| FPS | 30 |
| Duration | 6.0 s |
| Safe area | 96 px margins |
| Sound | none |

## 3. References
None needed for a smoke test. Deliberately avoids the default look: no centred text, no gradient, no fade-ins on type.

## 4. Look
- **Palette:** ink `#0E0E10`, paper `#F2EFE9`, accent `#FF4D1F`, mute `#8A8780`
- **Type:** Inter 200 display / 500 labels, labels tracked +0.18em uppercase
- **Layout:** 12-col grid, 96 px margins. Weight sits bottom-left. Index numbers top-left.
- **Texture:** flat paper, one hairline grid.

## 5. Motion language
- **Personality:** precise, editorial
- **Springs:** `snap` for type, `settle` for cards, `heavy` for the accent bar
- **Signature move:** accent bar sweeps across and "pushes" each word into place
- **Forbidden:** opacity fades on type (type is revealed by masks only), bounce on the headline

## 6. Beat sheet
| t | Beat | What moves | How | Notes |
|---|---|---|---|---|
| 0.00 | Grid draws | hairlines draw from the edge (width/height) | ease.out, stagger 0.04 | |
| 0.35 | Index | "01 — 04" counter labels mask up | snap, stagger 0.06 | |
| 0.60 | Accent bar | bar sweeps left→right | heavy | signature |
| 0.80 | Headline | 4 words mask up, one per column | snap, stagger 0.12 | follows bar |
| 2.40 | Cards | 4 step cards rise from below | settle, stagger 0.08 | |
| 3.80 | Focus | card 3 ("Look") gets accent fill | snap | |
| 4.60 | Out | headline + cards push up and out, bar retracts | ease.in | |
| 4.95 | Bar returns | bar sweeps back in (bookend), leads the lockup | settle | |
| 5.25 | Lockup | "seek(t) studio" 136 px on the headline baseline | snap | holds to 6.0 |

## 7. Copy
- Headline: `Brief` · `Build` · `Look` · `Fix`
- Cards: `01 Brief — write it down` · `02 Build — seek(t) scenes` · `03 Look — render & critique` · `04 Fix — iterate, don't restart`
- Lockup: `seek(t) studio`

## 8. Acceptance criteria
- [x] `npm run verify` passes (deterministic, order-independent)
- [ ] Headline readable in the contact sheet
- [ ] No frame where everything is static for > 1.2 s
- [ ] Last 0.5 s is a clean hold

# test-card — critique round 1

Contact sheet: `sheet.png` · stills: `f0000.png` (0.00s), `f0015.png` (0.50s), `f0030.png` (1.00s), `f0045.png` (1.50s), `f0060.png` (2.00s), `f0075.png` (2.50s), `f0090.png` (3.00s), `f0105.png` (3.50s), `f0120.png` (4.00s), `f0135.png` (4.50s), `f0150.png` (5.00s), `f0165.png` (5.50s), `f0179.png` (5.97s)

## Verdict
`FIX` — the pipeline and motion work, but the last frame fails the thumbnail test and the headline floats mid-frame instead of carrying weight bottom-left as the brief asks.

## Scores (1–5, be harsh; 3 = "fine", which is not good enough to ship)
| Axis | Score | Evidence (cite a frame) |
|---|---|---|
| Brief match | 3 | Beats land on time (f30 bar leads the words, f120 focus). §4 "weight bottom-left" not met: f45–f150 headline sits at mid-height. |
| Composition | 3 | f45: empty band 200–450 px that isn't doing anything; cards squeezed at the bottom. |
| Typography | 3 | Headline is clean. Card sub-lines (20 px) are unreadable on the sheet (f105); on the focused card, the sub-line at 70 % opacity on orange disappears (f135). |
| Motion | 4 | Mask reveals and the bar→word handoff (f30) read well; the settle spring on the cards feels physical. At f165 the Fix card is still leaving while the lockup is coming in, which is messy. |
| Default-look check | 4 | No centred text, gradient or fades. The ending is a small logo in the corner, which drifts toward the "logo at the end" cliché. |
| Finish | 4 | Verify is pixel-perfect. Hairline ends are clean now that geometry replaced scale. |

## Problems (most severe first)
1. f179 → the end frame is weak as a thumbnail: a 44 px lockup alone in an empty frame → lockup at 120 px/200 weight on the headline baseline, with the accent bar returning above it as a bracket (scene.js `seek` lockup + bar).
2. f45–f150 → the headline sits mid-frame → move the bar to 560 and the headline to 600, the bottom hairline to 800 and the cards to 820 (h 164), so the weight really sits at the bottom.
3. f165 → the card exit overlaps the lockup entry → `T.out` 4.8→4.6, `T.lockup` 5.4→5.15; the last 0.5 s is a clean hold.
4. f105/f135 → card sub-lines are too small and low-contrast → 24 px, opacity .8, full opacity on the focused card.

## Keep
The bar-leads-words handoff; the mask-only type entry; the settle spring on the cards; focus colour on "Look" in the headline and the card at the same time.

## Next round
Fix 1–4 (all small, same file). Then re-run verify + critique.

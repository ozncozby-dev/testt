# test-card — critique round 2

Contact sheet: `sheet.png` · stills: `f0000.png` (0.00s), `f0015.png` (0.50s), `f0030.png` (1.00s), `f0045.png` (1.50s), `f0060.png` (2.00s), `f0075.png` (2.50s), `f0090.png` (3.00s), `f0105.png` (3.50s), `f0120.png` (4.00s), `f0135.png` (4.50s), `f0150.png` (5.00s), `f0165.png` (5.50s), `f0179.png` (5.97s)

## Verdict
`SHIP` (after one fix): all four round 1 problems are resolved; one timing problem remains in the bookend.

## Scores
| Axis | Score | Evidence |
|---|---|---|
| Brief match | 4 | Weight bottom-left now (f45–f150); beats on time. |
| Composition | 4 | f179 end frame works as a thumbnail: bar + 136 px lockup on the headline baseline. |
| Typography | 4 | Card sub-lines readable on the sheet (f105); the focused card is legible (f135). |
| Motion | 3→4 | f165: the returning bar (heavy spring) is still at ~65 % when the lockup is already in. The bar must lead, as in the opening (f30). |
| Default-look check | 5 | No centred type, gradients or fades; the ending is a typographic bookend rather than a logo sting. |
| Finish | 5 | verify pixel-perfect. |

## Problems
1. f165 → the bar trails the lockup → bar retract 0.45→0.35 s, bar returns at 4.95 on the `settle` spring (faster), lockup 5.15→5.25 (hold is still 0.75 s).

## Keep
Everything else. Don't touch the layout.

## Next round
None. Apply fix 1, run verify, then do the final render.

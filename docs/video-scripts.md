# Video recording packet

The actual Colosseum editor requires two separate videos hosted on YouTube, Loom or Vimeo: an actual product demonstration up to 3 minutes, plus a founder pitch up to 2 minutes. The slide deck is supplemental and can satisfy the Meteora sidetrack's deck field, but cannot replace these main-competition videos.

## Product demo — approximately 2 minutes

Show the real application throughout. Do not show only slides or source code.

**0:00–0:20 — Open the lab**
“This is CurveScope, a configuration review tool for Meteora DBC builders. It runs the official SDK locally, so a developer can inspect launch economics before a pool exists. The values on screen are modeled quotes, not live market data.”

**0:20–0:45 — Read the balanced preset**
“The balanced preset uses a billion tokens, fifty thousand USDC initial fully diluted value and five hundred thousand at graduation. The SDK derives the required quote reserve. For a thousand USDC first buy, the report separates curve-only impact, the twenty USDC fee, token output and the minimum output at the chosen tolerance.”

**0:45–1:10 — Pin and compare**
Click Pin as baseline, then Gentle discovery. Scroll to the comparison.
“Pinning a baseline lets us compare both configurations with the same order size, elapsed time and slippage tolerance. A lower displayed fee is only one part of the result; the execution curve and initial valuation also matter.”

**1:10–1:35 — Stress the boundary**
Set the buy amount to 1,000,000 and click Recalculate.
“This order crosses the graduation boundary. The SDK performs a partial fill, and CurveScope shows the unfilled amount. It does not pretend that the remainder executes in DAMM v2.”

**1:35–2:00 — Reproduce the report**
Reset, export the report, then import the exported JSON.
“The report preserves exact SDK integers, the package version and all inputs. Importing recalculates it locally. Each point is an independent first buy into an empty pool. The prototype excludes prior market activity and dynamic fees. The source, tests and assumptions are available in the repository.”

## Founder pitch — up to 2 minutes

This must be the real entrant's introduction. Do not invent a background or present synthetic narration as the founder.

Suggested outline:

1. Introduce yourself using your preferred public name and accurate experience (20 seconds).
2. Explain why you chose to help launchpad developers review configuration economics (20 seconds).
3. Describe CurveScope's comparison, stress testing and reproducible report workflow (35 seconds).
4. Explain your contribution, AI assistance and use of existing Meteora SDK mathematics (20 seconds).
5. State the next validation step: observe developers reviewing real proposed configurations, then consider CI report diffs (20 seconds).

Do not claim users, revenue, mainnet activity, customer interviews or prior experience that you cannot substantiate.

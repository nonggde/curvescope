# CurveScope — submission packet

Prepared September 30, 2026. **Not submitted.** A Colosseum draft was created at https://colosseum.com/arena/projects/curvescope-1. The editor states final submissions open October 6 at 04:00 PDT (October 6, 19:00 China time).

## Superteam: Meteora DBC

**Project Name:** CurveScope

**Project Description:**

CurveScope is a reproducible launch-configuration review tool for builders using Meteora's Dynamic Bonding Curve. It helps a launchpad developer compare economic assumptions before creating a pool: generate and validate a DBC configuration, quote first-buy scenarios using the official SDK, separate curve impact from trading fees, inspect partial fills at graduation, and export exact evidence that another developer can import and reproduce.

Meteora is central to the implementation. The app uses @meteora-ag/dynamic-bonding-curve-sdk 1.5.13 for buildCurveWithMarketCap, validateConfigParameters, getQuoteFromInputAmount with PartialFill, and price conversion. It provides baseline comparisons, order-size stress tables, fee-window comparisons, and lossless decimal-string exports of the SDK parameters and quote outputs. Its current scope is an offline USDC-quoted model with DAMM v2 migration configuration; post-migration swaps and existing on-chain pool activity are not simulated.

Built during the hackathon on September 30, 2026 with AI coding assistance, this is a working developer-tool prototype. It has no claimed mainnet volume, revenue or validated customer traction. The next step is to test the review workflow with launchpad teams and add report diffs for continuous integration.

**Project GitHub Link:** https://github.com/nonggde/curvescope

**Project Website:** https://nonggde.github.io/curvescope/

**Pitch deck / Loom / video:** `docs/curvescope-pitch.pptx`, published with the repository; web brief at `pitch.html`.

**Did you submit to official Crypto World's Fair?** The owner confirmed on September 30 that no main-hackathon submission had yet been made. Answer **No** until actual submission is complete; never state Yes based on preparing files.

**Colosseum project draft:** https://colosseum.com/arena/projects/curvescope-1 (draft, not a final submission).

## Colosseum product description

**One line:** Reproducible launch-configuration reports for Meteora DBC builders.

**Problem:** Launchpad teams need to understand how supply, price discovery, fee timing and graduation conditions affect early buyers. Raw SDK parameters are difficult to review consistently across a team. This is a product hypothesis; no customer interviews have yet validated demand.

**Product:** A browser-based lab built around the real Meteora SDK. Pin a baseline, compare launch parameters and exact quote outcomes, inspect fee timing, stress the graduation boundary and share reproducible JSON reports.

**Blockchain / tools:** Solana ecosystem; Meteora DBC SDK 1.5.13; DAMM v2 migration configuration; TypeScript, Vite, bn.js and decimal.js. The prototype runs offline and does not claim a deployed on-chain program.

**Differentiation:** The protocol SDK supplies calculations. CurveScope contributes a coherent review workflow with transparent assumptions, fair comparisons, stress scenarios and portable exact evidence. It is not a novel pricing algorithm and not a replacement for independent audits.

**Distribution plan — proposed:** Start with Meteora launchpad developers. Ask them to review one real proposed configuration, observe where the tool saves time, and refine export formats. Explore GitHub Actions report diffs and embeddable launch-review widgets. All outreach is future work.

**Business model — hypothesis:** Open-source single-user core; possible paid team reviews, CI gates and shared report history. No revenue or pricing validation yet.

**Development disclosure:** New application created September 30, 2026 with AI coding assistance. Dependencies supply existing protocol math. No pre-existing CurveScope app or traction claimed.

**Founder and team fields requiring the owner's facts:** Public name, background, relevant experience, motivation, team membership, time commitment, funding history and any other account fields. Country: China, as stated by the owner. Do not infer answers from a GitHub account or other projects.

## Evidence and current gaps

- [x] Global-listed task; no specific country limitation in the Meteora listing.
- [x] Developer tooling explicitly included by the task.
- [x] Working SDK integration and typed source code.
- [x] Nine core tests, build and browser checks.
- [x] English README, description, reproducible report and pitch material.
- [x] Read the official Crypto World’s Fair rules: China is not on the explicit exclusion list. The rules also require the age of majority or 18, whichever is higher, no applicable exclusions, and compliance with local law. The existing account was already registered; personal eligibility remains the entrant’s responsibility.
- [ ] Complete the main Colosseum submission with truthful founder information and required presentation/demo videos.
- [ ] Supply the real Colosseum submission link where applicable.
- [ ] Review final application and accept applicable terms personally when required.
- [ ] Submit the Meteora sidetrack and verify its confirmation.

The Superteam listing deadline was `2026-10-13T06:59:00Z`, or **October 13, 2026 at 14:59 China time**, when checked. Recheck before submitting. Rewards are competitive; no payout is promised.

## Actual platform media fields

The authenticated editor, checked September 30, requires a product graphic, a direct GitHub repository, an actual product demo video up to 3 minutes, and a separate founder pitch video up to 2 minutes. Video links must use YouTube, Loom or Vimeo. A deck alone does not satisfy these main-competition video fields.

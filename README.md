# CashFlow OS: The ₹10,000 / 30-Day Decision Simulator

> **A high-fidelity, Gen Z-centric personal finance simulator where every financial move dynamically recalculates the entire financial ecosystem in real-time.**

---

## 🎨 Design & Visual Architecture

**CashFlow OS** uses the **classic dashboard layout** paired with a refined, high-contrast, modern fintech color scheme:

### 🌟 Refined Hyper-Palette
- **Electric Aqua-Cyan (`#00d2ff` & `#0072ff`)**: Primary brand identity, Available Liquid Capital, active slider highlights, and metric glows.
- **Spring Jade Mint (`#00f298` & `#059669`)**: Safe Daily Allowance, Health Grade badge, positive budget delta tags, and solvent status indicators.
- **Radiant Solar Amber (`#ffaa00` & `#ff5e36`)**: Month-End Balance projection, Goa Trip Savings Goal progress, and cautionary thresholds.
- **Coral Crimson (`#ff3366` & `#e11d48`)**: Financial Risk Index, danger zone warning fill (<₹500), broke day alerts, and expense tags.
- **Vivid Ghost Magenta (`#e024c3` & `#7b2cbf`)**: What-If Sandbox aura, ghost trajectory curve on the forecast canvas, and live comparison delta pills.
- **Obsidian Midnight Slate (`#090d16` & `#0e1424`)**: Deep, low-fatigue slate backgrounds with atmospheric radial color glows.

---

## 🧮 Mathematical Core & Initial Lived-In State (Day 7 / 30)

| Metric | Calculation & Baseline Formula | Initial Value |
| :--- | :--- | :--- |
| **Total Monthly Budget** | Starting capital managed across 30 days | **₹10,000** |
| **Timeline Position** | Default initialized at Day 7 (23 remaining days) | **Day 7 of 30** |
| **Active Fixed Commitments** | Room (₹2,000) + Gym (₹882) + Netflix (₹199) + Spotify (₹119) | **₹3,200** |
| **Target Savings Goal** | Ring-fenced capital ("Goa Trip 🌴" or Emergency Cushion) | **₹1,500** |
| **Spent to Date (Days 1–7)** | Past discretionary spend ledger | **₹1,120** (₹160.00/day burn) |
| **Available Liquid Capital** | $\text{Income} - \text{Fixed} - \text{Savings} - \text{Spent}$ | **₹4,180** |
| **Safe Daily Allowance** | $\text{Liquid Capital} / \text{Remaining Days} = ₹4,180 / 23$ | **₹182 / day** |
| **30-Day Month-End Forecast** | $\text{Liquid} - (\text{Burn Rate} \times \text{Remaining Days})$ | **+₹500 Buffer** |
| **Financial Risk Index** | Weighted composite score (0–100) based on allowance and runway | **24 / 100 (Low Risk)** |
| **Financial Health Score** | Comprehensive discipline & resilience metric (Grade A to F) | **84 / 100 (Grade A)** |

---

## 🧪 Interactive Features & Capabilities

1. **The 4 Hero Metric Pillars**:
   - Available Liquid Capital (`₹4,180`)
   - Safe Daily Allowance (`₹182/day`)
   - 30-Day Month-End Forecast (`+₹500`)
   - Financial Risk Index (`24/100 Low Risk`)
   - Every card displays live **Ghost Mode split comparison pills** when staging a what-if action.

2. **Capital Allocation Architecture Strip**:
   - Interactive segmented progress bar showing real-time distribution: Liquid (41.8%), Fixed Commitments (32.0%), Savings Goal (15.0%), and Past Spent (11.2%).

3. **30-Day Trajectory Forecast Canvas Chart**:
   - High-DPI Canvas 2D line graph.
   - Solid Spring Mint line for actual past days (Days 1–7).
   - Dashed Electric Cyan line for baseline projected runway (Days 7–30).
   - Dashed Vivid Magenta curve with glowing aura in Ghost Mode.
   - Shaded Coral Crimson Danger Zone (< ₹500) and mouse hover scrub crosshair with tooltips.

4. **Timeline Scrubber & Autoplay**:
   - Scrub between Day 1 and Day 30 to test burn rates at any point in the month.
   - **`▶ Play 30 Days` Autoplay Control**: Watch your cash flow evolve day by day automatically.
   - Step `+1 Day` forward button.

5. **What-If Sandbox Decision Matrix & Drawer Modal**:
   - 5+ preset scenarios (Sneaker Drop on Sale, Cafe Hop, Freelance Gig, Cancel Subs, Bike Service).
   - **`🎲 Surprise Shock` Generator**: Generates realistic random Gen Z financial shocks directly into Ghost Mode.
   - Filter chips: All, Flex & Lifestyle, Food & Hangouts, Gigs & Inflow, Emergencies, Subscription Cuts.
   - Slide-out drawer with custom expense/income builder, split diff preview, Broke Day Warning, and `⚡ Commit to Reality` / `✕ Discard Preview`.

6. **Target Savings Goal & Subscriptions Manager**:
   - Goal selector chips (Goa Trip, iPhone EMI, Emergency Fund, Music Fest) with interactive target slider and live arrival probability.
   - Interactive toggle switches for fixed subscriptions (Gym, Netflix, Spotify, iCloud). Toggling them off instantly frees up liquid capital.

7. **Discretionary Spend Ledger & Vibe Check AI**:
   - Lived-in expenditure ledger with custom move logging.
   - Gen Z Vibe Check AI Copilot with dynamic financial commentary, discipline rating, and "Bro-is-cooked meter".

8. **Synthesized Web Audio & Confetti**:
   - Real-time Web Audio API sound effects for clicks, simulations, and commits, with celebration confetti.

---

## 🚀 How to Run
Open [**`index.html`**](file:///c:/Users/Rugved/OneDrive/Desktop/clone/The%20What-If%20Simulation%20Engine/index.html) directly in any web browser.
or click on this link https://the-what-if-simulation-engine.netlify.app

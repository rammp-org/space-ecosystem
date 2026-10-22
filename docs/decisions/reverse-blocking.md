---
question: "Are drive outputs fully reverse-blocking?"
area: Power
status: leaning
source: "Grilling 2026-10-19 (Denver's question)"
order: 14
---

## Where it is leaning

Leaning yes on the 1 kW and 300 W drive outputs (back-to-back MOSFETs or an ideal-diode controller), so an off output is off in both directions. Normal regen still flows while the output is on. Compute and accessory outputs use a plain high-side FET.

## Why

The Racer handles its own energy on e-stop. On the Ninebot hub a coasting wheel with its bridge off reaches about 34 V peak back-EMF at 483 rpm, below the 40 to 54 V bus, so it pushes no current until roughly 650 to 700 rpm.

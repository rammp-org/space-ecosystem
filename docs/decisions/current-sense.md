---
question: "What current sensing does a high-power output need?"
area: Power
status: decided
source: "Grilling 2026-10-19; Alex 2026-10-21"
order: 13
---

## Answer

Two paths. A precision monitor (INA228/229 class) reads ±30 A at 10 mA resolution and ±0.5 % of reading, for telemetry and coulomb counting. A fast path reads up to the hardware trip (about 50 A) at coarser resolution, for the trip itself and the high-rate capture before it.

## Why

1 kW at a 40 V pack is 25 A continuous. Regen makes the sensing bidirectional. Precision monitors average over 50 µs to milliseconds, which is too slow for a trip.

## Next

Denver to search parts.

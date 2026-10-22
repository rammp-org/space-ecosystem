---
question: "Is the e-fuse class set in firmware or by parts?"
area: Power
status: decided
source: "Grilling 2026-10-19"
order: 12
---

## Answer

By parts. The hardware trip (about 2x the class's expected draw) is fixed per output by component population. A load declares its power contract over the network, and the bus bar accepts it only if it fits inside the output's class. A load that asks for more is refused and flagged.

## Why

A firmware mistake cannot turn a 300 W port into a 1 kW port. Firmware-selectable classes can come later, once the parametric output block exists.

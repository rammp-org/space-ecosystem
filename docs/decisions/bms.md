---
question: "Does SPACE own battery management, or only spec the interface?"
area: Power
status: decided
source: "October deck; bus bar brief"
order: 10
---

## Answer

Decided by Alex, 2026-11-03. Interface only. The bus bar treats the pack as a voltage source with a known voltage-to-charge curve and does not talk to the BMS.

## Why

Taking on a BMS means taking on battery safety. Off-the-shelf and open designs get compared later.

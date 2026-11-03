---
question: "What powers the brake solenoid, and when does the brake engage?"
area: Safety
status: decided
source: "Grilling 2026-10-19"
order: 22
---

## Answer

Decided by Alex, 2026-11-03. The Racer powers and switches the solenoid from its own supply and decides when the brake engages.

## Why

The Racer already decides its own safe stop, so the brake is part of that decision. It can stop electrically first and engage the brake when it chooses.

## Next

The brake is active-release, so it engages whenever the solenoid loses power. Keep that true: if the Racer loses power or its output is cut, the solenoid must drop. Write down the engage timing the Racer uses after SAFE_STOP and after ESTOP.

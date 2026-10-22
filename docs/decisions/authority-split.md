---
question: "Who owns power, motion intent, and local safety?"
area: Scope
status: leaning
source: "Grilling 2026-10-19"
order: 7
---

## Where it is leaning

Leaning: power distribution owns power and the e-stop chain; the MIB application owns motion intent (who may drive, at what setpoint); every module owns its own local safety (watchdog, thermal guard, brake resistor).

## Why

The deck says nothing central knows how to drive a motor. The MIB still has to decide when the chair drives, so "no central controller" means no single node that every function depends on.

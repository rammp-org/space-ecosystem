---
question: "Who owns power, motion intent, and local safety?"
area: Scope
status: decided
source: "Grilling 2026-10-19"
order: 7
---

## Answer

Decided by Alex, 2026-11-03. Three owners. Power distribution owns power and the e-stop chain. Every module owns its own local safety: watchdog, thermal guard, brake resistor, safe stop. Motion intent is not a SPACE concern at all. It belongs to the robot-level integration, the application. On RAMMP that is the MIB.

## Why

SPACE modules are libraries and the robot is the program that pulls them in. RAMMP's MIB is its main.cpp. Each module works by itself: it does not need the MIB, or any other application, to run its safety or its power distribution. "No central controller" means no SPACE module depends on a central node to stay safe.

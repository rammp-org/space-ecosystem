---
question: "What counts as a module, and what is an application?"
area: Scope
status: decided
source: "Alex, 2026-10-22"
order: 3
---

## Answer

Decided by Alex, 2026-11-03. A module is a building block with one job: the Racer, power distribution, the I/O node, ABC-style bridges. An application is the robot-level integration that puts modules together and owns robot-specific logic such as motion intent, chair state, and UI. Think of a C++ program: each SPACE module is a library, and the application is main.cpp. On RAMMP the MIB is the application's brain, and the HMI on Alain's Pixis board is an application built from SPACE pieces.

## Why

It keeps SPACE small and reusable. Modules work by themselves, so a new robot only writes its own application.

## Next

Decide whether applications get full pages on this site or link out to their repos.

---
question: "What counts as a module, and what is an application?"
area: Scope
status: leaning
source: "Alex, 2026-10-22"
order: 3
---

## Where it is leaning

A module is a building block with one job: the Racer, power distribution, the I/O node and ABC-style bridges. An application is several modules put together for one robot, the way code has modules and an application on top. The joystick/HMI and the MIB are applications.

## Why

It keeps SPACE small and reusable. Robot-specific logic (chair state, the deadman, UI) lives in applications, on the ATOS/RAMMP side of the seam.

## Next

Confirm the joystick name and who built it. Decide whether applications get pages on this site or link out to their repos.

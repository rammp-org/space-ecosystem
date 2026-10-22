---
question: "What does each kind of stop do?"
area: Safety
status: leaning
source: "Racer motor API; grilling 2026-10-19"
order: 20
draft: true
---

## Where it is leaning

Leaning the firmware's behaviour: SAFE_STOP and 200 ms of command silence ramp down and then hold position; ESTOP and faults put the bridge in Hi-Z. PRD v0.1 F-04 ("always coast, no braking") gets rewritten to match.

## Why

A chair on a slope has to hold. "Gentle by default" survives as: no stop response may cause a larger transient than the fault it answers.

## Next

Set the time bound for power distribution to cut a drive that does not reach a safe state.

## Background (Claude draft, 2026-10-19, not reviewed)

### Context

Two stop behaviours exist today, and they disagree:

- PRD v0.1, F-04: every software stop is "closed-loop unload, then Hi-Z coast. No braking."
- ATOS motor API v2: SAFE_STOP and command loss ramp to zero, then **hold position** under a reduced torque cap. ESTOP goes to Hi-Z immediately. The API doc explains why: a held chair does not roll down a slope, and ESTOP is for when you no longer trust the drive.

The firmware behaviour was chosen for a chair on a slope, which the bench never tested. It is probably the right one. The PRD's "gentle by default" principle still holds: no stop response may inject a transient larger than the fault.

IEC 61800-5-2 gives standard names to this pattern. STO (safe torque off) removes the ability to produce torque. SS1 (safe stop 1) brings the motor to a controlled stop, then applies STO. SS2 brings it to a controlled stop and keeps it in a monitored standstill.

### Recommendation

A three-layer sequence with one owner per layer:

1. **Network.** The supervisor sends SAFE_STOP, or a node stops receiving commands for 200 ms.
2. **Node.** The drive ramps down at `accel_limit` and holds (SS2-like). On a fault or ESTOP, it goes Hi-Z (STO).
3. **Power.** The smart bus bar opens that drive's 48 V branch if the node does not report a safe state within a bound. That gives a hardware STO that does not depend on the node's firmware.

### Consequences

- PRD F-04 is rewritten to match the ATOS API, and the "no braking" wording goes.
- The bus bar needs per-branch switching that is fast enough and does not cause a voltage spike when it opens under regen.
- A drive on its logic feed (the "Port power" decision) can still report after layer 3 cuts its power.

### Settled 2026-10-19

- On e-stop the Racer does not push energy back onto the bus. It stops the motor with its brake resistor and, later, an active-release solenoid disk brake.

### Questions to settle

- What bound for layer 3? The 200 ms watchdog plus ramp time at the default 200 rpm/s is over a second at speed.
- What happens at layer 3 when the bus bar opens a branch while the motor is generating?
- Does the brake solenoid run from the drive's motion output (any cut engages it), with a 300 to 500 ms hardware hold-up so the electrical stop happens first?

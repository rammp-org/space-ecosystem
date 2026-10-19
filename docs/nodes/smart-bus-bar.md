---
name: Smart bus bar
full: SPACE smart bus bar
pillar: P
stage: concept
order: 6
mcu: ESP32-S3 + W5500 (proposed, shares the Racer stack)
link: 100BASE-TX via W5500 (proposed)
power: 48 V nominal (40 to 54 V), XT90 in, XT30/XT60 out, ~14 outputs
repos: []
---

Concept brief written October 2026 and shared with hardware collaborators, who are reviewing the requirements. No schematic yet. The passive [power bus Gen 1.5](power-bus.md) is the board it replaces.

## The problem

The chair's bus bar is copper today: battery in, a dozen loads out, nothing in between. A faulting drive blows a fuse or nothing does. A low battery browns everything out together. Nothing on the network knows what any load draws.

## First target: the RAMMP wheelchair base

Battery is 48 V nominal lithium, roughly 40 to 54 V operating. The bus bar does not talk to the BMS and treats the pack as a voltage source with a known voltage-to-charge curve.

| Load class | Count | Peak each | Notes |
|---|---|---|---|
| Rugged drive wheels | 2 | 1000 W | Racer drives, regen onto the bus |
| Indoor drive wheels | 4 | 300 W | Racer drives, regen onto the bus |
| Seating and positioning | 6 | 100 W | Racer drives, brief duty |
| Computer, arm, peripherals | 1 to 2 | 300 W total | Must survive e-stop |

The theoretical sum is about 4 kW, so a pack-level budget matters as much as per-output limits. Communication does not go over the power connector. Every load is on Ethernet separately.

## What it does

Protection per output, in three layers:

1. Hardware, microseconds: short-circuit and gross overcurrent trip in the switch, independent of firmware, set around 2x the class's expected draw and fixed per power class. Controlled inrush into each load's DC-link capacitance.
2. Firmware, milliseconds to seconds: a power contract (continuous current, peak current and duration, minimum voltage). On violation the output takes its configured response: an immediate cut, or a request to the load to stop safely followed by a cut after a timeout.
3. System, low rate: pack budget, low-battery shedding by output priority, and reports to the network about what it shed.

Other behaviour from the brief:

- The load declares its power contract over the network when it comes up. People do not type limits into the bus bar.
- Sensing is bidirectional because drives regenerate. A drive output is stopped first, then cut.
- E-stop is a two-channel hardware input that disables every motion output through a path that bypasses the MCU. Compute, the screen, and the bus bar's own controller stay powered.
- It publishes like a Racer: per-output state at 10 to 20 Hz (V, I, P, energy, temperature, state, latched fault), a pack message (V, total I, estimated charge, shed level), and on any trip an event plus a high-rate capture of the moments before it.
- Battery health comes from comparing sag against load (a 1 kW draw explains a sag that a 100 W draw does not) and from coulomb counting.

## Settled in early discussion

- Output design is a parametric block: one topology whose current class changes with a part or two (MOSFET, shunt, sense range). A universal port with dual-range sense is welcome if the cost is reasonable, but it is not a requirement. Higher power classes take priority over lower ones.
- The e-fuse only needs to catch hard shorts and runaway, so a trip around 2x the expected draw is fine.
- Loads at 100 W and below will likely run on PoE instead, and anything under 56 W certainly will.
- On e-stop the Racer stops its motor with its own brake resistor and, later, an active-release solenoid disk brake. It does not push energy back onto the bus.
- The hardware e-fuse class is fixed per output by part population. A load's declared contract must fit inside it, or the bus bar refuses and flags it.
- High-power output target: 1 kW at 48 V (25 A continuous at a 40 V pack), ±50 A sense range, 10 mA resolution, ±0.5 % of reading. A slow precision monitor (for example INA228/INA229 class) for telemetry and coulomb counting, plus a fast path for the hardware trip and the pre-trip capture.
- Regen energy dumping is the load's job. Each Racer carries its own brake resistor for when its output is cut or the battery disconnects. Otherwise the battery and BMS absorb regen.

## Open

- Switch and sense topology: hot-swap controller with external MOSFETs, or an integrated eFuse where current allows.
- Reverse blocking: a single high-side MOSFET passes regen through its body diode even when off. Back-to-back MOSFETs on the drive outputs, everywhere, or nowhere for the prototype?
- Whether drive outputs are fully reverse-blocking (recommended) while compute and accessory outputs use a plain high-side FET.
- One board, or a controller board plus output boards. Left to the hardware collaborators.
- Mapping outputs to network identities, since power and data arrive on separate connectors. Candidates: a provisioning table, a boot-time handshake where the load draws a recognisable current pattern, or pairing each output with a switch port ([ADR-0009](../adr/0009-identity-from-topology.md)).
- Who owns the e-stop (recommended: the bus bar): it takes the e-stop out of band from Ethernet, cuts motion outputs, and publishes the STO event and any faults to the network.
- Shed sequence for a chair on a slope. This needs testing.

## Out of scope

BMS design or a BMS link. PoE injection and USB-PD for network-powered modules are worth a separate discussion.

## Plan

Agree a rough architecture, then a spec. Build schematic blocks that can be tested individually, or one prototype board. Bench it against an electronic load, then try it on the chair. Publish schematics under an open hardware licence with a test report in the style of the Racer's.

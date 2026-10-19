---
title: Open questions
subtitle: PRD v0.1 §17 questions, where each one stands now, plus new ones.
---

| # | Question (PRD v0.1 §17) | Where it stands | Goes to |
|---|---|---|---|
| Q1 | What does ATOS stand for, and what does ABC bridge to first? | ATOS now names the RTPS network the chair runs on. The expansion is still unrecorded. The MIB took ABC's supervisor role. | [ADR-0002](adr/0002-zonal-architecture.md) |
| Q2 | Two Racers per chair, or one dual-motor V2? | Open. Two boards are on the chair now. A P4 makes dual-motor easier. | [ADR-0010](adr/0010-node-mcu-and-phy-platform.md) |
| Q3 | ROS 2 standard messages or PACE IDL? | Answered in practice: `rammp-rtps` structs are the wire truth. A ROS 2 mapping package is still open. | [ADR-0007](adr/0007-edge-wire-protocol.md) |
| Q4 | Bus operating range, and bus-voltage sensing? | Range is 40 to 54 V (bus bar brief). The smart bus bar measures the bus and publishes a pack message. | [ADR-0002](adr/0002-zonal-architecture.md) |
| Q5 | Heartbeat-loss stop bound | 200 ms watchdog is in firmware. The ramp time on top of it is not bounded. | [ADR-0005](adr/0005-stop-sequence-ss1.md) |
| Q6 | Regen: into the pack, or dissipate? | Into the pack. Each Racer carries its own brake resistor for when its output is cut (bus bar brief). | [ADR-0002](adr/0002-zonal-architecture.md) |
| Q7 | Encoder strategy at speed | `atos-drive` is hall-only. Encoder use on the chair is open. | Racer V2 |
| Q8 | Hardware licence | Open. | |
| Q9 | External users in the next 12 months | Open. This also decides whether this site can stay public. | |

## New questions

| # | Question | Goes to |
|---|---|---|
| N1 | What exists of the smart bus bar? | Concept brief, under review by hardware collaborators. See [Smart bus bar](nodes/smart-bus-bar.md) |
| N2 | Is the MIB the zone's brain, or a node that talks to zones? | [ADR-0002](adr/0002-zonal-architecture.md) |
| N3 | The MIB README plans PoE to the Racers. Keep it, or drop it for single-pair? | [ADR-0004](adr/0004-two-power-domains.md) |
| N4 | What is on the `eth_pcb_dev` branch of `RAMMP-Electronics`? | |
| N5 | What is the status of IEEE 802.3da (power over 10BASE-T1S multidrop), and can we buy parts? | [ADR-0004](adr/0004-two-power-domains.md) |

## Grilling session, 2026-10-19

### Settled

| # | Decision | Recorded in |
|---|---|---|
| G4 | On e-stop the Racer does not push energy back onto the bus. It stops the motor with its own brake resistor and, later, a mechanical brake (an active-release disk brake with a solenoid). | [Smart bus bar](nodes/smart-bus-bar.md), [ADR-0005](adr/0005-stop-sequence-ss1.md) |
| G7 | The hardware e-fuse class is fixed per output by part population. A load's declared contract is accepted only if it fits inside that class. A load that asks for more is refused and flagged. | [Smart bus bar](nodes/smart-bus-bar.md) |
| G7a | High-power output target: 1 kW at 48 V, 10 mA resolution. Proposed spec: 25 A continuous (1 kW at a 40 V pack), ±50 A sense range for pre-trip capture, 10 mA resolution, ±0.5 % of reading accuracy. Slow precision monitor for telemetry and coulomb counting, plus a fast path for the hardware trip and the capture. | [Smart bus bar](nodes/smart-bus-bar.md) |

Note on G4: on the NineBot hub (λ = 0.026 Wb, 15 pole pairs) the peak line back-EMF at 483 rpm is about 34 V, below the 40 to 54 V bus. A coasting wheel with the bridge off pushes no current until roughly 650 to 700 rpm. The brake resistor handles active braking after the bus is gone and the overspeed case.

### Open, with the recommended answer

| # | Question | Recommendation |
|---|---|---|
| G1 | Does S stand for Sensing or Sensors? The bus bar brief says Sensors, ADR-0001 says Sensing. | Sensing |
| G2 | Authority split: the bus bar owns power and e-stop, the MIB owns motion intent, every node owns its local safety. | Yes. "No central controller" becomes "no single node that every function depends on". |
| G3 | The bus bar owns the e-stop: a two-channel hardware input opens every motion output without passing through the MCU, then firmware publishes ESTOP/STO on the network. No separate wire to each Racer. | Yes. Replaces the per-zone loop in ADR-0006. |
| G5 | Adopt the firmware's stop behaviour: SAFE_STOP and command loss ramp then hold; ESTOP and faults go Hi-Z. Rewrite PRD F-04. | Yes |
| G6 | Every Racer, seating included, gets a bus bar output. Low-power RJ45 nodes use PoE (802.3bt, up to about 71 W at the device). Single-pair power over data is limited to small sense nodes (about 20 W and under). | Yes. Rewrites ADR-0004's logic-power plan. |
| G8 | Drive outputs (1 kW and 300 W) are fully reverse-blocking, so an off output is off in both directions. Compute and accessory outputs use a plain high-side FET. | Yes |
| G9 | The brake solenoid runs from the drive's motion output, so any cut engages the brake without firmware. A hardware hold-up of about 300 to 500 ms lets the electrical stop happen first. | Yes, hold-up length set on the bench |

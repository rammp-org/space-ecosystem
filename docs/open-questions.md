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

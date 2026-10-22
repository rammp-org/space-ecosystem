---
question: "What voltage and power path does each kind of port get?"
area: Power
status: leaning
source: "October deck; bus bar brief; grilling 2026-10-19"
order: 8
draft: true
---

## Where it is leaning

Leaning the deck's rule: drives sit on the battery bus (12 to 48 V) and are never PoE. Every other module is Ethernet or PoE. Secondary ports get bus-set voltages. Single-pair power over data, if used, is only for small sensing modules (about 20 W and under).

## Why

PoE (802.3bt, up to about 71 W at the device) is mature and cheap. Alex expects loads at 100 W and below to be PoE, and anything under 56 W certainly. The 100 W seating actuators are Racers, so they stay on the bus.

## Next

Settle the PoE budget per module.

## Background (Claude draft, 2026-10-19, not reviewed)

### Context

The Racer makes its logic rails from the 48 V input. When the DRV8353 latches a VDS fault, an ESP reset does not clear it, and only a VM power cycle does (issue #4, H-11). Cutting VM also kills the MCU, so the board goes dark at the moment someone most needs to know why.

PoDL (IEEE 802.3bu) carries DC power on the same pair as point-to-point single-pair data. The classes top out around 50 W. That is enough for logic, sensors, and small accessories, and far short of a 1 kW drive. Multidrop power over 10BASE-T1S is the subject of IEEE 802.3da. Its status and the availability of parts need checking before we depend on it.

The MIB README plans "PoE to the Racers". PoE needs a 4-pair or 2-pair RJ45 link and a PD controller. That conflicts with a single-pair plan.

### Recommendation

- **Actuation domain:** 48 V nominal from the smart bus bar, switched per branch, only for power stages.
- **Logic domain:** each node's MCU, PHY, and sensors run from a logic feed that stays up when its actuation branch is off. That feed is PoDL on point-to-point links. On multidrop segments it is either 802.3da or a separate low-voltage pair in the same cable.
- A node reports `actuation_power: present/absent` as part of its status.

### Consequences

- H-11 is closed at the system level: the bus bar can cycle a drive's 48 V branch while the drive stays online and reports.
- Racer V2 needs a second power input, or a PoDL powered-device front end, plus isolation between the two domains.
- The MIB's PoE plan needs to be dropped or confined to the compute tier.

### Questions to settle

- PoDL for logic, or a plain 24 V rail in the harness? PoDL saves a pair but adds a PD front end on every node.
- What is the status of 802.3da, and do we wait for it?
- Do small seat actuators run from the logic domain (≤ 50 W) or need an actuation branch?

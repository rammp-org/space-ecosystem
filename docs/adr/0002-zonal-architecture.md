---
id: "0002"
title: Zonal architecture
status: proposed
date: 2026-10-19
pillars: [P, C]
prd: ["§6.1", "§3.3", "§9.2", "Eco-5"]
---

## Context

PRD v0.1 drew a flat star: a host, an Ethernet switch, Racers and ABC hanging off it, and a 48 V bus marked "TBD". The power bus Gen 1.5 is passive. The MIB has become the de facto supervisor and DHCP server. Smart bus bars and managed switches give us a place to put power switching, network switching, and supervision in one physical location per region of the chair.

Car makers moved to a zonal layout for the same reasons: a high-bandwidth backbone to compute, and zone controllers that distribute power through electronic fuses and switch data to short single-pair links at the edge.

## Options

1. Keep the flat star. Add smart features to the bus bar as a separate network node.
2. Zones, where the zone is one board: smart bus bar plus managed switch plus power injection for edge logic.
3. Zones, where the zone is two co-located boards: a smart bus bar and a switch board, joined by a short harness.

## Recommendation

Option 3 to start, designed so it can merge into option 2 later. Power electronics and switch silicon have different revision rates and failure modes. A 48 V, high-current layout and a multi-PHY switch layout are hard to get right on the same board in the first revision. Keeping them separate lets the switch be bought (ADR-0012) while the bus bar is built.

## Consequences

- The P pillar's first smart node becomes a foundation item. In the PRD it was Eco-5, the last ecosystem step.
- H-11 (VM disconnect), H-14 (regen), E-08 (fabric e-stop), and B-05 (supervisor) all move to the zone.
- ABC shrinks to a legacy-serial gateway, or the zone absorbs it.
- The MIB's role needs a decision: zone brain, or a supervisor node that talks to zones.

## Questions to settle

- One board or two for the first revision?
- How many zones on a chair: one central zone, or front and rear?
- Where does the MIB's logic live?
- Who owns the smart bus bar today, and what exists of it?

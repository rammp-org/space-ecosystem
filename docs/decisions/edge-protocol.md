---
question: "Do small modules on shared segments run full RTPS discovery?"
area: Network
status: parked
source: "Claude draft, 2026-10-19"
order: 25
draft: true
---

## Context

Revisit once single-pair segments exist.

## Background (Claude draft, 2026-10-19, not reviewed)

### Context

RTPS is the network contract, and `rammp-rtps` defines topics and XCDR1 structs shared by every node. RTPS discovery (SPDP/SEDP) is multicast and chatty: a 204 B announcement per participant, then endpoint discovery for every writer and reader. On a 10 Mb/s half-duplex segment with eight sense nodes, discovery traffic is a real share of the budget, and each small MCU has to hold a proxy for every remote participant.

The bench already hit two discovery problems. IGMP snooping without a querier dropped multicast in one direction. espp rtps 1.2.0 leaked reader proxies on each MIB restart. The MIB now discovers boards by unicast from its DHCP lease table.

### Options

1. Full RTPS with standard discovery on every node, multidrop included.
2. RTPS with static or unicast discovery on multidrop segments (peer lists from DHCP or configuration).
3. A lighter protocol at the edge (for example zenoh-pico on the sense nodes), with the zone or MIB bridging to RTPS.

### Recommendation

Option 2. It keeps one wire format (`rammp-rtps` types) on every link, extends a pattern the MIB already uses, and avoids a bridge that would be one more thing to fail. Revisit option 3 if a sense segment shows discovery traffic above about 10 % of its capacity.

### Consequences

- `rammp-rtps` becomes the SPACE IDL. The PRD's `NodeStatus` (E-03) is defined there.
- Managed switches need an IGMP querier configured, or multicast flooding on the RTPS ports.
- The S pillar contract includes "discoverable by unicast" as a requirement.

### Questions to settle

- Does a sense node publish at a fixed rate, or on request? Fixed rate is simpler and is what `MotorState` does.
- Who hands out peer lists: DHCP options, the MIB, or the zone?

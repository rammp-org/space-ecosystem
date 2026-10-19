---
id: "0012"
title: Zone switch silicon, build or buy
status: proposed
origin: claude-draft
date: 2026-10-19
pillars: [C]
prd: ["§3.2 PACE Hub"]
---

## Context

A zone switch needs RJ45 ports for compute, 100BASE-T1 ports for the motion tier, 10BASE-T1S for sense segments, 802.1AS, IGMP querier support, and a small CPU for supervision and role assignment. Automotive switch SoCs exist that do most of this. The NXP SJA1110 family integrates 100BASE-T1 PHYs, a 100BASE-TX port, TSN features, and an on-chip Cortex-M7. Microchip's LAN966x family offers TSN switching with a Linux-capable core.

## Options

1. Buy an evaluation board or a commercial single-pair switch for the first zone. Build the bus bar only.
2. Build a zone board around a switch SoC from day one.
3. Build from discrete PHYs and an MCU with several MACs.

## Recommendation

Option 1 for the first prototype chair, then option 2. A commercial switch lets the bus bar, the stop sequence, and the edge nodes move forward without waiting on a switch layout.

## Questions to settle

- Budget and lead time for a commercial single-pair switch with 10BASE-T1S ports. These are less common than 100BASE-T1 ports.
- Does the supervisor (MIB logic) run on the switch SoC's core, or stay on a P4?

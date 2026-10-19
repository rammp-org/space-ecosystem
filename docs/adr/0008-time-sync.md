---
id: "0008"
title: Time-synchronised timestamps in the telemetry schema
status: proposed
origin: claude-draft
date: 2026-10-19
pillars: [S, C]
prd: ["§4.2 non-goals", "E-03"]
---

## Context

The PRD ruled out "multi-axis synchronisation, EtherCAT-class determinism". Managed switches change the cost. IEEE 802.1AS (gPTP) gives sub-microsecond time across a switched network if the switches support it, and most single-pair automotive switches do. 10BASE-T1S PLCA already bounds medium-access latency on a multidrop segment.

`MotorState` carries `position` and `velocity` but no time base shared with other nodes. Fusing an IMU with wheel odometry, or correlating a current spike with a load-cell step, needs one clock.

## Recommendation

Add a synchronised timestamp field to every SPACE message now, filled from the node's local clock until gPTP exists. Make gPTP a requirement on zone switches. Scheduled traffic (802.1Qbv) stays out of scope.

## Consequences

- An API version bump in `rammp-rtps`.
- Zone switch selection (ADR-0012) requires 802.1AS.
- Nodes without hardware timestamping get millisecond-class accuracy from software PTP, which is fine for telemetry and too coarse for control.

## Questions to settle

- Is there any control loop that crosses the network and needs a shared clock (both wheels in lockstep, for example), or is this telemetry only?

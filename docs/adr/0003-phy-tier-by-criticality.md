---
id: "0003"
title: Physical link chosen by criticality, not bandwidth
status: proposed
date: 2026-10-19
pillars: [S, A, C]
prd: ["§3.3 item 2", "E-02", "H-07"]
---

## Context

The PRD made 100BASE-TX on RJ45 the only network. Single-pair Ethernet gives three useful physical layers:

| PHY | Standard | Topology | Reach | Rate |
|---|---|---|---|---|
| 10BASE-T1S | IEEE 802.3cg | multidrop mixing segment (8+ nodes) or point-to-point | ~25 m | 10 Mb/s shared, half duplex, PLCA arbitration |
| 100BASE-T1 | IEEE 802.3bw | point-to-point | 15 m | 100 Mb/s full duplex |
| 100/1000BASE-T | 802.3u / 802.3ab | point-to-point, RJ45 | 100 m | 100/1000 Mb/s |

As far as we know there is no 100 Mb/s multidrop standard, so "100BASE-T1S" does not exist. Multidrop means 10 Mb/s. 100 Mb/s single-pair means one switch port per node.

Bandwidth is not what limits the Racer. Measured ceilings: UDP transmit 1457 pps at 64 B, receive saturation about 1247 pps, RTPS delivery 485 Hz. That is about 1 Mb/s effective, limited by the MCU and the SPI MAC. A wheel streaming `MotorState` at 20 Hz uses 1.6 kB/s. Two Racers and a handful of sensors fit inside one 10BASE-T1S segment.

## Options

1. Choose the PHY by bandwidth. Most nodes end up on 10BASE-T1S multidrop, the Racers included.
2. Choose the PHY by criticality. A node whose failure or misbehaviour can move the chair gets its own point-to-point link. Everything else can share.

## Recommendation

Option 2:

| Tier | Link | Nodes |
|---|---|---|
| Compute | RJ45 100/1000BASE-T | Jetson, Pi, laptops, cameras |
| Motion and command | 100BASE-T1 point-to-point (or 10BASE-T1S point-to-point) | Racers, HMI/joystick, MIB |
| Sense and accessory | 10BASE-T1S multidrop | IMU, load cells, limit switches, lights, small seat actuators |

On a multidrop segment, one shorted node or a broken stub takes out every node on it. PLCA bounds how long one node can transmit, but it cannot isolate a physical short. A wheel drive cannot share that failure with a cup-holder light.

## Consequences

- E-02 changes from "all nodes on 100BASE-TX" to "all nodes on IP over the PHY of their tier".
- Zone controllers need some of each port type.
- The Racer V2 PHY choice is ADR-0010.

## Questions to settle

- Is a 10BASE-T1S point-to-point link acceptable for a drive? It is cheaper and keeps the ESP32-S3.
- Which accessory actuators (seat, tilt, leg rests) count as "can move the person"? Those belong in the motion tier.

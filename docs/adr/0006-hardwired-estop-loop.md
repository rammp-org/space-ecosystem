---
id: "0006"
title: Keep a hardwired e-stop loop alongside the network
status: proposed
date: 2026-10-19
pillars: [P, C]
prd: ["E-08", "S-02", "§16"]
---

## Context

The current stop paths are all software on a network: the MIB's deadman, the per-board 200 ms watchdog, and ESTOP as a requested state. Standard Ethernet is not a safety-rated channel. Functional-safety protocols (FSoE, PROFIsafe, openSAFETY) treat the network as a "black channel" and put CRCs, sequence counters, and watchdogs in a certified layer on each end. We have none of that.

## Options

1. Network only. Rely on the watchdog design.
2. A hardwired normally-closed e-stop loop through every zone, which drops the actuation branches in hardware, plus the network stop.
3. A black-channel safety protocol over Ethernet, with no hardwired loop.

## Recommendation

Option 2 now. Option 3 is a later research item. A two-wire loop is cheap. It is the path a reviewer will expect on a human-carrying platform, and it works when every MCU on the chair has crashed.

## Consequences

- The zone harness gets a loop pair. The smart bus bar's branch switches open when the loop opens.
- The HMI's red button wires into the loop and also sends a network SAFE_STOP, so the drives ramp before the bus bar cuts power.

## Questions to settle

- Button-to-loop wiring through the HMI PCB, or a separate e-stop puck?
- Does opening the loop go straight to STO, or give the drives a short SS1 ramp first?

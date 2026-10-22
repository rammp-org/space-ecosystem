---
title: Architecture
subtitle: Proposed zonal layout for SPACE. Nothing here is decided until the matching decision is.
---

## Reference topology

<div class="ax-legend"><span style="--c:var(--ax-s1)">Data, RJ45</span><span style="--c:var(--ax-s5)">Data, single pair</span><span style="--c:var(--ax-s2)">48 V actuation</span><span style="--c:var(--ax-s4)">Hardwired e-stop loop</span></div>

<figure class="diagram">
<svg viewBox="0 0 960 520" role="img" aria-label="Zonal architecture diagram">
  <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="var(--ax-border)" stroke-width="1"/></pattern></defs>
  <!-- compute -->
  <rect class="box" x="360" y="16" width="240" height="56"/><text class="t" x="480" y="40">COMPUTE</text><text class="s" x="480" y="58">Jetson / Pi / laptop · ROS 2</text>
  <line x1="480" y1="72" x2="480" y2="128" stroke="var(--ax-s1)" stroke-width="2.5"/><text class="lbl" x="490" y="104" text-anchor="start">100/1000BASE-T</text>
  <!-- battery -->
  <rect class="box" x="24" y="150" width="150" height="56"/><text class="t" x="99" y="174">BATTERY</text><text class="s" x="99" y="192">48 V nominal</text>
  <line x1="174" y1="178" x2="250" y2="178" stroke="var(--ax-s2)" stroke-width="4"/>
  <!-- zone -->
  <rect class="zone" x="250" y="128" width="460" height="120"/>
  <text class="t" x="480" y="148">SPACE ZONE</text>
  <rect class="box" x="266" y="160" width="200" height="74"/><text class="t" x="366" y="186">SMART BUS BAR</text><text class="s" x="366" y="204">pre-charge · per-branch eFuse</text><text class="s" x="366" y="220">V/I telemetry · STO on loop open</text>
  <rect class="box" x="494" y="160" width="200" height="74"/><text class="t" x="594" y="186">MANAGED SWITCH</text><text class="s" x="594" y="204">gPTP · IGMP querier · LLDP</text><text class="s" x="594" y="220">PoDL injection · port roles</text>
  <!-- racers -->
  <rect class="box" x="40" y="380" width="150" height="64"/><text class="t" x="115" y="406">RACER L</text><text class="s" x="115" y="424">drive_left</text>
  <rect class="box" x="220" y="380" width="150" height="64"/><text class="t" x="295" y="406">RACER R</text><text class="s" x="295" y="424">drive_right</text>
  <path d="M310 234 V300 H115 V380" fill="none" stroke="var(--ax-s2)" stroke-width="4"/>
  <path d="M330 234 V310 H295 V380" fill="none" stroke="var(--ax-s2)" stroke-width="4"/>
  <path d="M520 248 V330 H135 V380" fill="none" stroke="var(--ax-s5)" stroke-width="2.5"/>
  <path d="M540 248 V340 H315 V380" fill="none" stroke="var(--ax-s5)" stroke-width="2.5"/>
  <text class="lbl" x="40" y="464" text-anchor="start">motion tier: 100BASE-T1 p2p + PoDL, one 48 V branch each</text>
  <!-- HMI / MIB -->
  <rect class="box" x="420" y="380" width="150" height="64"/><text class="t" x="495" y="406">HMI / JOYSTICK</text><text class="s" x="495" y="424">p2p · e-stop button</text>
  <path d="M570 248 V380 H545" fill="none" stroke="var(--ax-s5)" stroke-width="2.5"/>
  <rect class="box" x="760" y="150" width="176" height="56"/><text class="t" x="848" y="174">MIB / SUPERVISOR</text><text class="s" x="848" y="192">deadman · DHCP · roles</text>
  <line x1="710" y1="178" x2="760" y2="178" stroke="var(--ax-s5)" stroke-width="2.5"/>
  <!-- T1S segment -->
  <path d="M660 248 V300 H930" fill="none" stroke="var(--ax-s5)" stroke-width="2.5" stroke-dasharray="1 0"/>
  <text class="lbl" x="676" y="292" text-anchor="start">10BASE-T1S multidrop · PLCA</text>
  <g class="drop"><line x1="680" y1="300" x2="680" y2="330"/><line x1="760" y1="300" x2="760" y2="330"/><line x1="840" y1="300" x2="840" y2="330"/><line x1="920" y1="300" x2="920" y2="330"/></g>
  <rect class="box sm" x="640" y="330" width="80" height="40"/><text class="s" x="680" y="354">IMU</text>
  <rect class="box sm" x="720" y="330" width="80" height="40"/><text class="s" x="760" y="354">load cell</text>
  <rect class="box sm" x="800" y="330" width="80" height="40"/><text class="s" x="840" y="354">limits</text>
  <rect class="box sm" x="880" y="330" width="70" height="40"/><text class="s" x="915" y="354">seat act.</text>
  <!-- e-stop loop -->
  <path d="M495 444 V490 H20 V240 H280 V234" fill="none" stroke="var(--ax-s4)" stroke-width="2" stroke-dasharray="6 4"/>
  <text class="lbl" x="40" y="508" text-anchor="start">NC e-stop loop: opening it drops every actuation branch in hardware</text>
</svg>
<figcaption><b>Fig. 1.</b> One zone shown. A chair may have one central zone or a front and a rear zone (the "Zones" decision). Logic power rides on each single-pair link and is not drawn separately.</figcaption>
</figure>

## Tiers

| Tier | Link | Nodes | Decision |
|---|---|---|---|
| Compute | RJ45 100/1000BASE-T | Jetson, Pi, cameras | [Physical layer](decisions/physical-layer.md) |
| Motion and command | 100BASE-T1 point-to-point | Racers, HMI, MIB | [Physical layer](decisions/physical-layer.md) |
| Sense and accessory | 10BASE-T1S multidrop | IMU, load cells, limits, small actuators | [Physical layer](decisions/physical-layer.md), [Edge protocol](decisions/edge-protocol.md) |

## Power domains

| Domain | Source | Feeds | Decision |
|---|---|---|---|
| Actuation | Smart bus bar, 48 V branches | Power stages only | [Port power](decisions/port-power.md) |
| Logic | PoDL, or a 24 V harness rail | MCU, PHY, sensors | [Port power](decisions/port-power.md) |

## Stopping

| Layer | Owner | Trigger | Action | Decision |
|---|---|---|---|---|
| Network | MIB / supervisor | joystick released, planner stop | SAFE_STOP to each drive | [Stop behaviour](decisions/stop-behaviour.md) |
| Node | Racer | SAFE_STOP, 200 ms command silence | ramp at `accel_limit`, then hold | [Stop behaviour](decisions/stop-behaviour.md) |
| Node | Racer | ESTOP, guard fault | bridge Hi-Z | ATOS motor API |
| Power | Smart bus bar | node not safe within bound | open the drive's 48 V branch | [Stop behaviour](decisions/stop-behaviour.md) |
| Hardware | E-stop loop | button pressed, loop broken | open every actuation branch | [E-stop chain](decisions/estop-chain.md) |

## Changes from PRD v0.1

| PRD item | Was | Proposed |
|---|---|---|
| §3.2 pillars | P, A, C | S, P, A, C ([Rename to SPACE](decisions/rename-to-space.md)) |
| §3.3 item 1 | one 48 V class for every node | two power domains |
| §3.3 item 2, E-02 | 100BASE-TX everywhere | IP everywhere, PHY by tier |
| §4.2 non-goal | no multi-axis sync | gPTP timestamps in every message ([Time sync](decisions/time-sync.md)) |
| §6.1 topology | flat star | zones |
| F-04 | stop always coasts | SAFE_STOP holds, ESTOP coasts |
| H-07 | "on-board Ethernet" | MCU/PHY platform choice ([MCU class](decisions/mcu-class.md)) |
| H-11, H-14, E-08 | Racer or ABC problems | zone and bus bar responsibilities |
| Eco-5 | first P node is the last step | smart bus bar is a foundation item |

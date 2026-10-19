---
title: Status since PRD v0.1
updated: 2026-10-19
# Requirement statuses that have moved since PRD v0.1 (2026-09-14).
# The site starts from the PRD's requirements register and applies these on top.
overrides:
  - id: F-01
    status: Partial
    note: "ATOS motor API v2 (rammp-rtps MotorCommand/MotorState). v1 verified on one board 2026-09-26; both chair drive boards run v2 since 2026-10-15. Not yet run with two boards under load."
    source: rammp-rtps/docs/RACER-MOTOR-API.md
  - id: F-10
    status: Partial
    note: "200 ms command watchdog is in firmware. It ends in SAFE_STOP then an active HOLD, which differs from the PRD's coast-out STOPPING. See ADR-0005."
    source: rammp-rtps/docs/RACER-MOTOR-API.md
  - id: E-08
    status: Partial
    note: "Per-board watchdog exists. The MIB owns the deadman (joystick released means SAFE_STOP). No fabric-wide e-stop yet."
    source: rammp-rtps/docs/RACER-MOTOR-API.md
  - id: H-09
    status: Partial
    note: "Console, firmware update and reset over Ethernet (tcp :5555, discovery udp :5556) since 2026-10-15. No secondary UART header yet."
    source: pace-racer-fw feat/atos-drive
  - id: B-05
    status: Open
    note: "Supervisor role went to the MIB, not ABC. Revisit ABC's scope in ADR-0002."
    source: RAMMP-mib-fw
---

The PRD was frozen on 2026-09-14. Work has moved on in other repos since then. This page records what changed so the status view is current without rewriting the PRD.

## Firmware and network

- The Racer got a production app, `atos-drive` (branch `feat/atos-drive` in `pace-racer-fw`). It is hall-only, has a hard speed cap in every mode, and implements the ATOS motor API.
- The wire contract moved into a shared repo, `rammp-org/rammp-rtps`. It holds topic names, XCDR1 structs, and the axis table (`front_caster_left`, `front_caster_right`, `drive_left`, `drive_right`). This answers most of PRD open question 3: the project already chose its own IDL-as-C++-structs over ROS 2 standard messages.
- espp rtps moved from 1.2.0 to 1.3.3 on 2026-10-09. 1.3.3 fixes a reader-proxy leak on MIB restarts. The MIB-restart case has not been re-run on the bench since.
- A switch with IGMP snooping and no querier broke SPDP discovery in one direction. The MIB now discovers boards by unicast from its DHCP lease table. This matters for the managed-switch decisions.

## Nodes the PRD did not list

- MIB (MEBot Interface Board), ESP32-P4, `RAMMP-mib-fw`. It is the supervisor: it runs DHCP, commands each wheel, and owns the deadman. Its README lists "control of PACE RACER motor controllers over PoE" as planned work.
- HMI / joystick, M5Stack Tab5 (ESP32-P4) on the RAMMP HMI PCB, W5500 Ethernet, `pace-hmi-fw`. Its UI follows RAMMP UI spec V2 and is in daily use.
- Power bus Gen 1.5, `RAMMP-Electronics` branch `Gen1.5_powerbus` (Ariana, 2026-10-07). It is a passive distribution board: XT90 in, four XT60 out.
- Brake resistor, `pace-brake-r`. It is a KiCad design for protecting the battery from regen on high-power controllers. It bears on PRD open question 6.
- Dyno torque bench, `dynopace`. A MotorGo Plink reads a DY-N-200 torque sensor over RS485.

## New direction (not yet in the PRD)

- The project renamed PACE to SPACE (ADR-0001).
- Smart bus bars, managed switches, and single-pair Ethernet with power over data lines. The proposed decisions ADR-0002 through ADR-0012 cover these.

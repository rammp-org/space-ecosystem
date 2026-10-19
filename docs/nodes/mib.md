---
name: MIB
full: MEBot Interface Board
pillar: C
stage: in development
order: 3
mcu: ESP32-P4
link: Ethernet (RTPS); README plans PoE to the Racers
power: TBD
repos: [rammp-org/RAMMP-mib-fw]
---

The chair's supervisor. It runs DHCP for the drive boards, commands each wheel over ATOS, publishes `mib/status` for the HMI, and owns the deadman: joystick released means SAFE_STOP, joystick silent means stop requesting ARMED.

The PRD did not list this node.

## Planned (from its README)

- Positional control with MCP266 motor controllers
- Communications and control of PACE Racer motor controllers over PoE
- IMU, software limit switches, MT6701 and carriage encoders, load cells

## Questions for SPACE

- The MIB is already the supervisor and the DHCP server. Is it the zone controller's brain, or does it stay a separate node that talks to zones? See [ADR-0002](../adr/0002-zonal-architecture.md).
- The README says PoE to the Racers. That conflicts with single-pair Ethernet with power over data lines. See [ADR-0004](../adr/0004-two-power-domains.md).
- Its sensor inputs (IMU, load cells, limit switches) are the first candidates to move onto 10BASE-T1S sense nodes.

---
name: HMI
full: RAMMP HMI / joystick (RJM)
pillar: C
stage: in use
order: 4
mcu: ESP32-P4 (M5Stack Tab5)
link: 100BASE-TX via W5500 (SPI)
power: TBD
repos: [rammp-org/pace-hmi-fw, rammp-org/pace-hmi-pcb, rammp-org/pace-hmi-gui]
---

Touch HMI and 3D hall joystick (X, Y, twist), haptics over a DRV2605. It follows RAMMP UI spec V2: locked, drive, seat, settings, diagnostics, log and bench screens.

The PRD listed "PACE Stick" as a future candidate. This node already exists.

## Questions for SPACE

- The joystick is the highest-consequence input on the chair. It needs a point-to-point link plus the hardwired e-stop under [ADR-0003](../adr/0003-phy-tier-by-criticality.md) and [ADR-0006](../adr/0006-hardwired-estop-loop.md), not a multidrop slot.
- It is an ESP32-P4 with a W5500, so it could use the P4's RMII MAC instead. That is evidence for [ADR-0010](../adr/0010-node-mcu-and-phy-platform.md).

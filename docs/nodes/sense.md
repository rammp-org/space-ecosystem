---
name: Sense nodes
full: SPACE sense nodes
pillar: S
stage: concept
order: 8
mcu: TBD
link: 10BASE-T1S multidrop (proposed)
power: PoDL or zone 24 V (proposed)
repos: []
---

No dedicated sensing node exists yet. Sensing work is spread across other projects:

- `vibration-logging`: LSM6DSOX IMU at 6.66 kHz on a Raspberry Pi 5.
- `dynopace`: DY-N-200 torque sensor over RS485 on a MotorGo Plink.
- `teensy_brain2` in `RAMMP-Electronics`: a load-cell sheet.
- MIB plans: IMU, limit switches, carriage encoders, load cells.

These are the natural first 10BASE-T1S multidrop nodes under [ADR-0003](../adr/0003-phy-tier-by-criticality.md). Every node also senses (the Racer has four thermal zones, phase current, and an encoder), so part of the S pillar is a telemetry contract, not just a board class.

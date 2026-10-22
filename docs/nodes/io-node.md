---
name: I/O node
full: SPACE I/O node and safety I/O
stage: concept
order: 8
mcu: TBD
link: RTPS net (PHY open); single-pair Ethernet proposed for small ones
power: PoE, or single-pair power for small ones
repos: []
kind: module
family: I/O node
pillars: [S, C]
---

From the October deck. The module that brings sensors, switches, and devices too small to be their own RTPS node onto the network.

## What it does

- A native RTPS participant that publishes an ATOS manifest for everything behind it.
- Secondary bus ports: CAN, RC servo PWM, Dynamixel TTL and RS-485, Qwiic and STEMMA QT.
- Digital and analog I/O for bumpers, cliff sensors, and switches, plus e-stop and bumper inputs for safety I/O.
- A watchdog over every device it fronts, with a safe state for each.
- Secure boot and OTA as a secondary agent under the main ATOS agent.

The deck's goal: adding a sensor should be as easy as on Arduino. Plug it into a Qwiic port on an I/O node and it appears on the network with a manifest.

## Related

- [ABC](abc.md) is the first, very early member of this family: an Ethernet bridge with GPIO.
- Sensing work that could move onto I/O nodes: `vibration-logging` (LSM6DSOX IMU at 6.66 kHz on a Pi 5), `dynopace` (DY-N-200 torque sensor over RS485), the load-cell sheet in `RAMMP-Electronics`, and the MIB's planned IMU, limit-switch, encoder, and load-cell inputs.
- Small I/O nodes are the natural first users of single-pair Ethernet. See the [Physical layer](../decisions/physical-layer.md) decision.

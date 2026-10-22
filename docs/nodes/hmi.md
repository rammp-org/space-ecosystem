---
name: HMI
full: RAMMP joystick / HMI (name to confirm)
stage: in use
order: 4
mcu: ESP32-P4 (M5Stack Tab5)
link: 100BASE-TX via W5500 (SPI)
power: TBD
repos: [rammp-org/pace-hmi-fw, rammp-org/pace-hmi-pcb, rammp-org/pace-hmi-gui]
kind: application
family: RAMMP chair
pillars: [C, S]
---

An application: several SPACE pieces put together for the chair. M5Stack Tab5 (ESP32-P4) with a touch screen, a 3D hall joystick (X, Y, twist), haptics over a DRV2605, and Ethernet RTPS with PoE. It runs the same espp stack as the Racer.

From the deck: "a PACE node that happens to be a screen". The chair's controller owns the state; the HMI shows it and asks for changes. If status is lost for two seconds the screen says link lost and refuses drive and seat. Seat commands are absolute targets, so a lost or repeated packet cannot drift the seat. Calibration, settings, self test, and logs all live on the node.

The UI follows RAMMP UI spec V2: locked, drive, seat, settings, diagnostics, log, and bench screens.

## Questions for SPACE

- The joystick is the highest-consequence input on the chair. It needs a point-to-point link and the e-stop chain. See [Physical layer](../decisions/physical-layer.md) and [E-stop chain](../decisions/estop-chain.md).
- Which SPACE modules is it made of, and which parts are chair-specific? See [Modules vs applications](../decisions/modules-vs-applications.md).

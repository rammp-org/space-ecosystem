---
name: ABC
full: ATOS Bridge Comms
stage: bring-up
order: 2
mcu: ESP32 (WROOM-32UE)
link: 100BASE-TX, LAN8720A over RMII
power: 5 V
repos: [pace-abc/ATOS-Bridge-Comms (local)]
kind: module
family: I/O node
pillars: [C]
---

A small module that bridges things too small to be their own RTPS node onto ATOS: an Ethernet bridge with GPIO. The example use is a single button somewhere on the wheelchair. Very preliminary.

Hardware today: plain ESP32 (WROOM-32UE), LAN8720A PHY over RMII, USB-C with a CH340C, draft layout finished, LED and UDP-echo bring-up firmware written.

## Where it fits

- It belongs to the [I/O node](io-node.md) family. It could become the smallest member of that family, or a prototype for it.
- PRD v0.1 gave ABC the supervisor role. That role went to the MIB application instead.

## Open

- Is ABC a separate module, or the first revision of the I/O node?

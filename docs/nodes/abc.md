---
name: ABC
full: ATOS Bridge Comms
pillar: C
stage: bring-up
order: 2
mcu: ESP32 (WROOM-32UE)
link: 100BASE-TX, LAN8720A over RMII
power: 5 V
repos: [pace-abc/ATOS-Bridge-Comms (local)]
---

Ethernet to UART/USB bridge. Draft layout finished. LED and UDP-echo bring-up firmware written.

## Where it stands

- The PRD gave ABC the supervisor role (B-05). The MIB took that role instead, so ABC's scope is now a bridge between legacy serial equipment and the SPACE network, plus a bench DHCP server.
- ATOS is the robot software platform that SPACE is the Layer 1 hardware profile for.

## Open

- Does ABC survive a zonal architecture, or does the zone controller absorb it? See [ADR-0002](../adr/0002-zonal-architecture.md).

---
name: Racer
full: SPACE Racer V1R2
pillar: A
stage: validated
order: 1
mcu: ESP32-S3
link: 100BASE-TX via W5500 breakout (SPI, shared with DRV8353)
power: 48 V bus (bench PSU today)
repos: [rammp-org/pace-racer-fw, rammp-org/pace-racer-hardware]
---

A 1 kW-class BLDC FOC driver: TI DRV8353 gate driver, three low-side shunts, MT6701 encoder input, halls, four LM75ADP thermal zones.

## Where it stands

- Dyno campaign done: 1049.5 W bus at 483 rpm, 78 % system efficiency, three commutation modes on one board. Full numbers are in the [PRD baseline](../../PACE_ECOSYSTEM_PRD.md#13-measured-performance-baseline).
- Production app `atos-drive` implements the ATOS motor API v2. Both chair drive boards run it as of 2026-10-15. It has not yet run with two boards under load.
- Console and firmware update work over Ethernet since 2026-10-15, so a board inside a wheel no longer needs USB.

## What SPACE changes for it

- The W5500 breakout is the weakest part of the network story (H-07). Under [ADR-0010](../adr/0010-node-mcu-and-phy-platform.md), V2 picks between an SPI 10BASE-T1S MAC-PHY (keeps the ESP32-S3) and ESP32-P4 + RMII + a 100BASE-T1 PHY.
- Under [ADR-0003](../adr/0003-phy-tier-by-criticality.md), drive nodes get a point-to-point link even though their traffic fits on 10 Mb/s.
- Under [ADR-0004](../adr/0004-two-power-domains.md), logic power separates from the 48 V input, which fixes the DRV8353 latch-needs-VM-cycle problem (H-11) at the system level.

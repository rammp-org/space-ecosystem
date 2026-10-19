---
name: Zone controller
full: SPACE zone controller
pillar: C
stage: concept
order: 9
mcu: TBD (switch SoC with an on-chip core?)
link: Backbone 100/1000BASE-T; edge 100BASE-T1 and 10BASE-T1S
power: Feeds logic power to edge nodes
repos: []
---

Proposed in [ADR-0002](../adr/0002-zonal-architecture.md): a managed switch with single-pair ports and power injection, either built into the smart bus bar or next to it. It handles time sync, link supervision, port-based identity ([ADR-0009](../adr/0009-identity-from-topology.md)), and the network side of the stop sequence.

Build-or-buy for the switch silicon is [ADR-0012](../adr/0012-zone-switch-build-vs-buy.md).

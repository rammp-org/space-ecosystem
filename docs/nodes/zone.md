---
name: Zone controller
full: SPACE zone controller
stage: concept
order: 9
mcu: TBD (switch SoC with an on-chip core?)
link: Backbone 100/1000BASE-T; edge 100BASE-T1 and 10BASE-T1S
power: Feeds logic power to edge nodes
repos: []
kind: module
family: Net infrastructure
pillars: [C]
---

Proposed in [Zones](../decisions/zones.md): a managed switch with single-pair ports and power injection, either built into the smart bus bar or next to it. It handles time sync, link supervision, port-based identity ([Output identity](../decisions/output-identity.md)), and the network side of the stop sequence.

Build-or-buy for the switch silicon is [Zone switch](../decisions/zone-switch.md).

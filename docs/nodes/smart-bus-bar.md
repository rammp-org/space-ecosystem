---
name: Smart bus bar
full: SPACE smart bus bar
pillar: P
stage: concept
order: 6
needs_info: true
mcu: TBD
link: TBD (zone switch?)
power: 48 V actuation bus distribution
repos: []
---

**Needs input from Alex.** The docs record no design, repo, or owner for the smart bus bar. Fill in what exists.

## What the decisions assume it does

From [ADR-0002](../adr/0002-zonal-architecture.md) and [ADR-0004](../adr/0004-two-power-domains.md):

- Pre-charge of the 48 V bus.
- Per-branch switching with electronic fusing, so one drive can lose motor power without the others.
- Bus voltage and per-branch current telemetry, published like any other node.
- The power side of the stop sequence: opening a branch after a node fails to reach a safe state ([ADR-0005](../adr/0005-stop-sequence-ss1.md)).
- A home for regen handling, alongside or instead of `pace-brake-r`.

## Questions

- Who is building it, and where is the work?
- Same board as the zone switch, or separate? This is the first grilling topic.
- 48 V only, or 48 V plus a 24 V logic/sensor rail?

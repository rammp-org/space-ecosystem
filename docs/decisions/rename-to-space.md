---
question: "Do we rename PACE to SPACE?"
area: Scope
status: decided
source: "Alex, October 2026"
order: 0
---

## Answer

Yes. SPACE: Sensing, Power, Actuation, and Control Electronics.

## Why

Sensing kept coming up without a place in the name. Every module senses something (current, temperature, position), and the I/O node exists mostly to bring sensors onto the network.

## Next

Existing repo names stay for now. See "When do the pace-* repos and hostnames take the SPACE name?"

## Background

### Context

PACE stood for Power, Actuation, and Control Electronics. Sensing kept turning up in every design discussion without a place in the taxonomy. The Racer has four thermal zones, three-phase current sense, an encoder input, and halls. The MIB plans IMU, load-cell, and limit-switch inputs. Sensing work like `vibration-logging` and `dynopace` sits outside the ecosystem entirely.

### Decision

The ecosystem is SPACE: Sensing, Power, Actuation, and Control Electronics. Sensing becomes a pillar with its own node class and contract.

### Consequences

- New docs, topics, and hostnames use SPACE. Existing repo names (`pace-racer-fw`, `pace-hmi-fw`, `pace-brake-r`) keep their names for now. A repo rename breaks submodules and CI badges, so it waits for a natural break.
- PRD v0.1 stays as a dated baseline under its old name. The next PRD revision is the SPACE PRD.
- The S pillar contract covers dedicated sense nodes and also the telemetry every node publishes about itself.

### Questions to settle

- Does the `pace-<class>-<serial>` hostname rule (PRD §3.3 item 7) become `space-<class>-<serial>` now, or at the next firmware release?
- Do the existing repos get renamed, and when?

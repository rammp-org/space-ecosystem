---
question: "How does the bus bar know which module is on which output?"
area: Power
status: open
source: "Bus bar brief"
order: 15
draft: true
---

## Context

Power and data arrive on separate connectors. Candidates: a provisioning table a person fills in; a boot-time handshake where the load draws a recognisable current pattern; or pairing each output with a switch port so the harness defines the mapping.

## Background (Claude draft, 2026-10-19, not reviewed)

### Context

Today a Racer learns its role by someone typing `axis 2` on its console, stored in NVS. A board swapped between wheels keeps its old axis until someone re-provisions it. The MIB maps axes to addresses through its DHCP lease table.

A managed switch knows which physical port each node is plugged into, and LLDP lets both ends advertise themselves.

### Recommendation

- **Identity:** the eFuse-derived MAC is the node's serial number. It never changes.
- **Role:** the zone port the node is plugged into determines its role (`drive_left`, `drive_right`), from a per-chair table. A node learns its role from the zone at boot. A board moved to another port takes the new role.
- A console `axis` override stays for the bench.

### Consequences

- Swapping a wheel drive becomes plug-and-play. The harness defines the chair, not NVS.
- Zone firmware needs a port-to-role table and a way to hand it out (DHCP option, LLDP, or an RTPS topic).

### Questions to settle

- Is accidental role swapping (plugging the left drive into the right port) a hazard? With per-port roles it is impossible by design. With NVS roles it is a provisioning error.

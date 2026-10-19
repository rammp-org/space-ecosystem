---
name: Power bus Gen 1.5
full: RAMMP power bus Gen 1.5
pillar: P
stage: schematic
order: 5
mcu: none
link: none
power: XT90 in, 4x XT60 out
repos: [rammp-org/RAMMP-Electronics (branch Gen1.5_powerbus)]
---

Passive distribution board by Ariana. Schematic and power/ground connections committed 2026-10-07. A 24 V power bus variant lives on branch `task/2-24V-powerbus-pcb`, and an Ethernet PCB experiment on `eth_pcb_dev`.

It has no switching, sensing, or network interface. The smart bus bar is the step after it.

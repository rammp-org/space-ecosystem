---
name: Brake resistor
full: SPACE Brake-R
stage: layout
order: 7
mcu: none
link: none
power: 48 V bus, dissipates regen
repos: [rammp-org/pace-brake-r]
kind: module
family: Power distribution
pillars: [P]
---

Brake resistor circuit that protects the battery on high-power motor controllers. KiCad design in the repo.

It is the current answer to PRD open question 6 (regen policy) and requirement H-14. In a zonal architecture, the question is whether it stays a separate board or becomes a function of the smart bus bar.

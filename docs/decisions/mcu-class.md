---
question: "Which MCU class: one ESP32 part, or Cortex-M allowed behind the same firmware interface?"
area: Platform
status: open
source: "October deck"
order: 28
draft: true
---

## Context

ESP32-S3 and P4 work today: WiFi, cheap, big community, classic CAN only. Cortex-M parts such as STM32 have more deterministic peripherals and no WiFi. Every module needs a current loop, an RTPS participant, and local trajectories with headroom.

## Background (Claude draft, 2026-10-19, not reviewed)

### Context

The ESP32-S3 has no Ethernet MAC. The Racer uses a W5500 on SPI, which caps it at about 1 Mb/s effective and shares a bus with the gate driver. The ESP32-P4 has an RMII MAC. The MIB and HMI already run on the P4, so it is already in the fleet.

Single-pair options:

- 10BASE-T1S over SPI: Microchip LAN8650/8651 (MAC-PHY, OPEN Alliance TC6 SPI). This fits the W5500's slot. Espressif publishes a LAN865x driver in `esp-eth-drivers`; check it against IDF v6.0.
- 10BASE-T1S PHY over RMII: Microchip LAN8670 and similar, on a P4.
- 100BASE-T1 PHY over RMII: TI DP83TC81x, NXP TJA110x, Microchip LAN8770, on a P4.

### Options

1. Stay on the ESP32-S3. Single-pair means 10BASE-T1S over SPI.
2. Move to the ESP32-P4 for motion-tier nodes. Use 100BASE-T1 over RMII.
3. Split: P4 for motion and command nodes, S3 (or smaller) for sense nodes on 10BASE-T1S.

### Recommendation

Option 3. The Racer's FOC firmware is tuned to the S3 (IRAM placement, ISR priorities, cache sizing), so porting it is a cost, not a free upgrade. The P4 brings a real MAC, more SRAM, and parity with the MIB and HMI. Sense nodes stay small and cheap.

### Consequences

- The Racer V2 decision becomes "port FOC to the P4" or "stay S3 with a LAN8651 and accept 10BASE-T1S point-to-point". The dual-motor question (PRD Q2) is easier on the P4.
- Two BSP families to maintain.

### Questions to settle

- Has anyone measured the P4's ADC against the S3's corruption problems?
- Is 10BASE-T1S point-to-point enough for a drive (see the "Physical layer" decision)? If yes, option 1 for the Racer V2 is the low-risk path.

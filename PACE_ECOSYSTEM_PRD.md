# PACE Ecosystem — Product Requirements Document

**PACE — Power, Actuation, & Control Electronics**

| | |
|---|---|
| Document | PACE Ecosystem PRD |
| Version | 0.1 (draft) |
| Date | 2026-09-14 |
| Owner | Alex Chunlin (alex@assistivetech.dev) |
| Status | Draft for review |
| Scope | Whole ecosystem: hardware, firmware, comms, bench/characterization tooling, host software, roadmap |

> **How to read this document.** Everything marked **[MEASURED]** is backed by a bench run or a commit in the existing repos and is cited. Everything marked **[PROPOSED]** is a recommendation in this draft that has not been agreed. Requirement rows carry a status of **Met / Partial / Open** against the current hardware (PACE Racer V1R2) and firmware (`v0.1.0`+, branch `feat/bench-campaign`). Open questions are collected in §15.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Background and motivation](#2-background-and-motivation)
3. [Vision and ecosystem definition](#3-vision-and-ecosystem-definition)
4. [Goals and non-goals](#4-goals-and-non-goals)
5. [Users and personas](#5-users-and-personas)
6. [Ecosystem architecture](#6-ecosystem-architecture)
7. [Component: PACE Racer V1R2 hardware](#7-component-pace-racer-v1r2-hardware)
8. [Component: PACE Racer firmware](#8-component-pace-racer-firmware)
9. [Component: ATOS Bridge Comms (ABC)](#9-component-atos-bridge-comms-abc)
10. [Component: Bench, dyno, and characterization tooling](#10-component-bench-dyno-and-characterization-tooling)
11. [Component: Host software and telemetry](#11-component-host-software-and-telemetry)
12. [Requirements register](#12-requirements-register)
13. [Measured performance baseline](#13-measured-performance-baseline)
14. [Known issues and technical-debt register](#14-known-issues-and-technical-debt-register)
15. [Roadmap](#15-roadmap)
16. [Risks](#16-risks)
17. [Open questions](#17-open-questions)
18. [Glossary](#18-glossary)
19. [References](#19-references)

---

## 1. Executive summary

PACE is a family of open, instrumented power-and-motion electronics for assistive mobility and robotics platforms. Its first and currently only production-track component is the **PACE Racer V1R2**, a 1 kW-class field-oriented-control (FOC) BLDC motor driver built around an ESP32-S3 and a TI DRV8353 gate driver, with three-phase low-side current sensing, an off-board magnetic encoder, hall inputs, four on-board thermal zones, and Ethernet via a WIZnet W5500 on the expansion header.

The Racer has been taken through a full characterization campaign on a magnetic-particle-brake dyno. Headline results **[MEASURED]**:

- **1049.5 W bus power** at 483 rpm / 16.1 N·m, **78 % system efficiency**, on the stock 0.20 V VDS over-current threshold (2026-08-27).
- **400.1 ± 0.75 rpm speed hold** through a closed-loop 2 → 10 → 2 N·m torque staircase.
- **Three commutation modes** validated on one board: encoder-commutated (MT6701), hall-commutated (calibrated table), and sensorless (flux-linkage observer with I/f start and current-decay handoff).
- **Ethernet and FOC coexist**: speed regulation unchanged under saturating bidirectional traffic; RTPS/DDS telemetry delivered at up to **485 Hz** against a 10 Hz target (~48× margin).

The second ecosystem node, **ATOS Bridge Comms (ABC)**, is a plain-ESP32 Ethernet/USB-UART bridge board with a LAN8720A PHY, currently at draft-layout + bring-up stage.

This PRD (a) captures the current state of both boards, the firmware, and the bench so that the next revisions are specified against evidence rather than memory; (b) defines the ecosystem the boards belong to — the shared conventions for power, comms, safety, and telemetry that make a PACE node a PACE node; and (c) proposes a roadmap from "one validated driver" to "a family of interoperable nodes on a wheelchair-class mobility platform".

---

## 2. Background and motivation

### 2.1 The application

The reference application is the **MEBot** family of mobility-enhancement robotic wheelchairs (repos `MeBot/`, `mebot-power-testing/`). The current-generation MEBot drive path uses a commercial **R-Net** power module and a Teensy/Raspberry Pi control stack; the MEBot 3.0 README documents an in-progress design change "switching the rnet module to in-house-design … controller for controlling the main wheels". PACE is that in-house design, generalized.

Concretely, the drive requirement that fell out of MEBot is: **a wheelchair hub-motor drive (NineBot S class, 15 pole pairs, 48 V) that can be commanded over a real network, instrumented at control-loop rate, and characterized on a dyno** — none of which the R-Net module allows.

### 2.2 Why build rather than buy

| Need | Off-the-shelf drives (R-Net, hobby ESCs, ODrive-class) | PACE Racer |
|---|---|---|
| Control-loop-rate telemetry (20 kHz internal, hundreds of Hz on the wire) | Not exposed / proprietary | `cap` ring buffer + RTPS stream [MEASURED] |
| Sensorless + hall + encoder on one board, switchable at runtime | Rare | Yes [MEASURED] |
| Deterministic Ethernet (DDS-compatible) | No (CAN / UART / USB) | Yes, W5500 + RTPS [MEASURED] |
| Per-zone board thermal telemetry with firmware thermal guard | No | 4× LM75ADP, 80 °C guard [MEASURED] |
| Open hardware + firmware for research modification | No | Yes (`rammp-org/pace-racer-hardware`, MIT-licensed firmware) |
| Gentle, non-braking fault response (assistive-safety requirement) | Typically hard brake / disable | Closed-loop unload → Hi-Z coast [MEASURED] |

### 2.3 What has been proven so far

The campaign timeline, reconstructed from git history and bench notes:

| Date | Milestone |
|---|---|
| 2026-07 (early) | BSP, DRV8353 and LM75ADP components, bring-up firmware (PRs #1–#7) |
| 2026-07-21 → 07-26 | Sensorless FOC bring-up: PWM-synced current sampling, ADC-corruption root-causing, flux observer validated against halls, I/f→closed-loop handoff |
| 2026-07-27 | Dyno first light; absolute-floor handoff fix; λpm measured 0.026 |
| 2026-07-30 | Hall-commutated variant forked (`halls-sensorless/`) |
| 2026-08-03/04 | Ethernet/FOC coexistence campaign; instruction-cache + IRAM fix (2.2–3.0× UDP ceiling) |
| 2026-08-19/20 | Six-figure characterization: R/L/J ident, autotune, disturbance rejection, thermal (heatsinked), torque linearity, 514 W peak |
| 2026-08-24/25 | RTPS rerun on espp v1.2.0: 485 Hz delivered, coexistence reconfirmed |
| 2026-08-26/27 | The 1 kW chase: 400 rpm torque wall → crossed on speed at 483 rpm; 1049.5 W bus; torque-servo load staircase |
| 2026-08 | ABC draft layout complete; LED and Ethernet (UDP echo) bring-up firmware |

---

## 3. Vision and ecosystem definition

### 3.1 Vision statement

> **PACE is the electronics layer that lets an assistive-mobility platform be a robot.** Every PACE node speaks the same network, reports the same telemetry, obeys the same safety envelope, and can be characterized on the same bench — so a wheelchair, an exoskeleton joint, or a research rig can be assembled from nodes rather than re-engineered each time.

### 3.2 The three pillars

The acronym is the product taxonomy. Each pillar is a class of node with a shared contract (§3.3).

| Pillar | What it covers | Current member(s) | Candidate future members [PROPOSED] |
|---|---|---|---|
| **P — Power** | Battery interface, bus distribution, pre-charge, isolation, rail generation, energy telemetry | (none yet — the bench BK supply plays this role) | PACE Bus (48 V distribution + pre-charge + e-stop), PACE Cell (battery/BMS interface), low-noise instrumentation rails (cf. `mebot-power-testing` 10 V load-cell rail study) |
| **A — Actuation** | Motor and actuator drivers: BLDC, brushed, linear, pneumatic | **PACE Racer V1R2** (1 kW BLDC FOC) | PACE Racer V2 (integrated Ethernet, hardened current sense), PACE Sprinter (low-power BLDC for seat/leg actuators), PACE Lifter (brushed/linear actuator driver) |
| **C — Control / Comms** | Network bridges, gateways, supervisors, HMI/joystick interfaces | **ATOS Bridge Comms (ABC)** | PACE Hub (multi-port switch + supervisor), PACE Stick (joystick/HMI node), PACE Sense (IMU / load-cell node) |

### 3.3 What makes a node a PACE node [PROPOSED]

These are the ecosystem-level contracts. They are what this PRD adds beyond the individual board specs. Each is expanded into requirements in §12.

1. **Common bus voltage class**: 48 V nominal (36–54 V operating) for actuation-class nodes; 5 V / 3.3 V logic derived locally. Bench today assumes exactly 48 V.
2. **Common network**: Ethernet (100BASE-TX) as the primary command/telemetry fabric; **RTPS/DDS** as the wire protocol so ROS 2 hosts subscribe natively. UDP/CSV and the USB console remain as bench/debug paths.
3. **Common telemetry schema**: every node publishes a `NodeStatus` topic (identity, uptime, faults, temperatures) and a node-class topic (for Racer: the FOC snapshot — `mode, id, iq, iqref, vd, vq, aerr, rpm_*, flux, t0–t3`).
4. **Common safety envelope**: (a) layered protection — software plausibility/slew filters that *never* trip, a software soft-trip that unloads gently, and a hardware latch as last resort; (b) "gentle by default" — no fault response may itself inject a torque or current transient larger than the fault it is responding to; (c) a network-independent local thermal guard.
5. **Common bring-up contract**: every board ships with a `bringup` firmware that prints a pass/warn/fail CSV, and a `README` with the pin map.
6. **Common tooling**: every node is characterizable on the PACE bench (§10) through the same `bench_mcp` interface.
7. **Common identity**: MAC derived from the MCU eFuse (W5500 has no burned MAC); hostname `pace-<class>-<serial>` [PROPOSED].

### 3.4 Naming convention [PROPOSED]

`PACE <Name> V<major>R<rev>` — e.g. PACE Racer V1R2. Major = electrical architecture change; Rev = layout/BOM iteration on the same architecture. Firmware tags follow semver (`v0.1.0` today) and record the hardware revision they were validated on.

---

## 4. Goals and non-goals

### 4.1 Goals

| ID | Goal | Success measure |
|---|---|---|
| G1 | A 1 kW-class BLDC drive validated on a dyno, with published numbers | ≥1 kW bus, ≥75 % system efficiency, documented envelope — **met** (§13) |
| G2 | Drive a wheelchair hub motor in all three commutation modes without hardware changes | Encoder, hall, sensorless all closed-loop on the same PCB — **met** |
| G3 | Network-native: commands and telemetry over Ethernet/DDS with no measurable effect on control quality | coalesce 1.00, rpm sd unchanged under saturation — **met** |
| G4 | Safety envelope suitable for a human-carrying platform | Gentle stop path, thermal guard, layered OCP — **met at bench level; not yet reviewed against a standard** (see §17) |
| G5 | A second node type on the same network conventions | ABC at layout + Ethernet bring-up — **partial** |
| G6 | Reproducible characterization: anyone with the bench can regenerate every figure | `bench_report.py` + committed logs — **met** for the Racer |
| G7 | Move from "one board" to "an ecosystem": shared contracts (§3.3), shared BSP patterns, shared host tooling | **open** — this PRD is the first artifact |

### 4.2 Non-goals (for this PRD cycle)

- Medical-device regulatory submission (IEC 60601, ISO 7176-14). PACE is a research/pre-production platform; §17 lists what a later cycle would need.
- Consumer-grade enclosure, ingress protection, or connectorization.
- Wireless (Wi-Fi/BLE) as a control path. The ESP32-S3 radio is available but out of scope for control; it may be used for bench convenience only.
- Multi-axis synchronization / EtherCAT-class determinism. DDS best-effort at hundreds of Hz is the target.
- Battery chemistry / BMS design (belongs to the future P-pillar).

---

## 5. Users and personas

| Persona | Needs from PACE | Primary touchpoints |
|---|---|---|
| **Drive/firmware engineer** (today: the owner) | Fast iteration on FOC, sampling, safety; reliable console; deterministic build | ESP-IDF project, BSP, console CLI, `s`/`c`/`cap` diagnostics |
| **Bench/characterization engineer** | Safe, scriptable stand; regenerate figures; know the gotchas | `bench_lib`, `bench_mcp`, `bench_report.py`, bench README |
| **Platform integrator** (MEBot team) | Mount a Racer per wheel, plug into Ethernet, publish setpoints, read status, trust the fault behaviour | RTPS topics, `NodeStatus`, pin map, connector spec, power-up sequence |
| **Robotics/ROS 2 developer** | Subscribe to telemetry, publish commands, no custom drivers | DDS discovery, IDL types, `telem_sub` reference |
| **Researcher / external collaborator** | Open hardware and firmware they can modify; documented decisions | GitHub repos, engineering notes (`SENSORLESS_FOC.md`, `ETHERNET_FOC_COEXISTENCE.md`) |
| **Clinician / end-user (indirect)** | Smooth, predictable, quiet motion; no violent fault responses | The safety envelope; the "gentle by default" principle |

---

## 6. Ecosystem architecture

### 6.1 Reference topology [PROPOSED, built from current parts]

```
                 ┌────────────────────────────────────────────┐
                 │  Host (ROS 2 / Mac / Pi)                    │
                 │  - DDS participant(s)                       │
                 │  - telem_sub, monitor.py, bench_mcp          │
                 └───────────────┬────────────────────────────┘
                                 │ 100BASE-TX
                 ┌───────────────┴────────────────────────────┐
                 │  Ethernet fabric (switch or point-to-point) │
                 └──┬───────────────┬───────────────┬─────────┘
                    │               │               │
        ┌───────────┴───┐   ┌───────┴───────┐   ┌───┴──────────────┐
        │ PACE Racer #L │   │ PACE Racer #R │   │ ATOS Bridge Comms│
        │ (A-pillar)    │   │ (A-pillar)    │   │ (C-pillar)       │
        │ ESP32-S3      │   │ ESP32-S3      │   │ ESP32 + LAN8720A │
        │ DRV8353       │   │ DRV8353       │   │ UART/USB bridge  │
        │ W5500 (SPI)   │   │ W5500 (SPI)   │   │ RMII Ethernet    │
        └──┬────┬───┬───┘   └──┬────┬───┬───┘   └───┬──────────────┘
           │    │   │          │    │   │           │ UART
        motor enc halls     motor enc halls     legacy / R-Net / Teensy
           │                   │
        ┌──┴───────────────────┴──┐
        │ 48 V bus (P-pillar TBD: │
        │ today = bench PSU)      │
        └─────────────────────────┘
```

### 6.2 Layering

| Layer | Contents | Where it lives today |
|---|---|---|
| Hardware | Racer V1R2 PCB, ABC PCB, off-board encoder, W5500 breakout | `rammp-org/pace-racer-hardware`, `pace-abc/ATOS-Bridge-Comms` (KiCad) |
| Board support | `espp::PaceRacerBoard` singleton; `drv8353`, `lm75adp` components | `pace-racer-fw/components/` |
| Control | FOC sampler + math + observer + hall drive + mode state machine | `halls-sensorless/main/` (active), `sensorless/` (frozen), `current-control/` (frozen reference) |
| Comms | espp::Ethernet (W5500), lwIP, RTPS engine (espp v1.2.0), UDP sink, USB-JTAG console | BSP + app |
| Host | `monitor.py`, `telem_sub`, `udpload.py`/`udprecv.py`, `bench_lib`, `bench_mcp.py`, `bench_report.py` | `halls-sensorless/bench/`, `tests/host_sub/`, `data-reports/` |

### 6.3 Execution model on a Racer node **[MEASURED]**

- **Sampling ISR** — CPU0, fired at MCPWM timer peak (TEP = the null vector on this board), one ADC conversion per 50 µs PWM period (20 kHz), phases A/B alternating, C reconstructed. Integer-only. Runs the glitch-filter stack and the soft-trip check, then notifies the FOC task.
- **FOC task** — CPU1, high priority, woken per sample. Clarke → Park → 2× PI → inverse Park → SVPWM → `set_pwm`; also the observer, handoff state machine, speed loop; publishes a seqlock snapshot.
- **Stream task** — CPU0, 10 Hz CSV, DRV fault poll (5 s), trip reports, Hi-Z coast handshake.
- **Network tasks** — lwIP, RTPS writer(s), UDP sink. lwIP must **not** be pinned to CPU0.
- **Console** — CPU0, line-based over USB-serial-JTAG.

Design rules that fell out of the campaign and now bind the ecosystem:
1. MCPWM ISR priority 2 (not 0, not 3) — 0 loses to SPI/I2C/Ethernet and produces late samples; 3 starves console, telemetry and watchdog while driving.
2. 32 KB instruction cache + FOC task in IRAM — 2.2–3.0× UDP transmit ceiling.
3. Telemetry task must have a real priority; at priority 0 it starves ~25 % under saturating traffic.
4. Never toggle a debug GPIO on an ADC-adjacent pin of the unit being sampled.

---

## 7. Component: PACE Racer V1R2 hardware

### 7.1 Identity

| | |
|---|---|
| Name | PACE Racer V1R2 |
| Class | A-pillar — BLDC FOC motor driver, 1 kW class |
| Hardware repo | `github.com/rammp-org/pace-racer-hardware` |
| MCU | ESP32-S3 module (dual-core Xtensa LX7, USB-serial-JTAG) |
| Gate driver | TI DRV8353 (SPI mode 1, on SPI2, CS = IO39) |
| Power stage | 3-phase MOSFET bridge, low-side 1 mΩ shunts per phase, FET thermal-via pads (heatsinks fitted on the bench unit) |
| Bus | 48 V nominal (bench-characterized at exactly 48 V) |

### 7.2 Interfaces **[MEASURED — from BSP and bench notes]**

| Interface | Detail |
|---|---|
| Motor phases | A, B, C; current sense on ADC1 (GPIO4/5/6), reference channel |
| Encoder | MT6701 magnetic encoder, SSI on **SPI3** (SCLK 37 / MISO 35 / CS 38), off-board |
| Halls | 3 inputs (GPIO3, GPIO9 — both ADC1-adjacent; see §14) |
| Temperature | 4× LM75ADP on internal I2C at 0x4C, 0x4D, 0x4E, 0x4F |
| Ethernet | WIZnet W5500 breakout on the SPI expansion header, **SPI2 shared with DRV8353** (CLK 12 / MOSI 11 / MISO 13, CS 10, RST 21, IRQ 14). No burned MAC — derived from eFuse. |
| LEDs | Blue (GPIO42), green (GPIO41), LEDC PWM with breathing helper |
| Expansion | Headers for I/O, SPI, I2C, UART |
| Console/flash | USB-serial-JTAG, 115200 |

### 7.3 Electrical envelope **[MEASURED]**

| Parameter | Value | Source |
|---|---|---|
| Peak bus power, clean | **1049.5 W** at 483 rpm / 16.1 N·m | 2026-08-27 ladder `ladder_1kw_f_500rpm` |
| Mechanical output at that point | 816 W (78 % system efficiency) | same |
| Earlier torque-route peak | 514 W bus at 150 rpm, >500 W for ~11 s, ended by the 35 A guard | 2026-08-19/20 |
| Phase current, software ceilings | console clamp ≤ 30 A, soft trip ≤ 35 A (`kHardMaxTripAmps` raised 35 → 45 for the 1 kW chase) | firmware |
| Hardware OCP (DRV8353 VDS) | levels 0–6 exposed; stock 0.20 V threshold sufficed for 1 kW; ~17–22 A instantaneous at level 0–4 cold, derates with FET temperature | firmware + bench |
| Voltage limit | `vl` ≤ 26 V (SVPWM linear-region edge ≈ 48/√3 = 27.7 V) | firmware |
| Thermal | Locked-rotor 20 A DC hold plateaus at **48 °C** with heatsinks (VDS-tripped without); thermal guard 80 °C | fig 4 / 4.1 |
| ADC current-sense rail | reported by `z` as `#range`; soft trip is blind beyond it | firmware |

### 7.4 Hardware findings that must feed V1R3 / V2 [MEASURED → PROPOSED]

| Finding | Evidence | Proposed change |
|---|---|---|
| Hall lines routed on ADC1-adjacent pins inject async noise into current samples | `SENSORLESS_FOC.md` §3 mechanism 3 | Move halls off ADC1 pin group; add RC/Schmitt conditioning |
| Phase-C sense channel condemned early, later shown to be generic ADC corruption | §3 | Restore lowest-two-duty phase selection in firmware; keep C in hardware |
| SAR ADC bit-flips when PWM edges land mid-conversion | §3 mechanism 2 | Consider external simultaneous-sampling ADC or the DRV8353's CSA outputs with S/H; at minimum, guarantee null-window ≥ 2× conversion time at max modulation |
| Intermittent VDS faults naming **phase-B high-side** at low current near stress transients, not reproducible cold | bench gotcha list | Gate-drive scope session before extending envelope; review B-HS gate loop / bootstrap |
| FET thermal path needed add-on heatsinks to survive 20 A DC | fig 4.1 | Design-in heatsink / thermal-pad + mounting to chassis |
| W5500 is a breakout on the expansion header, sharing SPI2 with the gate driver | BSP README | Integrate Ethernet on-board (W5500 or RMII PHY as on ABC), dedicated SPI host |
| No factory MAC | BSP | Add EEPROM with EUI-48 or keep eFuse derivation as the ecosystem rule |
| Current-sense conversion factor is still a placeholder in the BSP (`CURRENT_SENSE_MV_TO_A`) | BSP README note 6 | Calibrate and burn per-board; clamp cross-check was within 6 % |
| DRV8353 VDS latch survives ESP reset, needs VM power-cycle | §4 safety table | Firmware-controllable VM pre-charge/disconnect (P-pillar hook) |
| Console (USB-JTAG) wedges; only USB re-enumeration clears | bench gotchas | Secondary UART console on the expansion header; wedge detection |
| Encoder at 1 kHz BSP update lags 36 elec-deg at 400 rpm | bench hardware map | Higher encoder rate or hall/observer at speed; V2: consider ABZ/UVW encoder interface |

---

## 8. Component: PACE Racer firmware

### 8.1 Stack **[MEASURED]**

- ESP-IDF **v6.0.0**, C++ with the **espp** component set (`bldc_driver`, `bldc_motor`, `mt6701`, `ethernet`, `cli`, `pid`, `filters`, `task`, `timer`, …). espp **v1.2.0** provides the RTPS engine.
- Repo layout: `main/` (board-level demo app), `components/pace-racer-board/` (BSP + apps: `bringup`, `example`, `ethernet`, `sensorless`, `halls-sensorless`), `components/drv8353/`, `components/lm75adp/`, `data-reports/`.
- Tooling: `clang-format` via pre-commit, GitHub Actions builds main + examples.
- Version `v0.1.0` (+30 commits at the RTPS rerun).

### 8.2 Feature inventory

| Feature | State | Notes |
|---|---|---|
| BSP singleton (`espp::PaceRacerBoard`) | Met | LEDs, I2C, ADC1, encoder, gate driver, motor, temperature sensors, Ethernet |
| Encoder-commutated FOC (espp `BldcMotor`, angle/velocity PID) | Met | Default config: 7 pp / 4 Ω / 320 KV demo motor in `main/`; NineBot params in the apps |
| Sensorless FOC (flux-linkage observer + PLL, I/f start, current-decay handoff, speed loop) | Met | Observer floor ~30–40 rpm at 24 V on the NineBot; `sensorless/` frozen |
| Hall-commutated FOC (measured sector table via `hcal`, interpolation, stall decay) | Met | Best mode at speed; used for the 1 kW result |
| PWM-synchronized low-side current sampling with glitch-filter stack | Met | Plausibility → slew (bounded escape) → median-of-3; late-entry ISR rejection |
| Layered protection (filters / soft trip / flux fail-safe / DRV VDS OCP / thermal guard) | Met | All software responses go through the same gentle STOPPING path |
| 20 kHz on-board capture ring (`cap`, `capdump`) | Met | Modes: pos/rpm/iq, iα/iβ/vα, drive-vs-encoder angle |
| R/L identification (`rl`), velocity/position autotune | Met | Fitted R line-line 0.332 Ω vs DMM 0.323 |
| Ethernet bring-up (DHCP/static, hostname, MAC, link/IP callbacks) | Met | Kconfig: `PACE_RACER_ETH_SPI_CLOCK_MHZ`, `PACE_RACER_ETH_HOSTNAME` |
| RTPS/DDS telemetry writer(s) | Met (bench) | 485 Hz ceiling; ≥5 writers fail to start |
| UDP CSV telemetry / sink | Met | |
| Console CLI (arming, run/stop, gains, limits, diagnostics) | Met | See `SENSORLESS_FOC.md` §5 and bench README |
| Command **ingress** over the network (setpoints from DDS) | **Open** | Only telemetry egress is validated; commands are console-only today |
| `NodeStatus` topic / ecosystem schema | **Open** | §3.3 item 3 |
| OTA / fleet update | **Open** | |
| Persistent per-board calibration (current-sense factor, encoder offset, hall table) | **Open** | Hall table and encoder offset are re-measured each session (`hcal`, `eofs` ≈ 352.5°) |
| Watchdog-supervised motion API for hosts | **Open** | Motion currently belongs to bench scripts with their own watchdog loops |

### 8.3 Control modes and state machine **[MEASURED]**

| Stream char | State | Angle source | Current target |
|---|---|---|---|
| `H` | HOLD | console `th` | console `id`/`iq` |
| `S` | SPIN: I/f | synthetic ramp | iq = run amps |
| `V` | SPIN: CONVERGE | synthetic ramp | iq decaying to 0.5 A floor |
| `C` | SPIN: CLOSED | flux observer | iq from speed loop |
| `L` / `W` / `Q` | HALL speed / sine / torque | calibrated hall table | speed loop / sine profile / absolute-angle stall torque |
| encoder modes (`erun`, `eiq`) | ENCODER | MT6701 | speed loop / direct iq |
| `X` | STOPPING | last frame | 0 (PI intact until coast) |

All exits — `stop`, soft trip, flux fail-safe, thermal guard, torque-ceiling revert — go through STOPPING → Hi-Z coast. No braking, no disarm on the software path.

### 8.4 Firmware requirements delta [PROPOSED]

See §12 F-series. The principal new work is command ingress, the ecosystem schema, persistent calibration, and a host-facing motion API with watchdog semantics.

---

## 9. Component: ATOS Bridge Comms (ABC)

### 9.1 Identity **[MEASURED — from KiCad + bring-up READMEs]**

| | |
|---|---|
| Name | ATOS-Bridge-Comms (ABC), formerly "Wham-Link" |
| Class | C-pillar — Ethernet ↔ UART/USB bridge node |
| Repo | `pace-abc/ATOS-Bridge-Comms` (KiCad project `ATOS-Bridge-Comms-core`) |
| MCU | ESP32-WROOM-32UE (plain ESP32, external antenna variant) |
| Ethernet | LAN8720A-CP PHY over RMII, 25 MHz oscillator (ECS-2520MV), RJ45 with integrated magnetics (RB1-125BAG1A), REF_CLK into GPIO0 |
| USB | USB-C (TYPEC-303-ACP16) → CH340C USB-UART, USBLC6-2P6 ESD, two-NPN (2SC4617R) auto-reset |
| Power | 5 V → AMS1117-3.3, reverse-protection diodes, ferrite |
| I/O | 2× 9-pin headers, 2×5 IDC, 3 tactile switches, 3 status LEDs (indicator on GPIO14, active-high) |
| Status | Draft layout finished; LED blink and Ethernet UDP-echo bring-up firmware written (`idf.py set-target esp32`) |

RMII pin map: REF_CLK GPIO0, MDC 23, MDIO 18, PHY nRST 5, TX_EN/TXD0/TXD1 21/19/22, RXD0/RXD1/CRS_DV 25/26/27.

### 9.2 Role in the ecosystem [PROPOSED]

ABC is the bridge between the PACE Ethernet fabric and legacy or serial-only equipment — the MEBot Teensy base, an R-Net controller during migration, a joystick, or a host that only has USB. It should:

1. Present itself on the fabric as a PACE node (`NodeStatus`, DDS discovery).
2. Tunnel one or more UARTs over UDP/DDS with framing and timestamps.
3. Act as a DHCP server / configuration portal for point-to-point bench links (already does: 192.168.4.1, UDP echo on 3333).
4. Optionally host the network **supervisor** role: heartbeat monitoring of Racers, e-stop broadcast.

"ATOS" expansion and the exact upstream system it bridges are **not recorded in the repos** — see §17.

---

## 10. Component: Bench, dyno, and characterization tooling

### 10.1 The stand **[MEASURED]**

| Item | Detail |
|---|---|
| Motor under test | NineBot S hub, 15 pp, R = 0.166 Ω/phase, L ≈ 395 µH, Kt = 0.60–0.62 N·m/A, J ≈ 0.106 kg·m² |
| Load | Magnetic-particle brake (200 N·m class; 1–8 N·m used), coil ≈ 7.6 Ω on Rigol DP2031 CH2 |
| Torque | Inline rotary sensor, 0–10 V (200 N·m/V via 10:1 probe), 24 V from DP2031 CH1 |
| Bus supply | BK MR3K160120 at 48 V, SCPI; **Vset never touched by tooling** |
| Scope | Rigol MHO984, LAN only (169.254.100.100:5555); phase-C 100 A clamp on CH2 |
| Encoder on stand | MT6701 geared 2.5:1 off the wheel (elec = 6× enc) — mount #1 died at 300 rpm wheel |
| Board USB | uhubctl-switchable hub port (console-wedge recovery) |

### 10.2 Software **[MEASURED]**

- `bench_lib.py` — Board / Psu / Brake / Scope abstractions, `ack()` with retries, `usb_replug()`, `vm_recover`.
- `bench_mcp.py` — MCP server: `bench_status`, `bench_up/down/arm`, `bench_brake_set/off`, `bench_psu_iset`, `bench_bus_read`, `bench_torque_read`, `bench_telemetry`, `bench_console`, `bench_usb_replug`, `bench_vm_recover`. **Setup + measure only; motion stays in watchdog scripts.**
- Campaign scripts: hall recal, power ladder, torque servo, `fig4_heatsink.py`, `fig6_edge.py`, `fig6_hold.py`.
- Reports: `bench_report.py` → `report/figures.html` (§1 ident, §2 speed regulation, §3 torque linearity, §4 thermal, §5/6 power & efficiency, §7 the 1 kW chase, §8 load staircase); `compile_report.py` for the hall campaign; per-run `report.md` in `data-reports/logs/`.

### 10.3 Bench requirements for the ecosystem [PROPOSED]

- Every PACE node type gets a `bench_*` profile in `bench_mcp` (ABC: link/echo/latency; future P-nodes: load-step, ripple — the `mebot-power-testing` ripple/PSD scripts are the seed).
- The speed campaign (500 rpm loaded ladder, endurance dwell to FET plateau) planned in the bench README is the next Racer dataset; it partially ran on 08-26/27.
- A second Racer on the stand (back-to-back motor/generator) would let regen and bus-transient behaviour be characterized — a P-pillar prerequisite.

---

## 11. Component: Host software and telemetry

### 11.1 Today **[MEASURED]**

| Tool | Purpose |
|---|---|
| `monitor.py` (`sensorless/`, `halls-sensorless/`) | Parses the 10 Hz CSV stream; live plots incl. rpm est-vs-hall |
| `tests/host_sub/` (`telem_sub`) | Real DDS subscriber used for the 485 Hz measurement |
| `udpload.py`, `udprecv.py`, `usbbench.py`, `quality.py` | Transport and control-quality measurement (scratchpad, not all committed) |
| `eth_check.py` (ABC) | UDP round-trip checker |

### 11.2 Wire facts that constrain the design **[MEASURED]**

- RTPS 2.2 on the wire, source port 7400, vendor ID 0d25, SPDP announcement 204 B, GUID prefix MAC-derived. Discovery works over a point-to-point cable (multicast is not filtered without a switch).
- Delivery collapses to ~0 above ~485 Hz while `pub_fail` still reports 0 — publishers cannot detect it; the host must.
- Inbound flood disturbs by **packet rate**, not bandwidth: RX saturates ~1247 pps at 64 B; `late%` rises to ~4 % at bidirectional saturation but `coalesce` stays 1.00.
- micro-ROS on ESP32 speaks Micro XRCE-DDS (needs an Agent), not RTPS — the espp engine was chosen to avoid that.

### 11.3 Host requirements [PROPOSED]

- Publish IDL for `NodeStatus` and `RacerTelemetry` / `RacerCommand`; provide a ROS 2 package that maps them to standard message types.
- A single `pace-cli` that wraps console commands over Ethernet as well as USB so the console wedge is not a blocker.
- A fleet dashboard (per-node status, faults, temperatures) is nice-to-have for the MEBot integration.

---

## 12. Requirements register

Status is against Racer V1R2 + current firmware unless noted. Evidence column cites the artifact.

### 12.1 Ecosystem (E)

| ID | Requirement | Priority | Status | Evidence / notes |
|---|---|---|---|---|
| E-01 | All nodes share a 48 V nominal actuation bus class (36–54 V operating) | Must | Partial | Racer characterized at 48 V only; operating range untested |
| E-02 | All nodes present on 100BASE-TX Ethernet and are DDS-discoverable | Must | Partial | Racer yes; ABC PHY bring-up only |
| E-03 | All nodes publish a common `NodeStatus` topic | Must | Open | schema TBD (§17) |
| E-04 | Node identity: eFuse-derived MAC; deterministic hostname | Should | Partial | MAC yes; hostname via Kconfig only |
| E-05 | Every node ships a `bringup` firmware with pass/warn/fail CSV output | Must | Partial | Racer yes; ABC blink/echo only |
| E-06 | Every node is characterizable through `bench_mcp` | Should | Partial | Racer only |
| E-07 | Safety envelope contract (§3.3 item 4) documented and applied to every actuation node | Must | Partial | Implemented on Racer; not written as a standalone spec |
| E-08 | Fabric-wide e-stop / heartbeat: a node loses its supervisor heartbeat → gentle STOPPING within a bounded time | Must | Open | Needs command ingress (F-01) |
| E-09 | Hardware naming `V<major>R<rev>`, firmware semver recording validated hardware rev | Should | Partial | |

### 12.2 Racer hardware (H)

| ID | Requirement | Priority | Status | Evidence / notes |
|---|---|---|---|---|
| H-01 | ≥ 1 kW bus power, clean, on stock OCP thresholds | Must | **Met** | 1049.5 W @ 483 rpm, 78 % |
| H-02 | ≥ 30 A phase current continuous-for-seconds without hardware trip | Must | Met | 35 A guard ended the 514 W run cleanly; VDS level 6 available, never needed |
| H-03 | Three-phase current sense adequate for sensorless FOC (≤ 5 % late samples at max speed) | Must | Partial | late = 4.9 % at 500 rpm is a recorded watch item |
| H-04 | Encoder, hall, and sensorless inputs all available on the same board | Must | Met | |
| H-05 | ≥ 4 thermal zones incl. FET pads, readable at ≥ 2 Hz | Must | Met | 4× LM75ADP |
| H-06 | Thermal: 20 A DC locked-rotor hold indefinitely below 80 °C with the production thermal solution | Must | Partial | Met with add-on heatsinks (48 °C plateau); not designed-in |
| H-07 | Ethernet on-board (not breakout), dedicated SPI host or RMII | Should (V2) | Open | |
| H-08 | Halls and any digital I/O off ADC1-adjacent pins | Must (V1R3) | Open | root-caused aggressor |
| H-09 | Secondary UART console on header | Should (V1R3) | Open | console-wedge mitigation |
| H-10 | Per-board calibration storage (current-sense factor, encoder offset) | Should | Open | NVS is sufficient; EEPROM optional |
| H-11 | Firmware-controllable VM disconnect / pre-charge to clear DRV latch without manual power-cycle | Should | Open | P-pillar hook |
| H-12 | Gate-drive integrity review of phase-B high-side under transients | Must (before envelope extension) | Open | bench watch item |
| H-13 | Mechanical: mounting and thermal interface to a wheelchair chassis; connector spec for phases/encoder/halls/Ethernet/bus | Must (integration) | Open | |
| H-14 | Bus transient / regen tolerance: absorb regen at rated speed without over-voltage; define clamp or rely on P-node | Must (integration) | Open | negative iq (regen) allowed in firmware; bus behaviour uncharacterized |

### 12.3 Racer firmware (F)

| ID | Requirement | Priority | Status | Evidence / notes |
|---|---|---|---|---|
| F-01 | Command ingress over DDS (`RacerCommand`: mode, setpoint, limits, arm/stop) with per-command watchdog | Must | Open | |
| F-02 | Telemetry egress over DDS at ≥ 100 Hz per node with zero effect on control cadence | Must | **Met** | 485 Hz ceiling, coalesce 1.00 |
| F-03 | Encoder, hall, sensorless modes selectable at runtime | Must | Met | |
| F-04 | Layered protection; all software fault responses gentle (no brake, no disarm) | Must | Met | STOPPING → coast |
| F-05 | Thermal guard independent of network state | Must | Met | 80 °C default, `tl` |
| F-06 | Thermal-guard availability: a hung I2C read must not blind the guard | Must | **Open** | known failure: LM75 hang blocks the stream task |
| F-07 | Sampler ISR at priority 2; lwIP not on CPU0; telemetry task with real priority; 32 KB I-cache; FOC in IRAM | Must | Met (some as defaults, some as guidance) | make all of them enforced defaults |
| F-08 | Persist hall table, encoder offset, current-sense zero/scale in NVS with a validity check | Should | Open | |
| F-09 | Host-visible delivery health (sequence numbers or heartbeat) so the >485 Hz collapse is detectable | Must | Open | `pub_fail` = 0 during collapse |
| F-10 | Supervisor heartbeat loss → STOPPING within ≤ 200 ms [PROPOSED value] | Must | Open | |
| F-11 | Multi-writer budget documented; ≥ 5 writers must fail loudly, not silently | Should | Partial | fails to start at ≥ 5 |
| F-12 | Restore lowest-two-duty phase selection (`p auto`) once phase C is rehabilitated | Should | Open | |
| F-13 | OTA update over Ethernet with rollback | Should | Open | |
| F-14 | Board-level self-test on boot (bringup checks) with results in `NodeStatus` | Should | Partial | `bringup` app exists, not integrated |

### 12.4 ABC (B)

| ID | Requirement | Priority | Status | Evidence / notes |
|---|---|---|---|---|
| B-01 | Ethernet link + UDP round-trip verified | Must | Met (bring-up fw) | `eth_check.py` |
| B-02 | Presents as a PACE node (E-02, E-03) | Must | Open | |
| B-03 | UART ↔ UDP/DDS tunnel with framing, ≥ 1 Mbaud aggregate | Must | Open | |
| B-04 | DHCP server / config portal for point-to-point bench use | Should | Met | 192.168.4.1 |
| B-05 | Supervisor role: heartbeat to Racers, e-stop broadcast | Should | Open | |
| B-06 | Layout review closed; first article built and bring-up passed on real hardware | Must | Open | draft layout finished |

### 12.5 Bench and tooling (T)

| ID | Requirement | Priority | Status |
|---|---|---|---|
| T-01 | Regenerate every published figure from committed logs with one command | Must | Met (`bench_report.py`) |
| T-02 | Bench tooling cannot change bus Vset; motion only in watchdog scripts | Must | Met |
| T-03 | Speed campaign (500 rpm ladder, endurance dwell) recorded and reported | Should | Partial (08-26/27) |
| T-04 | `bench_mcp` profiles for ABC and future nodes | Should | Open |
| T-05 | Regen / back-to-back characterization capability | Should | Open |

### 12.6 Safety, compliance, and documentation (S)

| ID | Requirement | Priority | Status |
|---|---|---|---|
| S-01 | Written safety-envelope spec (layers, thresholds, timing, test procedure) | Must | Open (content exists in engineering notes) |
| S-02 | Hazard analysis for a human-carrying platform (runaway, loss of comms, single-FET failure, thermal) | Must (integration) | Open |
| S-03 | EMC pre-scan of the Racer at 1 kW (conducted + radiated) | Should | Open |
| S-04 | Regulatory gap assessment vs ISO 7176-14 / IEC 60601-1 (informative) | Could | Open |
| S-05 | Each board: pin map, connector pinout, power-up sequence, fault-recovery procedure in the README | Must | Partial |

---

## 13. Measured performance baseline

All values **[MEASURED]** on Racer V1R2, 48 V, NineBot S hub motor, unless noted.

### 13.1 Power and motion

| Metric | Value | Run |
|---|---|---|
| Peak bus power | 1049.5 W @ 483 rpm, 16.1 N·m | 2026-08-27 |
| System efficiency at 1 kW | 78 % (816 W mech) | 2026-08-27 |
| Torque-route peak | 514 W bus @ 150 rpm, >500 W ≈ 11 s | 2026-08-19/20 |
| Speed hold under 2→10→2 N·m staircase | 400.1 ± 0.75 rpm | §8 |
| Worst dip, 2.6 N·m torque step | 10 rpm | fig 2 |
| Torque linearity (encoder-commutated) | Kt 0.60 flat; halls collapse to 0.29–0.39 uncalibrated | fig 3 |
| Speed regulation at 100 rpm free / braked | rpm sd 0.79 / 0.83; iq sd 0.09 / 0.12 A | 08-25 |
| Sensorless observer floor | ~30–40 rpm at 24 V | notes |
| Locked-rotor 20 A DC, heatsinked | plateau 48 °C | fig 4.1 |
| Hall-mode speed clamp | ±520 rpm | fw |

### 13.2 Control-loop integrity

| Metric | Value |
|---|---|
| PWM / sample rate | 20 kHz (50 µs) |
| FOC compute worst case (`cmax`) | 35–37 µs |
| Sampler ISR max | 15.5–21.6 µs |
| `coalesce` (missed ticks) | 1.00 in every condition; 1.01 worst (pre-priority-fix, braked + bidirectional) |
| `late%` idle / spinning / saturated network | 0.2–0.4 / 0.4 / 4.2 (post-priority-fix); 4.9 at 500 rpm (watch) |

### 13.3 Network

| Metric | Value |
|---|---|
| RTPS delivered ceiling | 484.6 Hz (1 writer); 0 loss ≤ 300 Hz |
| RTPS publish cost | 377–569 µs; +~114 µs per extra writer; ≥ 5 writers fail to start |
| UDP TX ceiling | 1457 pps @ 64 B (91 kB/s); 797 pps @ 1400 B (1090 kB/s) |
| UDP RX saturation | ~1247 pps @ 64 B; ~138 pps @ 1400 B |
| USB console | 3745 lines/s, 234 kB/s |
| ICMP RTT | 2.05 / 2.74 / 3.99 ms (min/avg/max), 0 % loss |
| Link-up after boot | 2.2 s, 100baseTX FD |
| Telemetry task starvation at saturation | ~25 % rows lost at priority 0 |

### 13.4 Motor identification (for reuse as fixtures)

R = 0.166 Ω/phase (0.332 line-line fit; DMM 0.323), L ≈ 336–395 µH, λpm = 0.026 Wb, Kt = 0.60–0.62 N·m/A, J ≈ 0.106 kg·m², 15 pole pairs. Current-loop gains kp = 0.0568, ki = 54.5 (169 rad/s bandwidth). Known-good encoder offset ≈ 352.5° (mount-dependent).

---

## 14. Known issues and technical-debt register

| # | Item | Severity | Owner area | Proposed disposition |
|---|---|---|---|---|
| 1 | Hung LM75/I2C read silently blocks the stream task → thermal guard blind | **High** | FW | Move temperature reads to their own task with timeout; guard marks zone `stale` and trips on stale > N s |
| 2 | RTPS delivery collapses to 0 above ~485 Hz with `pub_fail` = 0 | High | FW/Host | Sequence numbers + host-side loss detection (F-09); rate-limit writers |
| 3 | Phase-B high-side intermittent VDS faults near transients | High | HW | Gate-drive scope session before any envelope extension (H-12) |
| 4 | DRV8353 VDS latch survives ESP reset; requires VM power cycle | Medium | HW/FW | H-11 |
| 5 | USB-JTAG console wedge; only USB re-enumeration clears | Medium | HW/FW | H-09, `pace-cli` over Ethernet |
| 6 | Current-sense conversion factor is a placeholder in the BSP | Medium | FW | Calibrate, persist (F-08); clamp cross-check within 6 % |
| 7 | Phase-C channel condemned; `p auto` disabled | Medium | FW | F-12 |
| 8 | Hall lines on ADC1-adjacent GPIO3/9 | Medium | HW | H-08 |
| 9 | `late%` 4.9 % at 500 rpm | Medium | FW/HW | Null-window analysis at max modulation; H-03 |
| 10 | ≥ 5 RTPS writers fail to start silently | Low | FW | F-11 |
| 11 | Telemetry stream task at priority 0 starves under load | Low | FW | Set priority (F-07) |
| 12 | Encoder mount fails at 300 rpm wheel (2.5:1 gear) | Low (bench) | Bench | Disengage at speed; use halls |
| 13 | Hall table & encoder offset re-measured every session | Low | FW | F-08 |
| 14 | `.mcp.json` not committed (absolute paths) | Low | Tooling | Template + env var |
| 15 | Brake remanence / Rigol CH2 current-limit reverting to 0.1 A | Low (bench) | Bench | Already mitigated in `Brake.set()` |
| 16 | Tailscale hijacks 169.254/16 (scope link) | Low (bench) | Bench | Documented |

---

## 15. Roadmap

### 15.1 Now → next quarter (Racer hardening) [PROPOSED]

| Milestone | Contents | Exit criteria |
|---|---|---|
| **R1 — Thermal-guard robustness** | Fix issue #1; temperature task isolation; `stale` semantics | Guard demonstrably trips with an LM75 unplugged mid-run |
| **R2 — Command ingress + heartbeat** | `RacerCommand` topic, per-command watchdog, supervisor heartbeat → STOPPING | Host publishes a 100 rpm setpoint over DDS; pulling the cable stops the motor within the bound |
| **R3 — Calibration persistence** | NVS-backed hall table, encoder offset, current-sense zero/scale, with validity | Cold boot → drive in hall mode without `hcal` |
| **R4 — Gate-drive review** | Scope session on B-HS; VDS event correlation | Root cause recorded; envelope extension approved or design change filed |
| **R5 — Speed campaign** | 500 rpm loaded ladder, endurance dwell to plateau | Report §9 with FET plateau temperature and continuous-power rating |

### 15.2 PACE Racer V1R3 (layout iteration, same architecture) [PROPOSED]

- Halls off ADC1 pins with conditioning (H-08).
- Secondary UART console header (H-09).
- Designed-in heatsink / chassis thermal interface (H-06).
- Ethernet still via expansion, but dedicated SPI host if pins allow.
- Calibration EEPROM or NVS convention (H-10).
- Connector spec for wheelchair integration (H-13).

### 15.3 PACE Racer V2 (architecture change) [PROPOSED]

- On-board Ethernet (W5500 dedicated SPI or RMII PHY) (H-07).
- Current sensing: simultaneous-sampling external ADC or DRV8353 CSA with S/H, so sampling is decoupled from switching-edge timing (§7.4).
- VM pre-charge / disconnect under firmware control (H-11).
- Dual-motor variant evaluated (one ESP32-S3, two DRV8353) — a wheelchair needs two drives; the RTPS writer budget (~114 µs/writer) and the ISR budget say one MCU can plausibly host two 20 kHz loops only if sampling moves off the SAR ADC. **Decision needed** (§17).

### 15.4 Ecosystem [PROPOSED]

| Step | What | Depends on |
|---|---|---|
| Eco-1 | Publish the PACE node contract (§3.3) as a standalone spec + IDL | this PRD |
| Eco-2 | ABC first article + PACE-node firmware (B-02, B-03) | layout review |
| Eco-3 | ROS 2 package for PACE types | Eco-1 |
| Eco-4 | Two Racers + ABC on a MEBot base, joystick over ABC, drives over DDS | R2, Eco-2 |
| Eco-5 | First P-pillar node: 48 V bus board with pre-charge, e-stop, bus telemetry | H-14 characterization (T-05) |
| Eco-6 | Safety-envelope spec + hazard analysis (S-01, S-02) | Eco-4 |

---

## 16. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ESP32-S3 SAR ADC corruption is fundamental; software filters cannot close the gap at higher modulation | Medium | High (H-03, V2 architecture) | V2 external ADC / CSA path; keep the filter stack as defense in depth |
| Single-MCU dual-motor is not feasible on this architecture | Medium | Medium (BOM, wiring) | Decide early (§17); two Racers per chair is the fallback and already works |
| A silent failure (I2C hang, RTPS collapse) reaches a human-carrying platform | Low–Medium | **Critical** | Issues #1, #2 are top priority; supervisor heartbeat (F-10) |
| Unreproducible phase-B VDS fault is a real gate-drive weakness that appears at scale | Medium | High | H-12 before any envelope extension or production quantity |
| Bench knowledge concentrated in one person and one machine | High | Medium | This PRD + bench README + MCP server; commit scratchpad scripts |
| espp upstream changes (e.g. RTPS engine) shift performance numbers | Medium | Low–Medium | Pin espp version per firmware tag; rerun `bench-runs` on upgrades (as was done for v1.2.0) |
| Regulatory path for assistive use is longer than the research timeline | High | Medium | Keep S-04 informative; design V2 with isolation/redundancy hooks |

---

## 17. Open questions

1. **What does "ATOS" stand for, and what does ABC bridge to first** — the MEBot Teensy base, an R-Net controller, or a joystick? This sets B-03's framing and baud requirements.
2. **Dual-motor architecture**: two Racers per chair (works today) vs one V2 board with two drives? Cost/wiring vs the ADC/ISR budget.
3. **Ecosystem schema**: adopt ROS 2 standard messages where they fit (`sensor_msgs/JointState`, `diagnostic_msgs`) or define PACE IDL and map? Recommendation: PACE IDL as the wire truth, ROS 2 mapping package on top.
4. **Bus operating range**: is 48 V exact, or must Racer operate down to a discharged pack (≈ 36–40 V) and up to charge voltage (≈ 54 V)? Observer `kBusVoltage` must track the real bus either way — do we add bus-voltage sensing to firmware as a requirement?
5. **Heartbeat-loss stop bound**: 200 ms is proposed; the clinical/handling requirement should set it.
6. **Regen policy**: allow regen into the pack (needs P-node/BMS coordination) or dissipate/clamp on the Racer?
7. **Encoder strategy at speed**: keep MT6701 (low-speed specialist) + halls at speed, or move to a faster interface in V2?
8. **Licensing for hardware**: firmware is MIT; is `pace-racer-hardware` CERN-OHL or similar?
9. **Who are the external users** in the next 12 months (labs, collaborators), and does that change the priority of OTA and documentation?

---

## 18. Glossary

| Term | Meaning |
|---|---|
| ABC | ATOS Bridge Comms — the C-pillar Ethernet/UART bridge board |
| BSP | Board support package — `espp::PaceRacerBoard` |
| `coalesce` | FOC-task notifications ÷ runs; 1.00 = no missed control ticks |
| DDS / RTPS | Data Distribution Service and its wire protocol; the ecosystem's telemetry/command layer |
| FOC | Field-oriented control |
| I/f | Current/frequency open-loop start used before observer handoff |
| `late%` | Fraction of current samples taken outside the PWM null window (signal-quality metric, not a deadline-miss metric) |
| MEBot | Mobility-enhancement robotic wheelchair platform; the reference application |
| Null window | Interval around the MCPWM timer peak where all low-side FETs conduct and shunt currents are valid |
| R-Net | Commercial wheelchair power/control module being replaced |
| SVPWM | Space-vector PWM |
| STOPPING | Firmware state: closed-loop unload to 0 A, then Hi-Z coast — the single gentle exit path |
| TEP / TEZ | MCPWM timer-equals-peak / timer-equals-zero events |
| VDS OCP | DRV8353 drain-source over-current protection (hardware latch) |
| VM | Motor bus supply input |

---

## 19. References

Local paths are relative to `/Users/alxchunlin/code-stuff/atdev/`.

| Ref | Location |
|---|---|
| Racer firmware repo | `pace-racer/pace-racer-fw/` (`README.md`) |
| BSP and hardware overview | `pace-racer/pace-racer-fw/components/pace-racer-board/README.md`, `include/pace-racer-board.hpp` |
| Sensorless / hall FOC engineering notes | `.../pace-racer-board/halls-sensorless/SENSORLESS_FOC.md` |
| Ethernet/FOC coexistence | `.../pace-racer-board/ETHERNET_FOC_COEXISTENCE.md` |
| RTPS rerun (espp v1.2.0) | `.../halls-sensorless/tests/bench-runs/2026-08-25/results.md` |
| Bench handoff notes and MCP server | `.../halls-sensorless/bench/README.md`, `bench_mcp.py`, `bench_lib.py` |
| Characterization report generator | `pace-racer/pace-racer-fw/data-reports/bench_report.py` → `report/figures.html` |
| 1 kW commit | `09e9182 feat(pace-racer-board): 1049 W at 500 rpm + torque-servo load steps` (2026-08-27) |
| DRV8353 component | `pace-racer/pace-racer-fw/components/drv8353/README.md` |
| Racer hardware | `https://github.com/rammp-org/pace-racer-hardware` |
| ABC KiCad + bring-up | `pace-abc/ATOS-Bridge-Comms/` (`firmware/bringup/README.md`, `firmware/eth-bringup/README.md`) |
| MEBot context | `MeBot/README.md`, `MeBot/MEBot3.0/README.md` |
| Instrumentation-rail study (P-pillar seed) | `mebot-power-testing/report.html` — "10 V Load-Cell Excitation Rail: Ripple & Noise Characterisation" |
| espp | `https://github.com/esp-cpp/espp` |
| ESP-IDF v6.0 | `https://docs.espressif.com/projects/esp-idf/en/v6.0/esp32s3/` |

---
title: SPACE
source: "From the October 2026 team catch-up deck"
lede: "Open hardware modules for assistive robots. Every module is a full network node: it runs its own control, decides its own safe stop, and speaks RTPS with no agent and no bridge."
principle: "The easiest solution should be the correct one."

why:
  - [Regulatory, "No design history, risk analysis, or test evidence. SPACE helps indirectly."]
  - [Market, "Small, fragmented, reimbursement-driven. SPACE helps through openness."]
  - [Engineering, "Hobby-grade hardware gets rebuilt from scratch. SPACE helps directly."]
why_note: "SPACE does not solve regulation. It keeps the prototype close to the product and the documentation with the design."

lab_pain:
  - "USB-C cables between boards because a real bus was too hard"
  - "Hobby RC servos with a bolted-on encoder; brushed motors because brushless was out of reach"
  - "A custom power board per project, no load shedding, no e-stop chain; safety added last"

robots:
  - [Wheeled and mobile, "Powered wheelchair base, mobile manipulator, Turtlebot-class base"]
  - [Light vehicles and arms, "Ebike and escooter, robot arm end effector, kitchen gantry"]
shared_shape: "Battery, power distribution, one to six motor drives, deterministic control, a link to high compute, a safety chain."

edge:
  - "A few dollars buys the compute and memory of an early-2000s desktop."
  - "Research actuation still treats the motor controller as a dumb peripheral. SPACE puts headroom on every node, which is what separates it from ODrive at the same cost or less."
  - "The Racer decides its own safe stop, enforces its limits, and latches its faults. The host asks, the node acts."
  - "The HMI runs its own UI, calibration, and self test. The host sends two status messages a second."
  - "The contract is a header: add a row to a table and the whole system learns a new axis or diagnostic."
edge_close: "Nothing central knows how to drive a motor or draw a screen."
headroom:
  - [Virtual actuator, "Several Racers present as one, such as a parallel linkage or differential"]
  - [Coordinated group, "Racers run a shared trajectory with their own timing"]
  - [Learned behavior, "A model baked into an ESP32-class node exposes a high-level feature"]

atos:
  - "SPACE is the normative hardware profile for ATOS Layer 1. SPACE is to ATOS what Pixhawk is to PX4."
  - "ATOS requires but does not define: minimum hardware, deterministic actuation, safe failure recovery, load shedding, and a hardware manifest. SPACE supplies each: Racer and I/O node, safety chain, power distribution, firmware."
  - "SPACE nodes run full RTPS, not micro-ROS. Discovery, QoS, authentication, and encryption are the ATOS ones."
compare:
  - [Pixhawk and PX4, "Open reference designs and a vendor ecosystem, not built for human-contact safety"]
  - [VESC, "The ebike standard, but no safety architecture and messy comms"]
  - ["ODrive, moteus, Dynamixel", "Research-grade actuation, a dumb peripheral behind a thin bus, no safe torque off"]
  - [Qwiic and STEMMA QT, "Plug-in sensors that stop at the microcontroller"]

pathway:
  - [Research, The Devkit, "Does the idea work? One deliberately overbuilt board: brushless, brushed, and stepper drive; Dynamixel, RC servo, and Qwiic secondary buses; RTPS net port, CAN, safe torque off, brake output, e-stop input, 12 to 48 V in; ATOS Layer 1 firmware preloaded."]
  - [Prototype, Breakouts and modules, "Does the robot work? Single-function native nodes for lab prototypes, and the same functions as small parts to solder into a product PCB."]
  - [Product, Your PCB, "Does the product ship? Built from SPACE reference designs: schematic, layout notes, BOM with alternates, firmware, manifest, tests, and risk analysis under an open hardware licence."]
pathway_note: "Schematic, firmware, net protocol, and ATOS manifest carry forward unchanged. Large drives with bus bars may be reference designs and breakouts only."

principles:
  - "The easiest solution is the correct one."
  - "Safety is in the module: e-stop chain, safe torque off, watchdogs, power sequencing. Hardware safety circuits yes, certified silicon no."
  - "Prototype and product share one design."
  - "Open and manufacturable by anyone."
  - "Every module is a node. Talk to everything, build only SPACE."

is_not:
  - "Not a perception or high-compute platform"
  - "Not a battery cell or pack supplier"
  - "Not a mechanical design kit"
  - "Not a regulatory submission, and not a replacement for ATOS"

families:
  - name: Power distribution
    what: "12 to 48 V bus to the drives, PoE injection for every net-powered module, precharge and contactor control, priority rails so drive capability survives load shedding, per-node current budgets and per-rail telemetry. The e-stop chain terminates here, so cutting power is a hardware action. Battery interface spec first, battery management second."
    stage: concept
    node: nodes/smart-bus-bar.md
    label: Smart bus bar
  - name: Motor drive
    what: "The Racer. Any BLDC or brushed motor, up to 10 A continuous, 20 kHz FOC; up to 1000 W with Ninebot S motors. MotorCommand in, MotorState out; 200 ms without a command and it safe-stops on its own."
    stage: in use
    node: nodes/racer.md
    label: Racer
  - name: I/O node and safety I/O
    what: "A native RTPS participant that publishes a manifest for everything behind it. CAN, RC servo PWM, Dynamixel TTL and RS-485, Qwiic and STEMMA QT. Digital and analog I/O for bumpers, cliff sensors, switches, e-stop. A watchdog with a safe state for every device it fronts. Secure boot and OTA as a secondary agent under the main ATOS agent."
    stage: concept
    node: nodes/io-node.md
    label: I/O node
  - name: Net infrastructure and the Devkit
    what: "We build only what the RAMMP prototypes need."
    stage: concept
    node: nodes/zone.md
    label: Zone controller

racer:
  - ["1049", "W", "Peak bus power at 483 rpm, 817 W mechanical"]
  - ["78", "%", "System efficiency. 0.61 N·m/A encoder-commutated, 0.39 on halls"]
  - ["±0.75", "rpm", "400 rpm held while load staircased 2 to 10 N·m"]
  - ["300", "Hz", "RTPS telemetry lossless; saturates near 485 Hz"]
  - ["$65", "BOM", "Per board at small quantity, about $85 with tariffs and shipping"]
racer_note: "Designed and firmware written May to September 2026. Already in the Flatbot, the Gen 1.5 RAMMP prototype, the test bench, and regen braking tests. Every figure comes from two independent instruments."

power_classes:
  - ["5 A", Small, "End effector, small Turtlebot"]
  - ["20 A", Medium, "Turtlebot, gantry, mobile manipulator"]
  - ["50 A+", Large, "Wheelchair, ebike, escooter"]
power_note: "Drives sit on the 48 V bus and are never PoE. Every other node is Ethernet or PoE. Current figures are placeholders."

shedding:
  - [ATOS software contract, "Components reduce power and decide how"]
  - [ATOS port control, "USB-PD renegotiation and managed PoE ports"]
  - [SPACE per node, "Power envelope, metering, safe stop with brake engaged, report to ATOS"]
  - [SPACE whole-robot cutoff, "A hardware shutdown, not a request"]

network: "Nearly everything sits on the RTPS net: Jetson, Racers, power distribution, I/O nodes, each with its own manifest. CAN, RC servo, Dynamixel, and Qwiic hang off a SPACE node. CAN is one secondary bus, not the SPACE bus."

evidence:
  - "Schematic, layout, and BOM under an open licence"
  - "Firmware with the ATOS manifest descriptor"
  - "Risk analysis that drops into a design history file"
  - "Requirements traceability, test procedures, and test reports"

open:
  - q: "Do we believe the AI-assisted embedded development thesis, and what does our own firmware work this year show?"
    decision: ai-thesis
  - q: "Does anyone disagree with any item on the 'is not' list?"
    decision: is-not-list
  - q: "The net physical layer: Ethernet speed and PHY, WiFi, and which PoE connector (RJ45 or M8/M12)."
    decision: physical-layer
  - q: "Voltages at the port. Proposal: battery bus 12 to 48 V for drives and power distribution only; PoE on the net port; bus-set voltages on secondary ports."
    decision: port-power
  - q: "Does SPACE own battery management, or only spec the interface?"
    decision: bms
  - q: "PoE budget per node?"
    decision: poe-budget
  - q: "Which MCU class: standardise on one ESP32 part, or allow Cortex-M behind the same firmware interface?"
    decision: mcu-class
  - q: "Where do our RAMMP prototypes sit on the pathway today?"
    decision: pathway-position
---

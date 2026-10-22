# SPACE: domain glossary

SPACE (Sensing, Power, Actuation, and Control Electronics) is the family of networked electronics nodes for RAMMP assistive-mobility platforms. It was named PACE until 2026-10 (the "Rename to SPACE" decision).

## Terms

| Term | Meaning | Avoid |
|---|---|---|
| Node | Anything with an MCU on the RTPS net. It has an identity and publishes status. | device |
| Module | A SPACE building block with one job: the Racer, power distribution, the I/O node. Grouped into families. | node, when the reusable-block meaning is intended |
| Application | Several modules put together for one robot, with the robot-specific logic: the joystick/HMI, the MIB. | module |
| Family | One of the deck's module groups: power distribution, motor drive, I/O node and safety I/O, net infrastructure and Devkit. | |
| Pillar | A capability tag: S (sensing), P (power), A (actuation), C (control/comms). One module can carry several. | |
| Zone | One region of the chair, served by a smart bus bar and a managed switch. Proposed in the "Zones" decision. | hub |
| Smart bus bar | The P-pillar node that distributes 48 V to actuation branches with pre-charge, per-branch switching, and telemetry. | power board, PDU |
| Tier | The class of physical link a node gets: compute, motion and command, or sense and accessory (the "Physical layer" decision). | |
| Actuation domain | The switched 48 V power that feeds power stages only (the "Port power" decision). | |
| Logic domain | The power that feeds MCUs, PHYs, and sensors, which stays up when actuation is off (the "Port power" decision). | |
| ATOS | The robot software platform. SPACE is its normative hardware profile for Layer 1 ("SPACE is to ATOS what Pixhawk is to PX4"). ATOS defines discovery, QoS, authentication, encryption, agents, and the hardware manifest. | |
| Manifest | The ATOS descriptor each SPACE node publishes for itself and every device behind it. | |
| I/O node | A SPACE node that fronts secondary buses (CAN, RC servo, Dynamixel, Qwiic) and plain or safety I/O, with a watchdog and safe state for each device. | |
| Devkit / breakout / module / reference design | The four SPACE form factors, from research to product. | |
| MIB | MEBot Interface Board. The supervisor: DHCP, per-wheel commands, deadman. | |
| Axis | A motor's role on the chair: `front_caster_left`, `front_caster_right`, `drive_left`, `drive_right`. | channel |
| SAFE_STOP | Requested state: ramp to zero at `accel_limit`, then hold position under a reduced torque cap. | soft stop |
| ESTOP | Requested state: bridge Hi-Z immediately for as long as it is requested. | hard stop |
| HOLDING | Board state after SAFE_STOP: active position hold. | |
| STO / SS1 / SS2 | IEC 61800-5-2 stop functions: torque off; controlled stop then torque off; controlled stop then monitored standstill. | |
| PoDL | Power over Data Lines, IEEE 802.3bu. DC power on a point-to-point single-pair link. | PoE (different standard) |
| PLCA | Physical Layer Collision Avoidance. Round-robin transmit opportunities on a 10BASE-T1S multidrop segment. | |
| gPTP | IEEE 802.1AS time synchronisation over switched Ethernet. | |
| Stage | A node's maturity: concept, schematic, layout, bring-up, in development, in use, validated. | |

# SPACE: domain glossary

SPACE (Sensing, Power, Actuation, and Control Electronics) is the family of networked electronics nodes for RAMMP assistive-mobility platforms. It was named PACE until 2026-10 (ADR-0001).

## Terms

| Term | Meaning | Avoid |
|---|---|---|
| Node | One board with an MCU on the SPACE network. It has an identity and publishes status. | device, module |
| Pillar | The class of a node: S (sensing), P (power), A (actuation), C (control/comms). | |
| Zone | One region of the chair, served by a smart bus bar and a managed switch. Proposed in ADR-0002. | hub |
| Smart bus bar | The P-pillar node that distributes 48 V to actuation branches with pre-charge, per-branch switching, and telemetry. | power board, PDU |
| Tier | The class of physical link a node gets: compute, motion and command, or sense and accessory (ADR-0003). | |
| Actuation domain | The switched 48 V power that feeds power stages only (ADR-0004). | |
| Logic domain | The power that feeds MCUs, PHYs, and sensors, which stays up when actuation is off (ADR-0004). | |
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

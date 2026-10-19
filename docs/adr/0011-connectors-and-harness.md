---
id: "0011"
title: Single-pair connectors and harness standard
status: proposed
origin: claude-draft
date: 2026-10-19
pillars: [P, C]
prd: ["H-13", "§4.2"]
---

## Context

The harness sets the cost, reliability, and serviceability of a chair. Single-pair Ethernet has two connector families:

- Industrial: IEC 63171-6 (the "T1 Industrial" style) and IEC 63171-1 (LC style). IP20 and IP67 variants, broad vendor support, sized for cabinets and machines.
- Automotive: H-MTD and MATEnet style. Vibration-rated, small, cheap at volume. Harder to buy in small quantities, and crimp tooling is specialised.

Multidrop segments also need a choice between a daisy-chained trunk with in-line T-taps and a bus with short stubs.

## Recommendation

Prototype on IEC 63171-6 for availability and hand-assembly. Revisit before any build of more than ten chairs. Combine data, logic power, and the e-stop loop in one cable where a connector supports it.

## Questions to settle

- Do we need IP-rated connectors on the wheel drives?
- Is there one harness per chair, or one per zone?
- What wheelchair-specific vibration and flex requirements apply (ISO 7176 series)?

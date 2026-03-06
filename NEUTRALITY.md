# HJS Protocol Boundaries Declaration

**Version 1.0 | February 18, 2026**

This document elaborates on the design principles and boundaries defined in the IETF Internet-Draft [draft-wang-hjs-judgment-event](https://datatracker.ietf.org/doc/draft-wang-hjs-judgment-event/). HJS is a **structural layer infrastructure** for recording AI decisions, not a system for determining responsibility.

## I. Core Positioning

> **HJS records structure. It does not judge outcomes.**

The HJS protocol does one thing: **records structured traceable events**. It does not define, determine, or guarantee any external responsibility.

## II. What We Do NOT Do

*   ❌ **Do NOT Determine Legal or Moral Responsibility**
    *   We do not answer "who is legally responsible".
    *   We do not provide "responsibility scores".
    *   We do not identify "wrongdoers".
*   ❌ **Do NOT Evaluate Decision Correctness**
    *   We do not judge whether decisions are fair, reasonable, or compliant.
    *   We do not label decisions as "good" or "bad".
*   ❌ **Do NOT Make Governance Decisions for Users**
    *   We do not mandate data retention periods.
    *   We do not enforce specific technologies.
    *   We do not require particular anchoring strategies.
*   ❌ **Do NOT Provide Compliance Guarantees**
    *   We do not guarantee that records meet any jurisdiction's compliance requirements.
    *   We do not assume legal responsibility arising from users' use of this protocol.

## III. What We Do

*   ✅ **Record Structure**
    *   Record "who" (`entity`).
    *   Record "what action" (`action`).
    *   Record "in what context" (`scope`).
    *   Record "when" (`timestamp`).
*   ✅ **Provide Traceability Interfaces**
    *   Each record may optionally include an immutability anchor.
    *   Anchor type is chosen by the user; we do not enforce it.
    *   Receipts can be independently verified.
*   ✅ **Maintain Interface Neutrality**
    *   API exposes only structural capabilities.
    *   Field names are neutral (e.g., `entity` instead of `responsible_party`).
    *   Documentation clearly defines boundaries.

## IV. Limitations of Liability

Under no circumstances shall the HJS Foundation, its contributors, or affiliated parties be liable for legal disputes arising from data recorded using this protocol, user misinterpretation of records, or failure of external anchoring services.

## V. Contact

For questions about this declaration, please contact: **`signal@humanjudgment.org`**

For technical issues, use [GitHub Issues](https://github.com/hjs-protocol/api/issues).

---

**© 2026 HJS Ltd.**  
This document is licensed under the [MIT License](https://opensource.org/licenses/MIT).

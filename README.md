<p align="center">
<a href="README.zh-CN.md">中文</a> | <strong>English</strong>
</p>

# JEP: Judgment Event Protocol

**Reference implementation API service** for recording structured events, based on the JEP protocol family.

---

## 📖 About

This project is the reference implementation of the **[JEP Protocol Family](https://www.google.com/search?q=https://github.com/jep-protocol/spec)**. It implements the **4 core primitives** essential for AI accountability:

1. **Judgment** — Record structured, cryptographically signed decisions.
2. **Delegation** — Transfer authority with granular scope and automatic expiry.
3. **Termination** — Formally end responsibility chains for audit finality.
4. **Verification** — Validate record integrity and cryptographic chains via Ed25519.

This API service is the primary gateway for JEP integration. The core protocol is also available as a **[Rust library](https://www.google.com/url?sa=E&source=gmail&q=https://github.com/jep-protocol/core)** for high-performance, direct integration.

> **Protocol Boundary**: JEP defines structural traceability primitives for digital systems. It does not determine legal or ethical responsibility. All final responsibility determinations must be made by human-in-the-loop systems or formal legal procedures.

---

## 📜 Participation

This project is actively aligned with the IETF Internet-Draft **[draft-wang-hjs-judgment-event](https://datatracker.ietf.org/doc/draft-wang-hjs-judgment-event/)**.

---

### Python SDK

```bash
pip install jep-client

```

```python
from jep import JEPClient

# Record a judgment with JEP standard
client = JEPClient(api_key="your_key")
result = client.judgment(
    entity="user@example.com",
    action="approve",
    scope={"amount": 1000}
)
print(result['id'])  # jep_1234567890abcd

```

### Node.js SDK

```bash
npm install jep-client

```

```javascript
const JEPClient = require('jep-client');

const client = new JEPClient({ apiKey: 'your_key' });

// Record a JEP-compliant judgment
const result = await client.judgment({
  entity: 'user@example.com',
  action: 'approve',
  scope: { amount: 1000 }
});

console.log(result.id);  // jep_1234567890abcd

```

### Rust Core (High-Performance Integration)

```toml
[dependencies]
jep-core = { git = "https://github.com/jep-protocol/core" }

```

```rust
use jep_core::{JudgmentEvent, VerificationMode};

let event = JudgmentEvent::new("user@example.com", "approve")
    .with_scope(json!({"amount": 1000}));
let receipt = event.sign()?;
assert!(receipt.verify(VerificationMode::Strict)?);

```

---

## 🚀 Quick Start

### 1. Get an API Key

For testing and evaluation, contact the foundation at `signal@humanjudgment.org` to request a developer API key.

### 2. Use the SDK (Recommended)

JEP provides official SDKs for Python, Node.js, and Rust to ensure cryptographic consistency across environments.

### 3. Or use HTTP API directly

```bash
# Record a judgment via JEP REST API
curl -X POST https://api.jep-protocol.org/judgments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"entity": "alice@bank.com", "action": "loan_approved", "scope": {"amount": 100000}}'

```

---

## 🏗️ The 4 Core Primitives

JEP simplifies accountability into four atomic operations that map directly to the requirements of the **EU AI Act**.

---

## 📄 License

* **Protocol Specification**: **CC0 1.0 Universal** (Public Domain)
* **Reference Implementation & SDKs**: **MIT License**

---

## 📬 Contact & Community

* **Email**: `signal@humanjudgment.org`
* **Foundation**: HJS Foundation Ltd. (Singapore)

---

**© 2026 HJS Foundation Ltd.**

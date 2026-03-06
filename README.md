<p align="center">
  <a href="README.zh-CN.md">中文</a> | <strong>English</strong>
</p>

# HJS: A Judgment Event Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spec: CC0 1.0](https://img.shields.io/badge/Spec-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

**Reference implementation API service** for recording structured events, based on the HJS protocol family.

**Public instance**: `https://api.hjs.sh` (for testing and evaluation)

---

## 📖 About

This project is a reference implementation of the [HJS Protocol Family](https://github.com/hjs-protocol/spec). It implements the **4 core primitives** from the HJS protocol:

1. **Judgment** — Record structured decisions
2. **Delegation** — Transfer authority with scope and expiry
3. **Termination** — End responsibility chains
4. **Verification** — Validate record integrity and chains

This API service is one of several HJS implementations. The core protocol is also available as a [Rust library](https://github.com/hjs-protocol/core) for direct integration.

> **Protocol Boundary**: HJS defines structural traceability primitives. It does not determine legal or ethical responsibility. All responsibility determinations must be made by external systems or legal procedures.

---

## 📜 IETF Participation

This project is related to the IETF Internet-Draft [draft-wang-hjs-judgment-event](https://datatracker.ietf.org/doc/draft-wang-hjs-judgment-event/). Contributions to this repository (issues, pull requests, etc.) are considered part of the IETF standards process and are subject to the [IETF Note Well](https://www.ietf.org/about/note-well/).

---

## 📦 Implementations & SDKs

| Type | Language | Repository |
|------|----------|------------|
| **Core Protocol** | Rust | [`hjs-core`](https://github.com/hjs-protocol/core) |
| **Python SDK** | Python | [`sdk-py`](https://github.com/hjs-protocol/sdk-py) |
| **Node.js SDK** | JavaScript | [`sdk-js`](https://github.com/hjs-protocol/sdk-js) |
| **API Service** | - | [`api`](https://github.com/hjs-protocol/api) (this repo) |

### Python SDK
```bash
pip install hjs-client
```

```python
from hjs import HJSClient

# Record a judgment
client = HJSClient(api_key="your_key")
result = client.judgment(
    entity="user@example.com",
    action="approve",
    scope={"amount": 1000}
)
print(result['id'])  # jgd_1234567890abcd
```

### Node.js SDK
```bash
npm install hjs-client
```

```javascript
const HJSClient = require('hjs-client');

const client = new HJSClient({ apiKey: 'your_key' });

// Record a judgment
const result = await client.judgment({
  entity: 'user@example.com',
  action: 'approve',
  scope: { amount: 1000 }
});

console.log(result.id);  // jgd_1234567890abcd
```

### Rust Core (Direct Integration)
If you prefer to integrate HJS directly into your Rust application:

```toml
[dependencies]
hjs-core = { git = "https://github.com/hjs-protocol/core" }
```

```rust
use hjs_core::{JudgmentEvent, VerificationMode};

let event = JudgmentEvent::new("user@example.com", "approve")
    .with_scope(json!({"amount": 1000}));
let receipt = event.sign()?;
assert!(receipt.verify(VerificationMode::Strict)?);
```

---

## 🚀 Quick Start

### 1. Get an API Key

For testing and evaluation, please [open an issue](https://github.com/hjs-protocol/api/issues) or contact us at `signal@humanjudgment.org` to request an API key.

### 2. Use the SDK (Recommended)

```bash
# Python
pip install hjs-client

# Node.js
npm install hjs-client
```

### 3. Or use HTTP API directly

```bash
# Record a judgment
curl -X POST https://api.hjs.sh/judgments \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"entity": "alice@bank.com", "action": "loan_approved", "scope": {"amount": 100000}}'
```

---

## 🏗️ The 4 Core Primitives

[API 示例部分保持原样，非常清晰，无需修改]

---

## 📚 API Reference

[API 参考部分保持原样，非常清晰，无需修改]

---

## 📄 License

This project uses a **dual-license strategy**:

- **Protocol Specification** (in `/spec`): **CC0 1.0 Universal** (public domain)
- **Reference Implementation & SDKs**: **MIT License**

---

## 🔗 Links

- **Protocol Specification**: https://github.com/hjs-spec
- **Core Rust Implementation**: https://github.com/hjs-spec/hjs-core
- **API Documentation**: https://api.hjs.sh/api/docs
- **Health Check**: https://api.hjs.sh/health
- **Python SDK**: https://github.com/hjs-protocol/sdk-py
- **Node.js SDK**: https://github.com/hjs-protocol/sdk-js

---

## 📬 Contact & Community

- **Email**: `signal@humanjudgment.org`

---

**© 2026 HJS Foundation Ltd.**

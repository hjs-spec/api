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

Contact the maintainer or use the API with appropriate authentication for your deployment.

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

### 1. Judgment — Record Structured Decisions

```bash
POST /judgments
```

```json
{
  "entity": "user@example.com",
  "action": "approve",
  "scope": {"amount": 1000, "currency": "USD"},
  "immutability": {"type": "ots"}
}
```

**Response:**
```json
{
  "id": "jgd_1234567890abcd",
  "status": "recorded",
  "protocol": "HJS/1.0",
  "timestamp": "2026-03-03T12:00:00.000Z",
  "immutability_anchor": {
    "type": "ots",
    "reference": "...",
    "anchored_at": "..."
  }
}
```

### 2. Delegation — Transfer Authority

```bash
POST /delegations
```

```json
{
  "delegator": "manager@company.com",
  "delegatee": "employee@company.com",
  "judgment_id": "jgd_xxx",
  "scope": {"permissions": ["approve_under_1000"]},
  "expiry": "2026-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "dlg_1234567890abcd",
  "status": "active",
  "delegator": "manager@company.com",
  "delegatee": "employee@company.com",
  "scope": {"permissions": ["approve_under_1000"]},
  "expiry": "2026-12-31T23:59:59Z",
  "created_at": "2026-03-03T12:00:00.000Z"
}
```

### 3. Termination — End Responsibility

```bash
POST /terminations
```

```json
{
  "terminator": "admin@company.com",
  "target_id": "dlg_1234567890abcd",
  "target_type": "delegation",
  "reason": "Employee left company"
}
```

**Response:**
```json
{
  "id": "trm_1234567890abcd",
  "terminator": "admin@company.com",
  "target_id": "dlg_1234567890abcd",
  "target_type": "delegation",
  "reason": "Employee left company",
  "created_at": "2026-03-03T12:00:00.000Z"
}
```

### 4. Verification — Validate Records

```bash
# Method 1: Detailed verification
POST /verifications
```

```json
{
  "verifier": "auditor@company.com",
  "target_id": "dlg_1234567890abcd",
  "target_type": "delegation"
}
```

**Response:**
```json
{
  "id": "vfy_1234567890abcd",
  "result": "VALID",
  "details": {
    "valid": true,
    "delegation": {...},
    "judgment": {...}
  },
  "verified_at": "2026-03-03T12:00:00.000Z"
}
```

```bash
# Method 2: Quick verify (auto-detect type)
POST /verify
```

```json
{"id": "dlg_1234567890abcd"}
```

**Response:**
```json
{
  "id": "dlg_1234567890abcd",
  "type": "delegation",
  "status": "VALID"
}
```

---

## 📚 API Reference

### Authentication

All API endpoints require an API key. Include it in the request header:

```
X-API-Key: your-api-key-here
```

For deployment-specific authentication, refer to your instance documentation.

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/judgments` | POST/GET | Record/List judgments |
| `/judgments/{id}` | GET | Retrieve a judgment |
| `/delegations` | POST/GET | Create/List delegations |
| `/delegations/{id}` | GET | Retrieve a delegation |
| `/terminations` | POST/GET | Create/List terminations |
| `/terminations/{id}` | GET | Retrieve a termination |
| `/verifications` | POST/GET | Verify/List verifications |
| `/verify` | POST | Quick verify (auto-detect) |

### Utility Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/docs` | GET | API documentation |

### Immutability Anchoring

Each record **may** include an optional immutability anchor:

```json
"immutability": {
  "type": "ots",
  "options": {}
}
```

Types:
- **`ots`**: Anchor to Bitcoin blockchain via OpenTimestamps
- **`none`**: No anchoring (default)

---

## 📄 License

This project uses a **dual-license strategy**:

- **Protocol Specification** (in `/spec`): **CC0 1.0 Universal** (public domain)
- **Reference Implementation & SDKs**: **MIT License**

---

## 🔗 Links

- **Protocol Specification**: https://github.com/hjs-protocol/spec
- **Core Rust Implementation**: https://github.com/hjs-protocol/core
- **API Documentation**: https://api.hjs.sh/api/docs
- **Health Check**: https://api.hjs.sh/health
- **Python SDK**: https://github.com/hjs-protocol/sdk-py
- **Node.js SDK**: https://github.com/hjs-protocol/sdk-js


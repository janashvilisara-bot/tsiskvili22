# 🔒 TalentOS Security Policy & Standards

> **Version:** 2.0 | **Last Updated:** 2026-02-06  
> **Compliance:** ISO/IEC 27001, OWASP Top 10, Georgian Personal Data Protection Law

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Access Control](#2-authentication--access-control)
3. [Data Protection & Encryption](#3-data-protection--encryption)
4. [Row Level Security (RLS)](#4-row-level-security-rls)
5. [API & Edge Function Security](#5-api--edge-function-security)
6. [Attack Prevention](#6-attack-prevention)
7. [Audit & Monitoring](#7-audit--monitoring)
8. [Incident Response](#8-incident-response)
9. [Configuration & Deployment](#9-configuration--deployment)
10. [Penetration Test Checklist](#10-penetration-test-checklist)
11. [Employee Security Rules](#11-employee-security-rules)

---

## 1. Overview

### 1.1 Purpose
This document defines the security policies, standards, and procedures for the TalentOS HR Management System. It is mandatory for all developers, administrators, and users.

### 1.2 Architecture Overview
```
┌─────────────────────────────────────────────┐
│            Client (React SPA)                │
│  CSP │ Input Validation │ IDS │ HTTPS Only   │
├─────────────────────────────────────────────┤
│           Edge Functions (Deno)              │
│  JWT │ Rate Limiting │ Role Check │ CORS     │
├─────────────────────────────────────────────┤
│           PostgreSQL + RLS                   │
│  36+ Policies │ AES-256 │ Audit Triggers     │
└─────────────────────────────────────────────┘
```

### 1.3 Security Principles
- **Defense in Depth** — Multi-layered protection
- **Least Privilege** — Minimum necessary permissions
- **Zero Trust** — Every request is verified
- **Secure by Default** — Security is the default state

---

## 2. Authentication & Access Control

### 2.1 Password Policy
| Parameter | Requirement |
|-----------|-------------|
| Minimum length | **12 characters** |
| Uppercase letters | Required (A-Z) |
| Lowercase letters | Required (a-z) |
| Digits | Required (0-9) |
| Special characters | Required (!@#$%^&*) |
| Password history | Last 5 passwords cannot be reused |
| Password expiry | 90 days (recommended) |
| Account lockout | After 5 failed attempts |
| Lockout duration | 30 minutes |

**Implementation:** `src/lib/passwordValidation.ts`

### 2.2 Role System
```
admin ──────────── Full access to all modules
hr_manager ─────── HR operations, employee management
department_manager─ Own department only (without sensitive fields)
employee ──────── Own data only
```

**Critical Rules:**
- Roles are stored in a **separate table** (`user_roles`) — never in `profiles`
- Role checks use the `has_role()` Security Definer function
- Client-side role checks are **never** sufficient on their own
- Storing roles in localStorage/sessionStorage is **prohibited**

### 2.3 Session Management
- Session timeout: **8 hours** of inactivity
- JWT token expiry: Supabase default (1 hour, auto-refresh)
- Session timeout implementation: `src/hooks/useSessionTimeout.ts`

### 2.4 OAuth / 2FA
- Google OAuth is integrated (2FA managed by Google)
- TOTP implementation recommended for email/password users

---

## 3. Data Protection & Encryption

### 3.1 Encryption Standards
| Layer | Method |
|-------|--------|
| In transit | TLS 1.2+ (HTTPS) |
| At rest | AES-256 (disk) |
| Application level | AES-256-GCM (sensitive fields) |

### 3.2 Sensitive Data Classification

**Critical (AES-256-GCM encrypted):**
- Personal ID number (`personal_id`)
- Salary (`salary`)
- Bank account (`bank_account`)
- Bonus (`bonus`)
- Pension amount (`pension_amount`)

**High (RLS + restricted access):**
- Phone, email, address
- Employment contracts
- Disciplinary records
- Medical information

**Medium (RLS):**
- Attendance records
- Leave requests
- Training history

### 3.3 Encryption Implementation
```
Edge Function: encrypt-sensitive-data
├── encrypt(plaintext) → { ciphertext, iv } (AES-256-GCM)
├── decrypt(ciphertext, iv) → plaintext
├── Admin-only access (JWT + role check)
└── Every operation logged in encryption_access_log
```

**ENCRYPTION_KEY:** 256-bit hex string, stored in Edge Function Secrets. **Never** in code.

### 3.4 File Storage
- Files are stored in **Storage buckets** (never in the database)
- Private buckets: `documents`, `candidate-photos`, `candidate-resumes`
- Access only via **Signed URLs** (photos: 1 year, CVs: 1 hour)
- Storing Base64 data in the database is **prohibited**

---

## 4. Row Level Security (RLS)

### 4.1 General Rules
- RLS is **enabled on every table**
- The `anon` role has **no access** to sensitive tables
- Views use `security_invoker = true`
- Security Definer functions prevent recursion

### 4.2 Access Matrix

| Table | Employee | Dept Manager | HR | Admin |
|-------|----------|-------------|-----|-------|
| employees (own) | ✅ READ | ✅ READ | ✅ CRUD | ✅ CRUD |
| employees (others) | ❌ | ✅ READ* | ✅ CRUD | ✅ CRUD |
| payroll | ❌ (RPC only) | ❌ | ✅ | ✅ |
| compensation | ❌ | ❌ | ✅ | ✅ |
| contracts | Own only | ❌ | ✅ | ✅ |
| attendance | Own only | Department | ✅ | ✅ |
| audit_logs | ❌ | ❌ | ✅ READ | ✅ READ |

*\* Dept Manager — without sensitive fields (salary, personal_id, bank\_\*)*

### 4.3 RLS Policy Patterns
```sql
-- ✅ Correct: Security Definer function
CREATE POLICY "admin_access" ON employees
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ❌ Wrong: Direct subquery (causes recursion!)
CREATE POLICY "admin_access" ON employees
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ✅ Correct: user_id validation on INSERT
CREATE POLICY "own_insert" ON some_table
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ❌ Wrong: Open INSERT
CREATE POLICY "open_insert" ON some_table
FOR INSERT WITH CHECK (true);
```

---

## 5. API & Edge Function Security

### 5.1 Edge Function Checklist
Every Edge Function **must** include:

```typescript
// 1. CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with domain in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 2. JWT Validation
const authHeader = req.headers.get("Authorization");
if (!authHeader) return new Response("Unauthorized", { status: 401 });

const token = authHeader.replace("Bearer ", "");
const { data: { user }, error } = await supabaseClient.auth.getUser(token);
if (error || !user) return new Response("Unauthorized", { status: 401 });

// 3. Role Check (for sensitive operations)
const { data: roles } = await supabaseClient
  .from("user_roles").select("role").eq("user_id", user.id);
const isAdmin = roles?.some(r => r.role === "admin");

// 4. Input Validation
// Always validate with Zod or manually

// 5. Rate Limiting
import { checkRateLimit } from "../_shared/rate-limiter.ts";
```

### 5.2 Rate Limits
| Endpoint | Limit |
|----------|-------|
| send-email | 10 requests / minute |
| send-sms / send-cloudsms | 5 requests / 5 minutes |
| admin-reset-password | 3 requests / 5 minutes |
| ai-assistant | 30 requests / minute |
| register-employee | 10 requests / minute |

### 5.3 API Keys & Secrets
- **Publishable keys** (VITE\_\*) — allowed in code
- **Private keys** (ENCRYPTION_KEY, SMS API keys) — Edge Function Secrets only
- `.env` file — never in Git (listed in `.gitignore`)

---

## 6. Attack Prevention

### 6.1 OWASP Top 10 Protection

| Attack | Defense Mechanism | Implementation |
|--------|-------------------|----------------|
| **A01: Broken Access Control** | RLS + Role checks | 36+ RLS policies, `has_role()` |
| **A02: Cryptographic Failures** | AES-256-GCM, TLS | `encrypt-sensitive-data` Edge Fn |
| **A03: Injection** | Parameterized queries, IDS | Supabase SDK, `intrusionDetection.ts` |
| **A04: Insecure Design** | Defense in Depth | Multi-layer architecture |
| **A05: Security Misconfiguration** | CSP, HSTS, headers | `index.html`, `nginx.conf` |
| **A06: Vulnerable Components** | Dependency audit | `npm audit`, Renovate |
| **A07: Auth Failures** | Account lockout, JWT | `account_lockouts` table |
| **A08: Data Integrity** | Audit triggers, checksums | `audit_logs` table |
| **A09: Logging Failures** | Comprehensive audit | 12+ event types logged |
| **A10: SSRF** | URL validation | OAuth redirect validation |

### 6.2 Intrusion Detection System (IDS)
**File:** `src/lib/intrusionDetection.ts`

Detects:
- SQL Injection patterns (`' OR 1=1`, `UNION SELECT`, `DROP TABLE`)
- XSS attempts (`<script>`, `javascript:`, `onerror=`)
- Path Traversal (`../`, `..\\`)
- Command Injection (`;`, `|`, `` ` ``)
- AI Prompt Injection (`ignore previous`, `system prompt`)
- Endpoint Scanning (monitors request patterns)

### 6.3 Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  font-src 'self';
  frame-ancestors 'none';
">
```
- `unsafe-eval` is **prohibited** in script-src
- `unsafe-inline` is allowed only in style-src (Tailwind/Framer Motion compatibility)
- `frame-ancestors 'none'` — Clickjacking prevention

### 6.4 HTTP Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

### 6.5 Input Validation
- Client-side: **Zod** schemas + React Hook Form
- Server-side: Type checking in Edge Functions
- Length limits on all fields
- URL encoding (`encodeURIComponent`)
- `dangerouslySetInnerHTML` is **prohibited** on user data

---

## 7. Audit & Monitoring

### 7.1 Audit Log
**Table:** `audit_logs`

Logged events:
| Event | Risk Level |
|-------|-----------|
| login_success | low |
| login_failed | medium |
| login_blocked | high |
| password_change | medium |
| role_change | high |
| sensitive_data_access | medium/critical |
| export_data | medium |
| unauthorized_access | high |
| suspicious_activity | critical |

### 7.2 Risk Levels
- **Critical** — Admin accessing another user's PII/financial data
- **High** — Suspicious activity, unauthorized modification
- **Medium** — Routine operations on sensitive data
- **Low** — Normal session events

### 7.3 Login Anomaly Detection
**File:** `src/lib/loginAnomalyDetection.ts`

Detects:
- Login from a new country/city
- Login with a new User-Agent
- Login from different locations in a short time

### 7.4 Retention Periods
- Audit logs: **Minimum 90 days** (GDPR / Georgian law)
- Login history: **1 year**
- Encryption access log: **1 year**

---

## 8. Incident Response

### 8.1 Data Breach Procedure
1. **Discovery** → Record in `data_breaches` table
2. **Assessment** → Determine number of affected individuals
3. **Notification** → Inform DPO (immediately)
4. **Regulator** → Notify within 72 hours
5. **Affected individuals** → Notify if necessary
6. **Remediation** → Eliminate root cause

### 8.2 Contact
- Security issues: `security@talentos.ge`
- RFC 9116 security.txt: `/.well-known/security.txt`

---

## 9. Configuration & Deployment

### 9.1 Production Checklist
- [ ] `server_tokens off` in nginx
- [ ] Server, X-Powered-By headers removed
- [ ] console.log/debugger stripped (Terser)
- [ ] HTML comments removed
- [ ] CORS origin restricted to production domain
- [ ] SameSite=Strict cookies
- [ ] HTTPS everywhere
- [ ] CSP header active

### 9.2 Environment Variables
```
# ✅ Allowed in code (publishable)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# ❌ Edge Function Secrets only
ENCRYPTION_KEY=<256-bit hex>
SUPABASE_SERVICE_ROLE_KEY=<secret>
CLOUDSMS_API_KEY=<secret>
OPENAI_API_KEY=<secret>
```

### 9.3 Self-Hosting (Docker)
- Docker Compose includes: PostgreSQL, Kong, GoTrue, Storage
- All secrets in `.env` file (not in docker-compose.yml)
- Change default ports in production

---

## 10. Penetration Test Checklist

### 10.1 Authentication
- [ ] Brute force protection (account lockout after 5 attempts)
- [ ] Password complexity requirements (12+ characters)
- [ ] Session fixation protection
- [ ] JWT token validation on every endpoint
- [ ] OAuth redirect URL validation
- [ ] Password reset token single-use enforcement

### 10.2 Authorization
- [ ] Horizontal privilege escalation (accessing other users' data)
- [ ] Vertical privilege escalation (using admin functions)
- [ ] IDOR (Insecure Direct Object Reference)
- [ ] Client-side role manipulation
- [ ] RLS bypass attempts

### 10.3 Injection
- [ ] SQL Injection (Supabase SDK parameterized)
- [ ] XSS (Stored, Reflected, DOM-based)
- [ ] CSRF (SameSite cookies)
- [ ] SSRF (URL validation)
- [ ] Command Injection
- [ ] Path Traversal

### 10.4 Data Protection
- [ ] Sensitive data is encrypted
- [ ] API keys not exposed in client code
- [ ] Error messages do not reveal technical details
- [ ] HTTPS enforced
- [ ] Sensitive headers not exposed

### 10.5 Business Logic
- [ ] Rate limiting on all critical endpoints
- [ ] File upload validation (type, size)
- [ ] Mass assignment protection
- [ ] Race condition protection

---

## 11. Employee Security Rules

### 11.1 General Rules
1. Passwords must never be shared with anyone
2. Computers must be locked when leaving the workstation
3. Opening suspicious emails/links is prohibited
4. Corporate data must not be transferred to personal devices
5. USB device usage is restricted

### 11.2 Developer Rules
1. **Never** hardcode API keys/secrets in source code
2. **Always** use parameterized queries
3. **Always** add RLS policies to new tables
4. **Never** use `dangerouslySetInnerHTML` with user input
5. **Always** validate input (client + server)
6. **Never** store files in the database (use Storage)
7. **Always** log access to sensitive data
8. **Never** store roles in the profiles table
9. Pull requests require code review
10. Dependency updates must be regular

### 11.3 Administrator Rules
1. Service role key usage only in Edge Functions
2. Password resets — only by admin role holders
3. Role changes — logged in `audit_logs`
4. Bulk operations — logged and require confirmation
5. Database backups — regular (minimum weekly)

---

## 📎 Appendices

### A. File Mapping
| Component | File |
|-----------|------|
| Password Validation | `src/lib/passwordValidation.ts` |
| IDS | `src/lib/intrusionDetection.ts` |
| Encryption (client) | `src/hooks/useEncryptedData.ts` |
| Encryption (server) | `supabase/functions/encrypt-sensitive-data/` |
| Audit Logging | `src/lib/securityLogger.ts` |
| Login Anomaly Detection | `src/lib/loginAnomalyDetection.ts` |
| Session Timeout | `src/hooks/useSessionTimeout.ts` |
| Error Masking | `src/lib/errorHandler.ts` |
| Rate Limiter | `supabase/functions/_shared/rate-limiter.ts` |
| Geofencing | `src/lib/geofencing.ts` |
| Soft Delete | `src/lib/softDelete.ts` |

### B. Compliance Status
| Standard | Status |
|----------|--------|
| ISO/IEC 27001 | ✅ Compliant |
| OWASP Top 10 | ✅ All vectors protected |
| GDPR | ✅ DSR, DPIA, DPO |
| Georgian Personal Data Protection Law | ✅ Fully compliant |
| Georgian Government Standards (12.8-12.12) | ✅ |
| Native 2FA (TOTP) | ⚠️ Pending |

---

*This document must be updated after every significant change.*

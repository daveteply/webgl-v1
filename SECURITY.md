# Security Policy

## Supported Versions

Rikkle is continuously deployed. Security updates are applied directly to the primary branch and
deployed to production. We do not backport fixes to previous commits or releases.

| Version / Target  | Supported          |
| ----------------- | ------------------ |
| `main` branch     | :white_check_mark: |
| rikkle.app (Live) | :white_check_mark: |
| Historical tags   | :x:                |

---

## Reporting a Vulnerability

> [!IMPORTANT]
> **Please do not report security vulnerabilities through public GitHub issues, discussions, or pull
> requests.**

### Preferred Method: GitHub Private Vulnerability Reporting

Please submit vulnerability reports through GitHub's [Private Vulnerability Reporting](https://github.
com/<owner>/<repo>/security/advisories/new) tab on this repository. This keeps the report confidential
while maintainers investigate and patch the issue.

### Alternative Method: Direct Contact

If you cannot use GitHub's advisory system, email your report to:

- **`security@<your-domain-or-email>`** (or maintainer contact)

### What to Include in Your Report

To help us triage and resolve the issue quickly, please provide:

- A description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- Affected library or application (e.g., `apps/rikkle`, `libs/engine`, dependencies).
- Any proposed fix or remediation (if known).

---

## Scope

### In-Scope

- Cross-Site Scripting (DOM-based XSS or prototype pollution in client libraries).
- Service worker, PWA caching, or asset hijacking vulnerabilities.
- Vulnerable build scripts, actions workflows, or supply-chain dependencies that can compromise the
  application or build pipeline.
- Sensitive data or credential leaks in public bundles.

### Out-of-Scope

- Self-XSS (e.g., pasting code into browser DevTools).
- Client-side game state tampering (e.g., modifying `localStorage` scores or memory in dev tools).
- Distributed Denial of Service (DDoS) against CDN or hosting infrastructure.
- Automated scanner reports without a verifiable Proof of Concept demonstrating exploitability.

---

## Response Timeline

- **Initial Acknowledgment**: Within 48–72 hours of report submission.
- **Triage & Assessment**: We will verify the vulnerability and assess its severity.
- **Remediation**: Once verified, we will work on a fix in a private branch or advisory.
- **Coordinated Disclosure**: We aim to release a patch within 30 days before public disclosure,
  coordinating with the reporter on credit.

---

## Safe Harbor

We consider security research conducted in good faith under this policy to be authorized. We will not
pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, and service interruption.
- Give maintainers reasonable time to resolve the vulnerability before sharing details publicly.
- Do not exploit the vulnerability beyond what is necessary to demonstrate the proof of concept.

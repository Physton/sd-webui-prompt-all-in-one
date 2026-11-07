# Security Policy

## Reporting a Vulnerability

**DO NOT** create a public issue for security vulnerabilities. 

### How to Report

Use GitHub Security Advisories:  [Report a vulnerability](https://github.com/Physton/sd-webui-prompt-all-in-one/security/advisories/new)

Or email the maintainer directly through GitHub. 

### What We Need

1. **Description**: What is the vulnerability? 
2. **Impact**: What can an attacker do? 
3. **Steps to Reproduce**: How to trigger the vulnerability?
4. **Affected Component**: Which file/function is vulnerable?
5. **Suggested Fix** (optional): How to fix it?

## Vulnerability Scope

### In Scope ✅

- **Code Injection** in Python backend (`scripts/`)
- **XSS** in JavaScript frontend (`javascript/`, `src/`)
- **Path Traversal** in file operations
- **API Key Leakage** in translation services
- **Insecure Dependencies** with known CVEs
- **Authentication/Authorization** bypass

### Out of Scope ❌

- Issues in third-party translation services
- Bugs in Stable Diffusion WebUI core
- Social engineering
- Rate limiting (unless leads to DoS)

## Security Severity Levels

We use [CVSS v3.1](https://www.first.org/cvss/calculator/3.1) to rate vulnerabilities:

| Severity | CVSS Score |
|----------|------------|
| Critical | 9.0-10.0   |
| High     | 7.0-8.9    |
| Medium   | 4.0-6.9    |
| Low      | 0.1-3.9    |

## CVE Assignment

For qualifying vulnerabilities, we will: 

1. Create a GitHub Security Advisory
2. Request a CVE ID through GitHub
3. Credit the reporter (unless you want to remain anonymous)
4. Publish the CVE after the patch is released

## Past Security Advisories

View all published advisories:  [Security Advisories](https://github.com/Physton/sd-webui-prompt-all-in-one/security/advisories)

## Contact

- **Security Reports**: Use GitHub Security Advisories (preferred)
- **General Contact**: [@Physton](https://github.com/Physton)

---

**Last Updated**: 2026-01-10

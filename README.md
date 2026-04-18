# SentinelOps Vulnerable Test Repo

This repository is an intentionally vulnerable test project for SentinelOps scanners.
DO NOT DEPLOY OR USE IN PRODUCTION.

## What it includes
- A minimal Flask app with vulnerable endpoints for SAST/DAST testing.
- A Node/Express app in [server.js](server.js) with additional SAST patterns (SQLi, cmd injection, path traversal, insecure deserialization, weak crypto).
- A small Java/Maven module in [java-vuln-app/](java-vuln-app/) with intentionally vulnerable patterns and dependencies.
- Hardcoded fake secrets in code and .env files for secret scanning.
- Outdated dependencies for SCA findings.
- Insecure Docker and Compose examples for container scanners.

## Run locally
```bash
docker compose up --build
```

## Expected findings
- SAST: SQL injection, command injection, path traversal, XSS, insecure deserialization, weak crypto.
- DAST: /search, /run, /file, /deserialize, /hash endpoints.
- Trivy: CVEs from base image and old Python packages.
- Gitleaks: .env, .env.sample, config files, commented tokens.

## Notes
- All vulnerabilities are intentional and required for scanner validation.
- Do not "fix" issues unless explicitly asked.

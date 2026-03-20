# SentinelOps Vulnerable Test Repo

This repository is an intentionally vulnerable test project for SentinelOps scanners.
DO NOT DEPLOY OR USE IN PRODUCTION.

## What it includes
- A minimal Flask app with vulnerable endpoints for SAST/DAST testing.
- Hardcoded fake secrets in code and .env files for secret scanning.
- Outdated dependencies for SCA findings.
- Insecure Docker, Compose, and IaC examples for container/IaC scanners.

## Run locally
```bash
docker build -t vuln-app .
docker run -p 5000:5000 vuln-app
```

## Expected findings
- SAST: SQL injection, command injection, path traversal, XSS, insecure deserialization, weak crypto.
- DAST: /search, /run, /file, /deserialize, /hash endpoints.
- Trivy: CVEs from base image and old Python packages.
- Gitleaks: .env, .env.sample, config files, commented tokens.
- IaC: public S3 bucket, open security group, privileged container, hostPath mount.

## Notes
- All vulnerabilities are intentional and required for scanner validation.
- Do not "fix" issues unless explicitly asked.

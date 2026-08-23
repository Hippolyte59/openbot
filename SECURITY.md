# Security Policy

## Supported Versions

Use this section to tell people about supported versions of your project. Tell them the currently supported version and security-relevant version range.

| Version | Supported |
| ------- | :-------: |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it as soon as possible.

### How to Report

Please report security issues by emailing:
- hippolyte@zorcraft.ovh

or by opening a private security advisory if your GitHub organization supports it.

### What to Include

When reporting a vulnerability, please include:

1. **Vulnerability type** (XSS, injection, auth bypass, information disclosure, etc.)
2. **Steps to reproduce** the issue
3. **Potential impact** if exploited
4. **Screenshots or videos** demonstrating the issue (optional but helpful)
5. **Your environment** (OS, Discord client version, bot version, etc.)
6. **Any mitigations** you've already attempted

### Response Timeline

- **24-48 hours**: Acknowledgment of the report
- **1 week**: Initial analysis and triage
- **2-4 weeks**: Development of a fix
- **Release**: Security fix included in the next release

### Preferred Communication

- Use GitHub Security Advisories (if available)
- Or email the maintainers directly
- Do NOT disclose vulnerabilities publicly until a fix is released

## Security Best Practices

### For Contributors

- Never commit secrets, tokens, or passwords to the repository
- Use the `.env.example` pattern for documentation - never include real values
- Run `npm audit` before submitting PRs
- Follow the coding standards in CONTRIBUTING.md
- Review the [OWASP Top 10](https://owasp.org/www-project-top-ten/) for common vulnerabilities

### For Users

- Keep your bot updated to the latest version
- Review the `.env.example` to understand which variables are required
- Set `PUBLIC_URL` when hosting behind a reverse proxy
- Regularly check `npm audit` for dependency vulnerabilities

### Security Headers (Already Implemented)

This project includes the following security headers on the embedded web server:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 0` - Disables XSS filter in older browsers
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; frame-src 'none';` - Restricts resource loading

### Rate Limiting

- Web API endpoints limited to 30 requests per minute per IP
- Returns HTTP 429 with `{ error: "Rate limit exceeded" }` when exceeded

### Data Privacy

- No tokens or secrets stored in the repository
- `.env` is gitignored
- `.env.example` contains only placeholder values
- Player data stored in embedded SQLite database
- Logs are sanitized to remove Discord usernames, IDs, and token values

## Vulnerability Categories Out of Scope

The following types of issues are considered out of scope for this project's security policy:

- Discourse disagreements or feature requests
- UI/Design preferences
- Performance optimization unrelated to security
- Third-party integration issues

## Acknowledgments

We appreciate all security researchers who help keep OpenBot safe for the community. Credit will be given in the project's changelog or release notes upon permission.

---

**Security Contact**: hippolyte@zorcraft.ovh
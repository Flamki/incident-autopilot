# Security Policy

## Supported Versions

The latest commit on `main` is the supported version for security fixes.

## Reporting a Vulnerability

Please do not open a public issue for security vulnerabilities.

Use GitHub private vulnerability reporting:

- Repository Security tab -> Advisories -> Report a vulnerability
- Direct link: `https://github.com/Flamki/incident-autopilot/security/advisories/new`

Include:

- Affected endpoint or feature
- Reproduction steps
- Impact assessment
- Suggested remediation (if available)

We will acknowledge the report as quickly as possible and coordinate a fix and disclosure timeline.

## Secret Leak Response

If GitHub or GitGuardian reports a leaked secret:

1. Rotate the credential immediately at the provider.
2. Remove the secret from the repository and deployment variables where not needed.
3. If the secret was ever committed, rewrite git history and force-push to fully purge it.
4. Invalidate old sessions/tokens related to that credential.
5. Re-run CI and verify no secret remains in tracked files.

If an alert is a non-secret demo value, mark it as a false positive in the scanning tool after manual verification.

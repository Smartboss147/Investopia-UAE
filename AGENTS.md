# Project Instructions & Permanent Memory

## Core Directives

### 1. STRICT REQUIREMENT: DO NOT BREAK EXISTING FUNCTIONALITY
- **Never break, remove, or degrade existing features or working functions.**
- Every existing functionality (including user login, email/password authentication, Google sign-in, practice trading, order tracking, admin controls, portfolio calculations, deposits, withdrawals, and UI flows) must continue to function reliably.
- Any bug fix, enhancement, or architectural improvement must be surgical, strictly backward-compatible, and thoroughly verified before completion.
- Always check that existing logic remains intact when updating any component or utility.

### 2. Clean, Non-Destructive Codebase
- Do not introduce temporary scripts or clutter to the root directory.
- Preserve type safety, linting integrity, and project structure.
- Never reset or alter user database schemas or security rules in a breaking way.

### 3. Authentication & Platform Reliability
- Ensure authentication flows (Google OAuth and Email/Password) work smoothly across all devices (Desktop, Mobile, iOS Safari, Android) and deployment targets (Vercel, Cloud Run).
- Handle browser-specific constraints (such as Safari ITP, pop-up blockers, and cross-origin policies) gracefully without crashing or throwing unhandled errors.

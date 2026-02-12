# PR Review Output Template

When producing the final review, follow this structure exactly.

### Summary
- **tl;dr**: [One-line summary of what this PR does]
- **Type**: [MAJOR|MINOR|PATCH] according to semver
- **Single Responsibility**: [Pass | Warning | Fail] - [Brief explanation]
- **CI Status**: [Passing | Failing | Pending] - [Note any failures]
- **PR State**: [Ready | Draft]

### Monorepo Scope
- **Packages touched**: [List of affected packages]
- **Cross-package impact**: [None | List of downstream packages affected by shared type/API changes]
- **Version target**: [Maintained | Not Maintained — flag if targeting an unmaintained version]

### Root Cause Analysis
- **Problem Statement**: [What issue is this PR trying to solve?]
- **Is the Problem Real?**: [Verified/Not Verified - with evidence]
- **Current Solution Assessment**: [Is this the best approach?]
- **Alternative Approaches**: [Could this be solved differently?]

### Changeset Verification
- **Changeset present**: [Yes / No / Not required]
- **Bump level correct**: [Yes / No — expected PATCH but changeset says MINOR, etc.]
- **Description accurate**: [Yes / No — does the changeset summary reflect the actual change?]

### Breaking Changes Assessment
[If no breaking changes detected, state: "No breaking changes detected."]
[If breaking changes exist, list each with:]
- **Change**: [Specific change description]
- **Impact**: [How this affects existing users]
- **Migration Path**: [How users should update their code]
- **Recommendation**: [Whether this warrants a major version bump]

### Pattern Consistency Review
[If all patterns are consistent, state: "All changes follow established patterns."]
[For each inconsistency:]
- **Pattern Deviation**: [What pattern is not followed]
- **Existing Pattern Example**: [Code snippet or file reference showing the established pattern]
- **Suggested Correction**: [Specific change to match existing patterns]

### Improvement Suggestions

**Critical Issues** (must fix before merge)
[List any security vulnerabilities, undocumented breaking changes, or functionality regressions]
[If none, state: "None identified"]

**Major Issues** (should fix before merge)
[List missing tests, pattern inconsistencies, poor error handling, or performance problems]
[If none, state: "None identified"]

**Minor Issues** (nice to have)
[List code style improvements, documentation enhancements, or refactoring opportunities]
[If none, state: "None identified"]

### Community Contribution Notes
[Only include this section if the PR is from a fork/external contributor]
[Acknowledge the contribution positively and provide extra guidance]

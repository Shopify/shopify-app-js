# Semver Classification Rules

Rigorously analyze all changes according to [semantic versioning](https://semver.org/).

## MAJOR (Breaking Changes)
- Removed or renamed public APIs, methods, or exported functions
- Changed function signatures (parameter types, order, or requirements)
- Modified return types of public methods
- Altered behavior that existing code depends on
- Changes to configuration schemas that invalidate existing configs
- Removal of previously deprecated features

### Monorepo-specific MAJOR signals
- Changes to shared types that other packages in the monorepo depend on (trace consumers)
- Changes to re-exported APIs — if package A re-exports from package B, a breaking change in B is breaking in A too
- Changes to package peer dependency requirements (e.g., bumping minimum Node.js version, requiring a new peer)

## MINOR (New Features)
- New public APIs, methods, or exports
- New optional parameters
- New configuration options with defaults
- Deprecation notices (without removal)

## PATCH (Bug Fixes)
- Fixes to broken functionality
- Performance improvements
- Documentation updates
- Internal refactoring with no API changes

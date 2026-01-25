# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.1] - 2025-01-25

### Changed
- `/howto` command workflow improvements with TODO-based document queue
- New subcommands: `next`, `all`, `rm` for batch documentation
- Streamlined documentation (385 → 202 lines)

## [0.2.0] - 2025-01-25

### Added
- `/commit` command for smart git workflow (init, .gitignore, grouped commits)
- `scripts/clean.sh` for new project initialization

### Changed
- Improved clean.sh with .planning/, docs/howto/, git tags cleanup
- Added .gitignore with common patterns

### Removed
- `docs/howto/` directory (project-specific, cleaned for fresh start)

## [0.1.0] - 2025-01-25

### Added
- GSD (Get Shit Done) workflow system based on [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)
- 11 GSD agents for planning, execution, verification
- 27 GSD slash commands (`/gsd:*`)
- 11 GSD skills for reusable methodologies
- `/howto` command for development knowledge recording
- `/release` command for version and changelog management
- Korean documentation in `.claude/docs/`

### Fixed
- Config parsing with Node.js helper (replaced fragile grep/tr)
- System consistency issues (Critical, Warning, Minor)

### Changed
- Centralized model profiles in `model-profiles.json`
- Added `spawned_by` and `skills_integration` to agents

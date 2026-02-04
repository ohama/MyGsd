# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.6.0] - 2025-01-29

### Added
- `/push` command for safe git push with optional tags and PR support
- `/gsd:health` command for project diagnostics (18 checks)

### Changed
- Improved version and tag management in GSD workflow
- Archive phases directory on milestone completion
- Detect parent `.git` in new-project setup
- Milestone tag format changed to `milestone[X.Y]`
- Release command now uses VERSION file only (not milestone version)
- Push command simplified with minimal defaults
- Howto documents sorted by creation date
- Howto quality criteria updated to learner-style
- Research methodology extracted as reusable skill

### Fixed
- Git init behavior for parent .git directories

### Removed
- Obsolete `docs.old` directory

## [0.5.1] - 2025-01-27

### Changed
- Rename `/howto record` to `/howto scan` for better semantics

## [0.5.0] - 2025-01-26

### Added
- `scripts/pack.sh` for packaging `.claude/` to `dist/*.tgz`

### Changed
- `clean.sh` now prompts before deleting all items (`.planning/`, `documentation/howto/`, meta files)

## [0.4.0] - 2025-01-26

### Added
- Auto `/howto scan` execution after GSD phase completion

## [0.3.0] - 2025-01-25

### Added
- Confirmation prompt before deleting `.git` and `.gitignore` in `clean.sh`
- Git files keep/remove option in `/gsd:new-project` setup phase

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
- Improved clean.sh with .planning/, documentation/howto/, git tags cleanup
- Added .gitignore with common patterns

### Removed
- `documentation/howto/` directory (project-specific, cleaned for fresh start)

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

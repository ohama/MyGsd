# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

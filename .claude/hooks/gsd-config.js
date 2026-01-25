#!/usr/bin/env node
/**
 * GSD Config Loader
 *
 * Safely parses .planning/config.json with proper error handling.
 * Loads model profiles from external JSON file.
 * Provides file inlining helper for Task prompts.
 *
 * Usage:
 *   node .claude/hooks/gsd-config.js <key>           # Get single value
 *   node .claude/hooks/gsd-config.js <key> <default> # Get with default
 *   node .claude/hooks/gsd-config.js --json          # Get full config as JSON
 *   node .claude/hooks/gsd-config.js --model <agent> # Get model for agent
 *   node .claude/hooks/gsd-config.js --profiles      # Show all model profiles
 *   node .claude/hooks/gsd-config.js --inline <file> [file2...] # Inline file contents
 *   node .claude/hooks/gsd-config.js --context       # Get standard planning context
 *
 * Examples:
 *   node .claude/hooks/gsd-config.js model_profile
 *   node .claude/hooks/gsd-config.js mode interactive
 *   node .claude/hooks/gsd-config.js --model gsd-planner
 *   node .claude/hooks/gsd-config.js --inline .planning/STATE.md .planning/ROADMAP.md
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_PATH = '.planning/config.json';
const MODEL_PROFILES_PATH = '.claude/get-shit-done/config/model-profiles.json';

// Default config values
const DEFAULTS = {
  mode: 'interactive',
  depth: 'standard',
  model_profile: 'balanced',
  parallelization: true,
  commit_docs: true,
  workflow: {
    research: true,
    plan_check: true,
    verifier: true
  },
  planning: {
    commit_docs: true,
    search_gitignored: false
  }
};

// Fallback model profiles (used if external file not found)
const FALLBACK_PROFILES = {
  quality: {
    'gsd-planner': 'opus',
    'gsd-roadmapper': 'opus',
    'gsd-executor': 'opus',
    'gsd-phase-researcher': 'opus',
    'gsd-project-researcher': 'opus',
    'gsd-research-synthesizer': 'sonnet',
    'gsd-debugger': 'opus',
    'gsd-codebase-mapper': 'sonnet',
    'gsd-verifier': 'sonnet',
    'gsd-plan-checker': 'sonnet',
    'gsd-integration-checker': 'sonnet'
  },
  balanced: {
    'gsd-planner': 'opus',
    'gsd-roadmapper': 'sonnet',
    'gsd-executor': 'sonnet',
    'gsd-phase-researcher': 'sonnet',
    'gsd-project-researcher': 'sonnet',
    'gsd-research-synthesizer': 'sonnet',
    'gsd-debugger': 'sonnet',
    'gsd-codebase-mapper': 'haiku',
    'gsd-verifier': 'sonnet',
    'gsd-plan-checker': 'sonnet',
    'gsd-integration-checker': 'sonnet'
  },
  budget: {
    'gsd-planner': 'sonnet',
    'gsd-roadmapper': 'sonnet',
    'gsd-executor': 'sonnet',
    'gsd-phase-researcher': 'haiku',
    'gsd-project-researcher': 'haiku',
    'gsd-research-synthesizer': 'haiku',
    'gsd-debugger': 'sonnet',
    'gsd-codebase-mapper': 'haiku',
    'gsd-verifier': 'haiku',
    'gsd-plan-checker': 'haiku',
    'gsd-integration-checker': 'haiku'
  }
};

/**
 * Load model profiles from external JSON file
 */
function loadModelProfiles() {
  try {
    if (fs.existsSync(MODEL_PROFILES_PATH)) {
      const content = fs.readFileSync(MODEL_PROFILES_PATH, 'utf8');
      const data = JSON.parse(content);
      return data.profiles || FALLBACK_PROFILES;
    }
  } catch (err) {
    console.error(`[gsd-config] Error loading model profiles: ${err.message}`);
  }
  return FALLBACK_PROFILES;
}

// Lazy-load profiles
let _modelProfiles = null;
function getModelProfiles() {
  if (!_modelProfiles) {
    _modelProfiles = loadModelProfiles();
  }
  return _modelProfiles;
}

/**
 * Load config with defaults
 */
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return DEFAULTS;
    }
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(content);
    return deepMerge(DEFAULTS, config);
  } catch (err) {
    console.error(`[gsd-config] Error loading config: ${err.message}`);
    return DEFAULTS;
  }
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Get nested value by dot notation
 */
function getValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Get model for agent based on profile
 */
function getModelForAgent(agentName, profile = null) {
  const config = loadConfig();
  const effectiveProfile = profile || config.model_profile || 'balanced';
  const profiles = getModelProfiles();
  const profileModels = profiles[effectiveProfile] || profiles.balanced;
  return profileModels[agentName] || 'sonnet';
}

/**
 * Read and format file content for inlining in Task prompts
 * Returns formatted content with filename header
 */
function inlineFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return `<!-- File not found: ${filePath} -->`;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);
    return `### ${filename}\n\n${content}`;
  } catch (err) {
    return `<!-- Error reading ${filePath}: ${err.message} -->`;
  }
}

/**
 * Inline multiple files with XML-style tags
 */
function inlineFiles(filePaths) {
  const results = [];
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      results.push(`<!-- File not found: ${filePath} -->`);
      continue;
    }
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      results.push(`<file path="${filePath}">\n${content}\n</file>`);
    } catch (err) {
      results.push(`<!-- Error reading ${filePath}: ${err.message} -->`);
    }
  }
  return results.join('\n\n');
}

/**
 * Get standard planning context (commonly needed files)
 */
function getStandardContext() {
  const files = [
    '.planning/STATE.md',
    '.planning/ROADMAP.md',
    '.planning/config.json'
  ];

  const context = {};
  for (const file of files) {
    const key = path.basename(file, path.extname(file)).toLowerCase();
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        context[key] = content;
      } catch (err) {
        context[key] = null;
      }
    } else {
      context[key] = null;
    }
  }
  return context;
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(JSON.stringify(loadConfig(), null, 2));
    return;
  }

  switch (args[0]) {
    case '--json':
      console.log(JSON.stringify(loadConfig(), null, 2));
      break;

    case '--model':
      if (!args[1]) {
        console.error('Usage: gsd-config.js --model <agent-name>');
        process.exit(1);
      }
      console.log(getModelForAgent(args[1]));
      break;

    case '--profiles':
      console.log(JSON.stringify(getModelProfiles(), null, 2));
      break;

    case '--inline':
      if (args.length < 2) {
        console.error('Usage: gsd-config.js --inline <file> [file2...]');
        process.exit(1);
      }
      console.log(inlineFiles(args.slice(1)));
      break;

    case '--context':
      console.log(JSON.stringify(getStandardContext(), null, 2));
      break;

    case '--help':
      console.log(`
GSD Config Helper

Commands:
  <key> [default]     Get config value (supports dot notation: workflow.verifier)
  --json              Get full config as JSON
  --model <agent>     Get model for agent based on current profile
  --profiles          Show all model profiles
  --inline <files>    Inline file contents for Task prompts
  --context           Get standard planning context (STATE, ROADMAP, config)
  --help              Show this help

Examples:
  gsd-config.js model_profile
  gsd-config.js workflow.verifier true
  gsd-config.js --model gsd-planner
  gsd-config.js --inline .planning/STATE.md .planning/ROADMAP.md
`);
      break;

    default:
      // Get single value
      const key = args[0];
      const defaultValue = args[1] || '';
      const config = loadConfig();
      const value = getValue(config, key);

      if (value === undefined || value === null) {
        console.log(defaultValue);
      } else if (typeof value === 'object') {
        console.log(JSON.stringify(value));
      } else {
        console.log(value);
      }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  loadConfig,
  getModelForAgent,
  getModelProfiles,
  inlineFile,
  inlineFiles,
  getStandardContext,
  DEFAULTS
};

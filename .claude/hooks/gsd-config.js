#!/usr/bin/env node
/**
 * GSD Config Loader
 *
 * Safely parses .planning/config.json with proper error handling.
 * Replaces fragile grep/tr parsing in commands.
 *
 * Usage:
 *   node .claude/hooks/gsd-config.js <key>           # Get single value
 *   node .claude/hooks/gsd-config.js <key> <default> # Get with default
 *   node .claude/hooks/gsd-config.js --json          # Get full config as JSON
 *   node .claude/hooks/gsd-config.js --model <agent> # Get model for agent
 *
 * Examples:
 *   node .claude/hooks/gsd-config.js model_profile
 *   node .claude/hooks/gsd-config.js mode interactive
 *   node .claude/hooks/gsd-config.js --model gsd-planner
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = '.planning/config.json';

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

// Model profiles - single source of truth
const MODEL_PROFILES = {
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
    // Log error to stderr, return defaults
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
function getValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Get model for agent based on profile
 */
function getModelForAgent(agentName, profile = null) {
  const config = loadConfig();
  const effectiveProfile = profile || config.model_profile || 'balanced';
  const profileModels = MODEL_PROFILES[effectiveProfile] || MODEL_PROFILES.balanced;
  return profileModels[agentName] || 'sonnet';
}

// CLI interface
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(JSON.stringify(loadConfig(), null, 2));
    return;
  }

  if (args[0] === '--json') {
    console.log(JSON.stringify(loadConfig(), null, 2));
    return;
  }

  if (args[0] === '--model') {
    const agent = args[1];
    if (!agent) {
      console.error('Usage: gsd-config.js --model <agent-name>');
      process.exit(1);
    }
    console.log(getModelForAgent(agent));
    return;
  }

  if (args[0] === '--profiles') {
    console.log(JSON.stringify(MODEL_PROFILES, null, 2));
    return;
  }

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

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { loadConfig, getModelForAgent, MODEL_PROFILES, DEFAULTS };

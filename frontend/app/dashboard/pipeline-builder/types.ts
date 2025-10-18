/**
 * Fluxion Pipeline Builder Type Definitions
 * 
 * This module defines the data structure for GitHub Actions workflows.
 * The model is organized around three core concepts:
 * 1. Trigger - What events start the workflow
 * 2. Jobs - Parallel execution units that run on specific runners
 * 3. Steps - Sequential commands/actions within a job
 */

// ============================================================================
// TRIGGERS - What events trigger this workflow
// ============================================================================

export type TriggerEvent = 'push' | 'pull_request' | 'release' | 'schedule' | 'workflow_dispatch';

/**
 * Represents a trigger input for manual workflow dispatches.
 * These become available as inputs when triggering the workflow manually.
 */
export interface TriggerInput {
  description?: string;
  required?: boolean;
  default?: string;
  type?: 'string' | 'choice';
  options?: string[]; // Only used when type is 'choice'
}

/**
 * Represents the trigger configuration for a workflow.
 * Only ONE trigger per workflow - this determines what events activate it.
 */
export interface Trigger {
  event: TriggerEvent;
  
  // For 'push' and 'pull_request' events
  branches?: string[]; // e.g., ['main', 'develop']
  branchesIgnore?: string[];
  tags?: string[]; // only for 'push' event
  tagsIgnore?: string[]; // only for 'push' event
  paths?: string[]; // Run only if these paths change (monorepo support)
  pathsIgnore?: string[];
  
  // For 'schedule' event
  schedule?: string; // cron expression, e.g., '0 0 * * 0' for weekly
  
  // For 'workflow_dispatch' event (manual trigger)
  inputs?: Record<string, TriggerInput>;
}

// ============================================================================
// STEPS - Individual commands or actions within a job
// ============================================================================

export type StepType = 'action' | 'run' | 'composite';

/**
 * Represents a single step in a job.
 * Steps run sequentially - if one fails, subsequent steps don't run (unless continueOnError is true).
 */
export interface PipelineStep {
  id: string; // Unique identifier for this step
  name?: string; // Display name, shown in GitHub Actions UI
  type: StepType;
  
  // --- For type 'action': uses: owner/repo@ref ---
  uses?: string; // e.g., 'actions/checkout@v4' or 'actions/setup-node@v4'
  with?: Record<string, string>; // Inputs to pass to the action
  
  // --- For type 'run': inline shell commands ---
  run?: string; // e.g., 'npm install' or 'python -m pytest'
  shell?: 'bash' | 'pwsh' | 'sh' | 'cmd'; // Defaults to bash on Linux/Mac, cmd on Windows
  
  // --- Common to both 'action' and 'run' ---
  env?: Record<string, string>; // Step-level environment variables
  if?: string; // Conditional: 'success()', 'failure()', 'always()', 'cancelled()'
  continueOnError?: boolean; // If true, workflow continues even if this step fails
  workingDirectory?: string; // Override job's working directory for this step
  timeout?: number; // Timeout in minutes for this step (overrides job timeout)
}

// ============================================================================
// JOB CONFIGURATION - Container for steps and execution environment
// ============================================================================

export type RunsOnValue = 'ubuntu-latest' | 'ubuntu-24.04' | 'macos-latest' | 'windows-latest' | string;

/**
 * Permission settings for GITHUB_TOKEN in a job.
 * Defaults to 'read' - be explicit about what permissions are needed.
 */
export interface JobPermissions {
  contents?: 'read' | 'write' | 'none';
  pull_requests?: 'read' | 'write' | 'none';
  packages?: 'read' | 'write' | 'none';
  statuses?: 'read' | 'write' | 'none';
  actions?: 'read' | 'write' | 'none';
  [key: string]: 'read' | 'write' | 'none' | undefined;
}

/**
 * Matrix strategy for running a job across multiple configurations.
 * Useful for testing against multiple Node versions, Python versions, OS combinations, etc.
 */
export interface MatrixStrategy {
  // Common matrices:
  os?: string[]; // e.g., ['ubuntu-latest', 'windows-latest', 'macos-latest']
  nodeVersion?: string[]; // e.g., ['18', '20', '21']
  pythonVersion?: string[]; // e.g., ['3.9', '3.10', '3.11']
  goVersion?: string[]; // e.g., ['1.21', '1.22']
  
  // Allow custom matrix dimensions
  [key: string]: string[] | undefined | Record<string, string>[];
}

/**
 * Represents a single job in the workflow.
 * Jobs run in parallel by default, unless they have dependencies via 'needs'.
 * Each job runs on a specified runner and contains a sequence of steps.
 */
export interface Job {
  name: string; // Display name, used as unique identifier (shown in GitHub Actions UI)
  
  // Execution environment
  runsOn: RunsOnValue | RunsOnValue[]; // Runner(s) to use
  timeout?: number; // Job timeout in minutes (default 360)
  environment?: string; // Reference to GitHub environment (e.g., 'production', 'staging')
  concurrency?: string; // Concurrency group to prevent parallel runs
  
  // Permissions
  permissions?: JobPermissions; // GITHUB_TOKEN permissions for this job
  
  // Matrix strategy for multiple configurations
  strategy?: MatrixStrategy;
  
  // Job dependencies - ensures job doesn't run until these complete
  needs?: string[]; // Array of job names this job depends on
  
  // Steps in this job - run sequentially
  steps: PipelineStep[];
}

// ============================================================================
// FULL PIPELINE - Complete workflow definition
// ============================================================================

/**
 * Complete GitHub Actions workflow.
 * This is the top-level object that gets serialized to YAML.
 */
export interface Pipeline {
  id: string; // Unique identifier for this pipeline
  name: string; // Workflow name (shown in GitHub UI)
  description?: string; // Optional description
  
  // Workflow trigger - what events start this workflow
  trigger: Trigger;
  
  // Workflow jobs - what actually runs
  jobs: Job[];
  
  // Global environment variables (accessible to all jobs)
  env?: Record<string, string>;
  
  // Secrets this workflow needs (just names - values stored in GitHub)
  // Used as a checklist for users: "Make sure these secrets are configured in GitHub"
  secrets?: string[]; // e.g., ['DOCKER_USERNAME', 'DOCKER_TOKEN']
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REACT FLOW INTEGRATION - For the visual editor
// ============================================================================

/**
 * Node data for React Flow visualization.
 * This wraps Job data for the graph editor.
 */
export interface JobNodeData {
  label: string;
  jobId: string;
  stepCount: number;
}

/**
 * Represents what's being edited in the config panel.
 * Can be the trigger, a job, or a step.
 */
export type EditingTarget =
  | { type: 'trigger'; data: Trigger }
  | { type: 'job'; jobId: string; data: Job }
  | { type: 'step'; jobId: string; stepId: string; data: PipelineStep };

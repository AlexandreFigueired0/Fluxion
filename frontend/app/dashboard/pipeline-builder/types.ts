/**
 * GitHub Actions Workflow Type Definitions
 * 
 * This module defines types that match the GitHub Actions YAML format exactly.
 * This ensures we can represent ANY valid GitHub Actions workflow without data loss.
 * 
 * Key naming: Uses kebab-case for field names to match YAML (runs-on, continue-on-error, etc.)
 */

// ============================================================================
// TOP LEVEL - Workflow/Pipeline
// ============================================================================

export interface Workflow {
  name?: string; // Workflow name
  description?: string;
  
  // Trigger events - using `on` to match GitHub Actions YAML exactly
  on?: WorkflowTrigger;
  
  // Environment variables available to all jobs
  env?: Record<string, string>;
  
  // Jobs - object format keyed by job name, values omit the name field
  jobs: Record<string, Omit<Job, 'name'>>;
  
  // Concurrency settings at workflow level
  concurrency?: ConcurrencySettings;
  
  // Default settings for all jobs
  defaults?: {
    run?: {
      shell?: string;
      'working-directory'?: string;
    };
  };

  [key: string]: any; // Allow additional custom fields
}

// ============================================================================
// TRIGGERS - What events start the workflow
// ============================================================================

export type WorkflowTrigger = 
  | { push?: PushTriggerConfig }
  | { pull_request?: PullRequestTriggerConfig }
  | { schedule?: ScheduleTrigger[] }
  | { workflow_dispatch?: WorkflowDispatchTrigger }
  | { release?: ReleaseTriggerConfig }
  | { workflow_call?: WorkflowCallConfig }
  | { [key: string]: any }; // Allow other trigger types

export interface PushTriggerConfig {
  branches?: string[];
  'branches-ignore'?: string[];
  tags?: string[];
  'tags-ignore'?: string[];
  paths?: string[];
  'paths-ignore'?: string[];
  types?: string[];
}

export interface PullRequestTriggerConfig {
  branches?: string[];
  'branches-ignore'?: string[];
  paths?: string[];
  'paths-ignore'?: string[];
  types?: string[];
}

export interface ScheduleTrigger {
  cron: string; // e.g., '0 0 * * 0'
}

export interface ReleaseTriggerConfig {
  types?: string[];
}

export interface WorkflowDispatchTrigger {
  inputs?: Record<string, WorkflowDispatchInput>;
}

export interface WorkflowDispatchInput {
  description?: string;
  required?: boolean;
  default?: string;
  type?: 'string' | 'choice' | 'environment';
  options?: string[];
  deprecationMessage?: string;
}

export interface WorkflowCallConfig {
  inputs?: Record<string, WorkflowCallInput>;
  outputs?: Record<string, WorkflowCallOutput>;
  secrets?: Record<string, WorkflowCallSecret>;
}

export interface WorkflowCallInput {
  description?: string;
  required?: boolean;
  default?: string;
  type?: string;
}

export interface WorkflowCallOutput {
  description?: string;
  value?: string;
}

export interface WorkflowCallSecret {
  description?: string;
  required?: boolean;
}

// ============================================================================
// JOBS - Top-level execution units
// ============================================================================

export interface Job {
  name?: string; // Job display name
  
  // Execution environment
  'runs-on': string | string[]; // Runner: 'ubuntu-latest', etc.
  'timeout-minutes'?: number;
  environment?: string | EnvironmentConfig;
  concurrency?: ConcurrencySettings;
  
  // Permissions for GITHUB_TOKEN
  permissions?: Permissions | 'read-all' | 'write-all';
  
  // Conditional execution
  if?: string; // e.g., 'success()' or 'always()'
  
  // Job dependencies
  needs?: string | string[];
  
  // Matrix strategy for multiple configurations
  strategy?: {
    matrix: Record<string, (string | number | boolean)[]>;
    'fail-fast'?: boolean;
    'max-parallel'?: number;
  };
  
  // Container configuration
  container?: ContainerConfig | string;
  services?: Record<string, ContainerConfig>;
  
  // Environment variables for this job
  env?: Record<string, string>;
  
  // Default settings for this job
  defaults?: {
    run?: {
      shell?: string;
      'working-directory'?: string;
    };
  };
  
  // Steps to execute
  steps: Step[];
  
  // Outputs from this job
  outputs?: Record<string, string>;
}

export interface EnvironmentConfig {
  name: string;
  url?: string;
}

export interface ConcurrencySettings {
  group: string;
  'cancel-in-progress'?: boolean;
}

export interface Permissions {
  [key: string]: 'read' | 'write' | 'none';
}

export interface ContainerConfig {
  image: string;
  credentials?: {
    username?: string;
    password?: string;
  };
  env?: Record<string, string>;
  options?: string;
  ports?: (string | number)[];
  volumes?: string[];
}

// ============================================================================
// STEPS - Individual actions or scripts within a job
// ============================================================================

export interface Step {
  id?: string; // Reference ID for outputs
  name?: string; // Display name
  
  // Either 'uses' (action) or 'run' (script)
  uses?: string; // e.g., 'actions/checkout@v4'
  run?: string; // e.g., 'npm install'
  shell?: string; // e.g., 'bash', 'pwsh'
  
  // Action inputs
  with?: Record<string, string>;
  
  // Environment variables for this step
  env?: Record<string, string>;
  
  // Conditional execution
  if?: string;
  
  // Error handling
  'continue-on-error'?: boolean | string;
  
  // Timeout override
  'timeout-minutes'?: number;
  
  // Working directory override
  'working-directory'?: string;
}

// ============================================================================
// REACT FLOW / VISUAL EDITOR HELPERS
// ============================================================================

export interface JobNodeData {
  jobName: string;
  stepCount: number;
  'runs-on': string | string[];
}

export type EditingTarget =
  | { type: 'workflow'; data: Workflow }
  | { type: 'job'; jobName: string; data: Job }
  | { type: 'step'; jobName: string; stepIndex: number; data: Step };

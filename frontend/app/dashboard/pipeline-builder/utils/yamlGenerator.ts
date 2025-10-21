import { Workflow, WorkflowTrigger, Job, Step } from '../types';

/**
 * Convert a Workflow object to GitHub Actions YAML format
 * This generates the complete .github/workflows/main.yml structure
 */
export function pipelineToYaml(workflow: Workflow): string {
  const yaml: string[] = [];

  // Name
  yaml.push(`name: ${workflow.name || 'CI/CD Workflow'}`);
  yaml.push('');

  // Description (as comment if provided)
  if (workflow.description) {
    yaml.push(`# ${workflow.description}`);
    yaml.push('');
  }

  // Trigger/On
  yaml.push('on:');
  if (workflow.on) {
    yaml.push(generateTriggerYaml(workflow.on, 2));
  } else {
    yaml.push('  push:');
    yaml.push('    branches: [main]');
  }
  yaml.push('');

  // Environment variables (if any)
  if (workflow.env && Object.keys(workflow.env).length > 0) {
    yaml.push('env:');
    Object.entries(workflow.env).forEach(([key, value]) => {
      yaml.push(`  ${key}: ${formatYamlValue(value)}`);
    });
    yaml.push('');
  }

  // Jobs - iterate over object entries
  yaml.push('jobs:');
  const jobsEntries = Object.entries(workflow.jobs);
  if (jobsEntries.length > 0) {
    jobsEntries.forEach(([jobName, jobData], idx) => {
      const jobWithName: Job = { name: jobName, ...jobData };
      yaml.push(generateJobYaml(jobWithName, 2));
      if (idx < jobsEntries.length - 1) {
        yaml.push('');
      }
    });
  } else {
    yaml.push('  # No jobs configured');
  }

  return yaml.join('\n');
}

/**
 * Generate YAML for trigger configuration
 * Handles the union type WorkflowTrigger which can have multiple event types
 */
function generateTriggerYaml(trigger: WorkflowTrigger, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);

  // Handle union type - trigger can have push, pull_request, schedule, etc.
  if ('push' in trigger && trigger.push) {
    const config = trigger.push as any;
    lines.push(`${ind}push:`);
    if (typeof config === 'object') {
      if (config.branches && config.branches.length > 0) {
        lines.push(`${ind}  branches:`);
        config.branches.forEach((branch: string) => {
          lines.push(`${ind}    - ${branch}`);
        });
      }
      if (config.tags && config.tags.length > 0) {
        lines.push(`${ind}  tags:`);
        config.tags.forEach((tag: string) => {
          lines.push(`${ind}    - ${tag}`);
        });
      }
      if (config.paths && config.paths.length > 0) {
        lines.push(`${ind}  paths:`);
        config.paths.forEach((path: string) => {
          lines.push(`${ind}    - ${path}`);
        });
      }
    }
  }

  if ('pull_request' in trigger && trigger.pull_request) {
    const config = trigger.pull_request as any;
    lines.push(`${ind}pull_request:`);
    if (typeof config === 'object') {
      if (config.branches && config.branches.length > 0) {
        lines.push(`${ind}  branches:`);
        config.branches.forEach((branch: string) => {
          lines.push(`${ind}    - ${branch}`);
        });
      }
      if (config.paths && config.paths.length > 0) {
        lines.push(`${ind}  paths:`);
        config.paths.forEach((path: string) => {
          lines.push(`${ind}    - ${path}`);
        });
      }
    }
  }

  if ('schedule' in trigger && trigger.schedule && Array.isArray(trigger.schedule)) {
    lines.push(`${ind}schedule:`);
    trigger.schedule.forEach((schedule) => {
      lines.push(`${ind}  - cron: '${schedule.cron}'`);
    });
  }

  if ('workflow_dispatch' in trigger && trigger.workflow_dispatch) {
    lines.push(`${ind}workflow_dispatch:`);
    const config = trigger.workflow_dispatch as any;
    if (typeof config === 'object' && config.inputs && Object.keys(config.inputs).length > 0) {
      lines.push(`${ind}  inputs:`);
      Object.entries(config.inputs).forEach(([name, input]: [string, any]) => {
        lines.push(`${ind}    ${name}:`);
        if (input.description) {
          lines.push(`${ind}      description: '${input.description}'`);
        }
        if (input.required !== undefined) {
          lines.push(`${ind}      required: ${input.required}`);
        }
        if (input.default) {
          lines.push(`${ind}      default: '${input.default}'`);
        }
        if (input.type) {
          lines.push(`${ind}      type: ${input.type}`);
        }
        if (input.options && input.options.length > 0) {
          lines.push(`${ind}      options:`);
          input.options.forEach((opt: string) => {
            lines.push(`${ind}        - ${opt}`);
          });
        }
      });
    }
  }

  if ('release' in trigger && trigger.release) {
    lines.push(`${ind}release:`);
    lines.push(`${ind}  types: [created, published, edited]`);
  }

  return lines.join('\n');
}

/**
 * Generate a YAML-safe job key from the job name
 * Converts "Build App" -> "build-app", "Deploy (Prod)" -> "deploy-prod"
 */
function generateJobKey(jobName: string | undefined): string {
  if (!jobName) return 'job';
  return jobName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Remove consecutive dashes
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

/**
 * Generate YAML for a single job
 */
function generateJobYaml(job: Job, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);
  const jobInd = ' '.repeat(indent + 2);
  const jobKey = generateJobKey(job.name);

  lines.push(`${ind}${jobKey}:`);

  // runs-on (required)
  if (Array.isArray(job['runs-on'])) {
    lines.push(`${jobInd}runs-on: [${job['runs-on'].map((r) => `'${r}'`).join(', ')}]`);
  } else {
    lines.push(`${jobInd}runs-on: ${job['runs-on']}`);
  }

  // timeout-minutes
  if (job['timeout-minutes']) {
    lines.push(`${jobInd}timeout-minutes: ${job['timeout-minutes']}`);
  }

  // environment
  if (job.environment) {
    if (typeof job.environment === 'string') {
      lines.push(`${jobInd}environment: ${job.environment}`);
    } else {
      lines.push(`${jobInd}environment:`);
      lines.push(`${jobInd}  name: ${job.environment.name}`);
      if (job.environment.url) {
        lines.push(`${jobInd}  url: ${job.environment.url}`);
      }
    }
  }

  // concurrency
  if (job.concurrency) {
    lines.push(`${jobInd}concurrency:`);
    lines.push(`${jobInd}  group: ${job.concurrency.group}`);
    if (job.concurrency['cancel-in-progress'] !== undefined) {
      lines.push(`${jobInd}  cancel-in-progress: ${job.concurrency['cancel-in-progress']}`);
    }
  }

  // permissions
  if (job.permissions) {
    if (typeof job.permissions === 'string') {
      lines.push(`${jobInd}permissions: ${job.permissions}`);
    } else {
      lines.push(`${jobInd}permissions:`);
      Object.entries(job.permissions).forEach(([perm, value]) => {
        if (value) {
          lines.push(`${jobInd}  ${perm}: ${value}`);
        }
      });
    }
  }

  // strategy (matrix)
  if (job.strategy && job.strategy.matrix && Object.keys(job.strategy.matrix).length > 0) {
    lines.push(`${jobInd}strategy:`);
    if (job.strategy['fail-fast'] !== undefined) {
      lines.push(`${jobInd}  fail-fast: ${job.strategy['fail-fast']}`);
    }
    if (job.strategy['max-parallel'] !== undefined) {
      lines.push(`${jobInd}  max-parallel: ${job.strategy['max-parallel']}`);
    }
    lines.push(`${jobInd}  matrix:`);
    Object.entries(job.strategy.matrix).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        if (values.length === 1) {
          lines.push(`${jobInd}    ${key}: ${formatYamlValue(String(values[0]))}`);
        } else {
          lines.push(`${jobInd}    ${key}:`);
          values.forEach((value) => {
            lines.push(`${jobInd}      - ${formatYamlValue(String(value))}`);
          });
        }
      }
    });
  }

  // needs (dependencies) - convert job names to job keys
  if (job.needs) {
    const needsArray = Array.isArray(job.needs) ? job.needs : [job.needs];
    const needsKeys = needsArray.map((jobName) => generateJobKey(jobName));
    if (needsKeys.length === 1) {
      lines.push(`${jobInd}needs: ${needsKeys[0]}`);
    } else if (needsKeys.length > 1) {
      lines.push(`${jobInd}needs: [${needsKeys.join(', ')}]`);
    }
  }

  // env (job-level environment variables)
  if (job.env && Object.keys(job.env).length > 0) {
    lines.push(`${jobInd}env:`);
    Object.entries(job.env).forEach(([key, value]) => {
      lines.push(`${jobInd}  ${key}: ${formatYamlValue(value)}`);
    });
  }

  // if (conditional)
  if (job.if) {
    lines.push(`${jobInd}if: ${job.if}`);
  }

  // steps
  if (job.steps.length > 0) {
    lines.push(`${jobInd}steps:`);
    job.steps.forEach((step) => {
      lines.push(generateStepYaml(step, indent + 4));
      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Generate YAML for a single step
 * Determines if step is action or script based on presence of 'uses' or 'run'
 */
function generateStepYaml(step: Step, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);

  lines.push(`${ind}- name: ${step.name || 'Step'}`);

  if (step.uses) {
    // This is an action step
    lines.push(`${ind}  uses: ${step.uses}`);

    if (step.with && Object.keys(step.with).length > 0) {
      lines.push(`${ind}  with:`);
      Object.entries(step.with).forEach(([key, value]) => {
        lines.push(`${ind}    ${key}: ${formatYamlValue(value)}`);
      });
    }
  } else if (step.run) {
    // This is a run/script step
    lines.push(`${ind}  run: ${formatYamlValue(step.run)}`);

    if (step.shell) {
      lines.push(`${ind}  shell: ${step.shell}`);
    }

    if (step['working-directory']) {
      lines.push(`${ind}  working-directory: ${step['working-directory']}`);
    }
  }

  // env (step-level environment variables)
  if (step.env && Object.keys(step.env).length > 0) {
    lines.push(`${ind}  env:`);
    Object.entries(step.env).forEach(([key, value]) => {
      lines.push(`${ind}    ${key}: ${formatYamlValue(value)}`);
    });
  }

  // if (condition)
  if (step.if) {
    lines.push(`${ind}  if: ${step.if}`);
  }

  // continue-on-error
  if (step['continue-on-error']) {
    const value = typeof step['continue-on-error'] === 'boolean' 
      ? step['continue-on-error'] 
      : step['continue-on-error'];
    lines.push(`${ind}  continue-on-error: ${value}`);
  }

  // timeout-minutes
  if (step['timeout-minutes']) {
    lines.push(`${ind}  timeout-minutes: ${step['timeout-minutes']}`);
  }

  return lines.join('\n');
}

/**
 * Format a value for YAML output
 * Adds quotes if needed for strings with special characters
 */
function formatYamlValue(value: string): string {
  // If value contains special chars, wrap in quotes
  if (value.includes(':') || value.includes('\n') || value.includes('|') || value.includes('>')) {
    return `'${value.replace(/'/g, "''")}'`;
  }
  // If it's a multiline string, use literal block
  if (value.includes('\n')) {
    return `|\n${value
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}`;
  }
  return value;
}

/**
 * Download workflow as YAML file
 * Creates a .github/workflows/main.yml file for the user to download
 */
export function downloadPipelineYaml(workflow: Workflow): void {
  const yaml = pipelineToYaml(workflow);
  const blob = new Blob([yaml], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workflow.name?.toLowerCase().replace(/\s+/g, '-') || 'workflow'}.yml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy workflow YAML to clipboard
 */
export function copyPipelineYamlToClipboard(workflow: Workflow): Promise<void> {
  const yaml = pipelineToYaml(workflow);
  return navigator.clipboard.writeText(yaml);
}


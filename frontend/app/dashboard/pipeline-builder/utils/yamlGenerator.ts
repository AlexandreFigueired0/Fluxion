import { Pipeline, Trigger, Job, PipelineStep } from '../types';

/**
 * Convert a Pipeline object to GitHub Actions YAML format
 * This generates the complete .github/workflows/main.yml structure
 */
export function pipelineToYaml(pipeline: Pipeline): string {
  const yaml: string[] = [];

  // Name
  yaml.push(`name: ${pipeline.name || 'CI/CD Pipeline'}`);
  yaml.push('');

  // Description (as comment if provided)
  if (pipeline.description) {
    yaml.push(`# ${pipeline.description}`);
    yaml.push('');
  }

  // Trigger/On
  yaml.push('on:');
  yaml.push(generateTriggerYaml(pipeline.trigger, 2));
  yaml.push('');

  // Jobs
  yaml.push('jobs:');
  if (pipeline.jobs.length > 0) {
    pipeline.jobs.forEach((job) => {
      yaml.push(generateJobYaml(job, 2));
    });
  } else {
    yaml.push('  # No jobs configured');
  }

  return yaml.join('\n');
}

/**
 * Generate YAML for trigger configuration
 */
function generateTriggerYaml(trigger: Trigger, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);

  switch (trigger.event) {
    case 'push':
      lines.push(`${ind}push:`);
      if (trigger.branches && trigger.branches.length > 0) {
        lines.push(`${ind}  branches:`);
        trigger.branches.forEach((branch) => {
          lines.push(`${ind}    - ${branch}`);
        });
      }
      if (trigger.tags && trigger.tags.length > 0) {
        lines.push(`${ind}  tags:`);
        trigger.tags.forEach((tag) => {
          lines.push(`${ind}    - ${tag}`);
        });
      }
      if (trigger.paths && trigger.paths.length > 0) {
        lines.push(`${ind}  paths:`);
        trigger.paths.forEach((path) => {
          lines.push(`${ind}    - ${path}`);
        });
      }
      break;

    case 'pull_request':
      lines.push(`${ind}pull_request:`);
      if (trigger.branches && trigger.branches.length > 0) {
        lines.push(`${ind}  branches:`);
        trigger.branches.forEach((branch) => {
          lines.push(`${ind}    - ${branch}`);
        });
      }
      if (trigger.paths && trigger.paths.length > 0) {
        lines.push(`${ind}  paths:`);
        trigger.paths.forEach((path) => {
          lines.push(`${ind}    - ${path}`);
        });
      }
      break;

    case 'schedule':
      lines.push(`${ind}schedule:`);
      if (trigger.schedule) {
        lines.push(`${ind}  - cron: '${trigger.schedule}'`);
      }
      break;

    case 'workflow_dispatch':
      lines.push(`${ind}workflow_dispatch:`);
      if (trigger.inputs && Object.keys(trigger.inputs).length > 0) {
        lines.push(`${ind}  inputs:`);
        Object.entries(trigger.inputs).forEach(([name, input]) => {
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
            input.options.forEach((opt) => {
              lines.push(`${ind}        - ${opt}`);
            });
          }
        });
      }
      break;

    case 'release':
      lines.push(`${ind}release:`);
      lines.push(`${ind}  types: [created, published, edited]`);
      break;
  }

  return lines.join('\n');
}

/**
 * Generate YAML for a single job
 */
function generateJobYaml(job: Job, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);
  const jobInd = ' '.repeat(indent + 2);

  lines.push(`${ind}${job.id}:`);
  lines.push(`${jobInd}name: ${job.name || job.id}`);

  // runs-on
  if (Array.isArray(job.runsOn)) {
    lines.push(`${jobInd}runs-on: [${job.runsOn.map((r) => `'${r}'`).join(', ')}]`);
  } else {
    lines.push(`${jobInd}runs-on: ${job.runsOn}`);
  }

  // timeout-minutes
  if (job.timeout) {
    lines.push(`${jobInd}timeout-minutes: ${job.timeout}`);
  }

  // environment
  if (job.environment) {
    lines.push(`${jobInd}environment: ${job.environment}`);
  }

  // concurrency
  if (job.concurrency) {
    lines.push(`${jobInd}concurrency: ${job.concurrency}`);
  }

  // permissions
  if (job.permissions && Object.keys(job.permissions).length > 0) {
    lines.push(`${jobInd}permissions:`);
    Object.entries(job.permissions).forEach(([perm, value]) => {
      if (value) {
        lines.push(`${jobInd}  ${perm}: ${value}`);
      }
    });
  }

  // strategy (matrix)
  if (job.strategy && Object.keys(job.strategy).length > 0) {
    lines.push(`${jobInd}strategy:`);
    lines.push(`${jobInd}  matrix:`);
    Object.entries(job.strategy).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        if (values.length === 1) {
          lines.push(`${jobInd}    ${key}: ${values[0]}`);
        } else {
          lines.push(`${jobInd}    ${key}:`);
          values.forEach((value) => {
            lines.push(`${jobInd}      - ${value}`);
          });
        }
      }
    });
  }

  // needs (dependencies)
  if (job.needs && job.needs.length > 0) {
    if (job.needs.length === 1) {
      lines.push(`${jobInd}needs: ${job.needs[0]}`);
    } else {
      lines.push(`${jobInd}needs: [${job.needs.join(', ')}]`);
    }
  }

  // steps
  if (job.steps.length > 0) {
    lines.push(`${jobInd}steps:`);
    job.steps.forEach((step) => {
      lines.push(generateStepYaml(step, indent + 4));
    });
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate YAML for a single step
 */
function generateStepYaml(step: PipelineStep, indent: number): string {
  const lines: string[] = [];
  const ind = ' '.repeat(indent);
  const stepInd = ' '.repeat(indent + 2);

  lines.push(`${ind}- name: ${step.name || 'Step'}`);

  if (step.type === 'action') {
    if (step.uses) {
      lines.push(`${ind}  uses: ${step.uses}`);
    }
    if (step.with && Object.keys(step.with).length > 0) {
      lines.push(`${ind}  with:`);
      Object.entries(step.with).forEach(([key, value]) => {
        lines.push(`${ind}    ${key}: ${formatYamlValue(value)}`);
      });
    }
  } else if (step.type === 'run') {
    if (step.run) {
      lines.push(`${ind}  run: ${formatYamlValue(step.run)}`);
    }
    if (step.shell) {
      lines.push(`${ind}  shell: ${step.shell}`);
    }
    if (step.workingDirectory) {
      lines.push(`${ind}  working-directory: ${step.workingDirectory}`);
    }
  }

  // env
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
  if (step.continueOnError) {
    lines.push(`${ind}  continue-on-error: true`);
  }

  // timeout-minutes
  if (step.timeout) {
    lines.push(`${ind}  timeout-minutes: ${step.timeout}`);
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
 * Download pipeline as YAML file
 * Creates a .github/workflows/main.yml file for the user to download
 */
export function downloadPipelineYaml(pipeline: Pipeline): void {
  const yaml = pipelineToYaml(pipeline);
  const blob = new Blob([yaml], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${pipeline.name.toLowerCase().replace(/\s+/g, '-') || 'workflow'}.yml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy pipeline YAML to clipboard
 */
export function copyPipelineYamlToClipboard(pipeline: Pipeline): Promise<void> {
  const yaml = pipelineToYaml(pipeline);
  return navigator.clipboard.writeText(yaml);
}

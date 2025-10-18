import { Pipeline, Job, Trigger, PipelineStep } from '../types';

/**
 * Create a default trigger for push events
 */
export function createDefaultTrigger(): Trigger {
  return {
    event: 'push',
    branches: ['main'],
  };
}

/**
 * Create a default step that checks out code
 */
export function createCheckoutStep(): PipelineStep {
  return {
    id: `step_${Date.now()}`,
    name: 'Checkout Code',
    type: 'action',
    uses: 'actions/checkout@v4',
  };
}

/**
 * Create a default job
 */
export function createDefaultJob(name: string = 'Build'): Job {
  return {
    name,
    runsOn: 'ubuntu-latest',
    steps: [createCheckoutStep()],
  };
}

/**
 * Create a new pipeline with default values
 */
export function createDefaultPipeline(name: string = 'New Workflow'): Pipeline {
  return {
    id: `pipeline_${Date.now()}`,
    name,
    description: '',
    trigger: createDefaultTrigger(),
    jobs: [createDefaultJob('Build')],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a unique ID for components
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

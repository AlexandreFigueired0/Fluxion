import { Workflow, Job, WorkflowTrigger, Step } from '../types';

/**
 * Create a default trigger for push events
 */
export function createDefaultTrigger(): WorkflowTrigger {
  return {
    push: {
      branches: ['main'],
    },
  };
}

/**
 * Create a default step that checks out code
 */
export function createCheckoutStep(): Step {
  return {
    id: `step_${Date.now()}`,
    name: 'Checkout Code',
    uses: 'actions/checkout@v4',
  };
}

/**
 * Create a default job
 */
export function createDefaultJob(name: string = 'Build'): Job {
  return {
    name,
    'runs-on': 'ubuntu-latest',
    steps: [createCheckoutStep()],
  };
}

/**
 * Create a new workflow with default values
 */
export function createDefaultPipeline(name: string = 'New Workflow'): Workflow {
  return {
    name,
    description: '',
    on: createDefaultTrigger(),
    jobs: [createDefaultJob('Build')],
  };
}

/**
 * Generate a unique ID for components
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

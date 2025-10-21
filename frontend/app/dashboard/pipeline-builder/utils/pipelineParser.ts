import { Workflow } from '../types';

/**
 * Convert backend PipelineResponse JSON to frontend Workflow type
 */
export function parsePipelineFromBackend(data: any): Workflow {
  // The config_yaml from backend is the raw Workflow JSON
  let workflowData: Workflow;

  if (typeof data.config_yaml === 'string') {
    // If it's a string, parse it
    workflowData = JSON.parse(data.config_yaml);
  } else {
    // If it's already an object (from JSON deserialization)
    workflowData = data.config_yaml;
  }

  // Validate it has required fields
  if (!Array.isArray(workflowData.jobs)) {
    throw new Error('Invalid workflow data structure: jobs must be an array');
  }

  return workflowData;
}

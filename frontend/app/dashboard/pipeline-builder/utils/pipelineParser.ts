import { Pipeline } from '../types';

/**
 * Convert backend PipelineResponse JSON to frontend Pipeline type
 */
export function parsePipelineFromBackend(data: any): Pipeline {
  // The config_yaml from backend is the raw Pipeline JSON
  let pipelineData: Pipeline;

  if (typeof data.config_yaml === 'string') {
    // If it's a string, parse it
    pipelineData = JSON.parse(data.config_yaml);
  } else {
    // If it's already an object (from JSON deserialization)
    pipelineData = data.config_yaml;
  }

  // Validate it has required fields
  if (!pipelineData.name || !pipelineData.trigger || !Array.isArray(pipelineData.jobs)) {
    throw new Error('Invalid pipeline data structure');
  }

  return pipelineData;
}

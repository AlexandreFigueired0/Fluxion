import { Workflow } from '../types';



export function parsePipelineFromBackend(data: object): Workflow {
  return data as Workflow;
}

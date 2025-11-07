import yaml from 'js-yaml';
import { Workflow, Job } from '../types';

type WorkflowCandidate = Partial<Workflow> & Record<string, unknown>;
type WorkflowCandidateWithExtras = WorkflowCandidate & {
  config_yaml?: unknown;
  pipeline_json?: unknown;
  config?: unknown;
  workflow?: unknown;
};

/**
 * Convert backend pipeline response (which may contain YAML, JSON, or Workflow objects)
 * into the normalized frontend `Workflow` structure.
 */
export function parsePipelineFromBackend(data: unknown): Workflow {
  if (!data) {
    throw new Error('Pipeline response was empty.');
  }

  const response = data as WorkflowCandidateWithExtras & {
    name?: string;
    description?: string;
  };

  const configSource =
    response.pipeline_json ??
    response.config_yaml ??
    response.config ??
    response.workflow ??
    response;

  const workflow = normalizeWorkflow(configSource);

  if (typeof response.name === 'string' && response.name.trim()) {
    workflow.name = response.name;
  }

  if (typeof response.description === 'string') {
    workflow.description = response.description;
  }

  return workflow;
}

/**
 * Parse a JSON string into a Workflow.
 */
export function workflowFromJson(json: string): Workflow {
  return normalizeWorkflow(parseJson(json));
}

/**
 * Parse a YAML string into a Workflow.
 */
export function workflowFromYaml(yamlSource: string): Workflow {
  return normalizeWorkflow(parseYaml(yamlSource));
}

/**
 * Parse a string that could be JSON or YAML into a Workflow.
 */
export function workflowFromString(source: string): Workflow {
  return normalizeWorkflow(parseStringConfig(source));
}

/**
 * Serialize a Workflow into a pretty-printed JSON string.
 */
export function workflowToJson(workflow: Workflow, space: number = 2): string {
  return JSON.stringify(workflow, null, space);
}

function normalizeWorkflow(input: unknown): Workflow {
  const candidate = resolveWorkflowCandidate(input) as WorkflowCandidateWithExtras;

  const { jobs: rawJobs, ...rest } = candidate;
  const sanitized = { ...rest } as Record<string, unknown>;

  delete sanitized.pipeline_json;
  delete sanitized.config_yaml;
  delete sanitized.config;
  delete sanitized.workflow;

  return {
    ...sanitized,
    jobs: normalizeJobs(rawJobs),
  } as Workflow;
}

function resolveWorkflowCandidate(input: unknown): WorkflowCandidate {
  if (typeof input === 'string') {
    return parseStringConfig(input);
  }

  if (isPlainObject(input)) {
    return input as WorkflowCandidate;
  }

  throw new Error(
    'Unsupported pipeline configuration payload. Expecting JSON, YAML, or Workflow object.'
  );
}

function parseStringConfig(source: string): WorkflowCandidate {
  let jsonError: Error | undefined;

  try {
    return parseJson(source);
  } catch (err) {
    jsonError = err as Error;
  }

  try {
    return parseYaml(source);
  } catch (yamlError) {
    const message =
      `Unable to parse pipeline configuration. JSON error: ${jsonError?.message ?? 'n/a'}. ` +
      `YAML error: ${(yamlError as Error).message}`;
    const error = new Error(message);
    error.name = 'PipelineConfigParseError';
    throw error;
  }
}

function parseJson(source: string): WorkflowCandidate {
  const trimmed = source.trim();

  if (!trimmed) {
    return {} as WorkflowCandidate;
  }

  const parsed = JSON.parse(trimmed);

  if (!isPlainObject(parsed)) {
    throw new Error('JSON pipeline configuration must evaluate to an object.');
  }

  return parsed as WorkflowCandidate;
}

function parseYaml(source: string): WorkflowCandidate {
  const trimmed = source.trim();

  if (!trimmed) {
    return {} as WorkflowCandidate;
  }

  const parsed = yaml.load(trimmed);

  if (parsed === undefined) {
    return {} as WorkflowCandidate;
  }

  if (!isPlainObject(parsed)) {
    throw new Error('YAML pipeline configuration must evaluate to an object.');
  }

  return parsed as WorkflowCandidate;
}

function normalizeJobs(rawJobs: unknown): Record<string, Omit<Job, 'name'>> {
  if (!rawJobs) {
    return {};
  }

  if (Array.isArray(rawJobs)) {
    return rawJobs.reduce<Record<string, Omit<Job, 'name'>>>((acc, jobEntry, idx) => {
      if (!isPlainObject(jobEntry)) {
        return acc;
      }

      const jobObject = jobEntry as Record<string, unknown>;
      const jobName =
        typeof jobObject.name === 'string' && jobObject.name.trim()
          ? jobObject.name.trim()
          : `job_${idx + 1}`;

      const jobData = { ...jobObject };
      delete jobData.name;
      acc[jobName] = normalizeJob(jobData);
      return acc;
    }, {});
  }

  if (isPlainObject(rawJobs)) {
    return Object.entries(rawJobs as Record<string, unknown>).reduce<
      Record<string, Omit<Job, 'name'>>
    >((acc, [jobName, jobValue]) => {
      if (!isPlainObject(jobValue)) {
        return acc;
      }

      const jobRecord = { ...(jobValue as Record<string, unknown>) };
      delete jobRecord.name;
      acc[jobName] = normalizeJob(jobRecord);
      return acc;
    }, {});
  }

  return {};
}

function normalizeJob(jobData: Record<string, unknown>): Omit<Job, 'name'> {
  const steps = Array.isArray(jobData.steps)
    ? jobData.steps.map((step) => (isPlainObject(step) ? { ...step } : step))
    : [];

  return {
    ...jobData,
    steps,
  } as Omit<Job, 'name'>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

import { PipelineNode, PipelineEdge, NodeData } from '../types';

interface GitHubActionsJob {
  'runs-on': string;
  steps: any[];
}

interface GitHubActionsWorkflow {
  name: string;
  on: any;
  jobs: {
    [key: string]: GitHubActionsJob;
  };
}

export function generateGitHubActionsYAML(nodes: PipelineNode[], edges: PipelineEdge[]): string {
  const workflow: GitHubActionsWorkflow = {
    name: 'Generated Pipeline',
    on: {},
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [],
      },
    },
  };

  // Find trigger node
  const triggerNode = nodes.find(n => n.data.type === 'trigger');
  if (triggerNode) {
    const config = triggerNode.data.config;
    switch (config.event) {
      case 'push':
        workflow.on = {
          push: {
            branches: config.branches || ['main'],
          },
        };
        break;
      case 'pull_request':
        workflow.on = {
          pull_request: {
            branches: config.branches || ['main'],
          },
        };
        break;
      case 'release':
        workflow.on = { release: { types: ['published'] } };
        break;
      case 'schedule':
        workflow.on = { schedule: [{ cron: config.schedule || '0 0 * * *' }] };
        break;
      case 'workflow_dispatch':
        workflow.on = { workflow_dispatch: {} };
        break;
      default:
        workflow.on = { push: { branches: ['main'] } };
    }
  } else {
    workflow.on = { push: { branches: ['main'] } };
  }

  // Build execution order based on edges
  const nodeOrder = buildExecutionOrder(nodes, edges);
  
  // Generate steps from ordered nodes
  nodeOrder.forEach(node => {
    const steps = nodeToSteps(node.data);
    workflow.jobs.build.steps.push(...steps);
  });

  return convertToYAML(workflow);
}

function buildExecutionOrder(nodes: PipelineNode[], edges: PipelineEdge[]): PipelineNode[] {
  // Create adjacency list
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(node => {
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Topological sort
  const queue: PipelineNode[] = [];
  const result: PipelineNode[] = [];

  nodes.forEach(node => {
    if (inDegree.get(node.id) === 0) {
      queue.push(node);
    }
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    adjacency.get(node.id)?.forEach(neighborId => {
      const newDegree = (inDegree.get(neighborId) || 0) - 1;
      inDegree.set(neighborId, newDegree);
      
      if (newDegree === 0) {
        const neighbor = nodes.find(n => n.id === neighborId);
        if (neighbor) queue.push(neighbor);
      }
    });
  }

  return result;
}

function nodeToSteps(data: NodeData): any[] {
  const steps: any[] = [];

  switch (data.type) {
    case 'checkout':
      steps.push({
        name: data.label || 'Checkout code',
        uses: 'actions/checkout@v4',
        with: data.config.ref ? { ref: data.config.ref } : undefined,
      });
      break;

    case 'setup':
      const setupStep: any = {
        name: data.label || `Setup ${data.config.language}`,
      };

      switch (data.config.language) {
        case 'node':
          setupStep.uses = 'actions/setup-node@v4';
          setupStep.with = {
            'node-version': data.config.version || '18.x',
          };
          if (data.config.cache) {
            setupStep.with.cache = 'npm';
          }
          break;
        case 'python':
          setupStep.uses = 'actions/setup-python@v5';
          setupStep.with = {
            'python-version': data.config.version || '3.10',
          };
          break;
        case 'go':
          setupStep.uses = 'actions/setup-go@v5';
          setupStep.with = {
            'go-version': data.config.version || '1.21',
          };
          break;
        case 'java':
          setupStep.uses = 'actions/setup-java@v4';
          setupStep.with = {
            'java-version': data.config.version || '17',
            distribution: 'temurin',
          };
          break;
        default:
          setupStep.uses = `actions/setup-${data.config.language}@v4`;
      }
      steps.push(setupStep);
      break;

    case 'build':
      steps.push({
        name: data.label || 'Build',
        run: data.config.command || 'npm run build',
        'working-directory': data.config.workingDirectory || undefined,
      });
      break;

    case 'test':
      steps.push({
        name: data.label || 'Run tests',
        run: data.config.command || 'npm test',
        'working-directory': data.config.workingDirectory || undefined,
      });
      break;

    case 'deploy':
      if (data.config.platform === 'docker') {
        steps.push({
          name: data.label || 'Build Docker image',
          run: 'docker build -t myapp .',
        });
      } else {
        steps.push({
          name: data.label || 'Deploy',
          run: data.config.command || 'echo "Deploy step"',
        });
      }
      break;

    case 'custom':
      const customStep: any = {
        name: data.label || 'Custom step',
      };
      
      if (data.config.uses) {
        customStep.uses = data.config.uses;
        if (data.config.with) {
          customStep.with = data.config.with;
        }
      } else if (data.config.run) {
        customStep.run = data.config.run;
      }
      
      if (data.config.env) {
        customStep.env = data.config.env;
      }
      
      steps.push(customStep);
      break;
  }

  return steps;
}

function convertToYAML(obj: any, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  let yaml = '';

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      yaml += `${indentStr}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${indentStr}- `;
          const itemYaml = convertToYAML(item, indent + 1);
          // Remove first indent for the first line of the item
          const lines = itemYaml.split('\n');
          yaml += lines[0].trim() + '\n';
          yaml += lines.slice(1).join('\n');
          if (lines.length > 1) yaml += '\n';
        } else {
          yaml += `${indentStr}- ${item}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${indentStr}${key}:\n`;
      yaml += convertToYAML(value, indent + 1);
    } else if (typeof value === 'string') {
      // Escape strings with special characters
      if (value.includes(':') || value.includes('#') || value.includes('\n')) {
        yaml += `${indentStr}${key}: "${value}"\n`;
      } else {
        yaml += `${indentStr}${key}: ${value}\n`;
      }
    } else {
      yaml += `${indentStr}${key}: ${value}\n`;
    }
  }

  return yaml;
}

export function downloadYAML(content: string, filename = 'workflow.yml') {
  const blob = new Blob([content], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

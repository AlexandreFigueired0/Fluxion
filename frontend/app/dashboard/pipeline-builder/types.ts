import { Node, Edge } from 'reactflow';

export type NodeType = 
  | 'trigger'
  | 'checkout'
  | 'setup'
  | 'build'
  | 'test'
  | 'deploy'
  | 'custom';

export interface NodeData {
  label: string;
  type: NodeType;
  config: Record<string, any>;
}

export interface TriggerConfig {
  event: 'push' | 'pull_request' | 'release' | 'schedule' | 'workflow_dispatch';
  branches?: string[];
  tags?: string[];
  schedule?: string;
}

export interface CheckoutConfig {
  repository?: string;
  ref?: string;
  fetchDepth?: number;
}

export interface SetupConfig {
  language: 'node' | 'python' | 'go' | 'java' | 'ruby' | 'rust' | 'dotnet';
  version?: string;
  cache?: boolean;
}

export interface BuildConfig {
  command: string;
  workingDirectory?: string;
}

export interface TestConfig {
  command: string;
  workingDirectory?: string;
  coverage?: boolean;
}

export interface DeployConfig {
  platform: 'docker' | 'vercel' | 'aws' | 'gcp' | 'azure' | 'custom';
  command?: string;
  environment?: string;
}

export interface CustomConfig {
  name: string;
  uses?: string;
  run?: string;
  with?: Record<string, string>;
  env?: Record<string, string>;
}

export type PipelineNode = Node<NodeData>;
export type PipelineEdge = Edge;

export interface Pipeline {
  id: string;
  name: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdAt: string;
  updatedAt: string;
}

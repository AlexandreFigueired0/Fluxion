'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PipelineNode as PipelineNodeComponent } from './PipelineNode';
import { NodePalette } from './NodePalette';
import { NodeConfigPanel } from './NodeConfigPanel';
import { CustomEdge } from './CustomEdge';
import { NodeType, NodeData, PipelineNode } from '../types';
import { generateGitHubActionsYAML, downloadYAML } from '../utils/yamlGenerator';
import { Download, Play, Trash2, FileCode } from 'lucide-react';

const nodeTypes = {
  pipelineNode: PipelineNodeComponent,
};

const edgeTypes = {
  custom: CustomEdge,
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

function PipelineBuilderFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: NodeData } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showYAML, setShowYAML] = useState(false);
  const [generatedYAML, setGeneratedYAML] = useState('');

  const deleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom', data: { onDelete: deleteEdge } }, eds)),
    [setEdges, deleteEdge]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(type, position);
    },
    [reactFlowInstance]
  );

  const addNode = (type: NodeType, position?: { x: number; y: number }) => {
    const defaultLabels: Record<NodeType, string> = {
      trigger: 'Workflow Trigger',
      checkout: 'Checkout Code',
      setup: 'Setup Environment',
      build: 'Build Project',
      test: 'Run Tests',
      deploy: 'Deploy',
      custom: 'Custom Step',
    };

    const defaultConfigs: Record<NodeType, any> = {
      trigger: { event: 'push', branches: ['main'] },
      checkout: {},
      setup: { language: 'node', version: '18.x', cache: true },
      build: { command: 'npm run build' },
      test: { command: 'npm test' },
      deploy: { platform: 'custom' },
      custom: {},
    };

    const newNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: defaultLabels[type],
        type,
        config: defaultConfigs[type],
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode({ id: node.id, data: node.data });
  }, []);

  const updateNode = (id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      })
    );
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const clearPipeline = () => {
    if (confirm('Are you sure you want to clear the pipeline?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  };

  const generateYAML = () => {
    const yaml = generateGitHubActionsYAML(nodes as PipelineNode[], edges);
    setGeneratedYAML(yaml);
    setShowYAML(true);
  };

  const exportYAML = () => {
    const yaml = generateGitHubActionsYAML(nodes as PipelineNode[], edges);
    downloadYAML(yaml, 'github-workflow.yml');
  };

  const createQuickStartPipeline = () => {
    const triggerNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: { x: 50, y: 200 },
      data: {
        label: 'On Push to Main',
        type: 'trigger',
        config: { event: 'push', branches: ['main'] },
      },
    };

    const checkoutNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: { x: 300, y: 200 },
      data: {
        label: 'Checkout Code',
        type: 'checkout',
        config: {},
      },
    };

    const setupNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: { x: 550, y: 200 },
      data: {
        label: 'Setup Node.js',
        type: 'setup',
        config: { language: 'node', version: '18.x', cache: true },
      },
    };

    const buildNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: { x: 800, y: 200 },
      data: {
        label: 'Build',
        type: 'build',
        config: { command: 'npm run build' },
      },
    };

    const testNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: { x: 1050, y: 200 },
      data: {
        label: 'Run Tests',
        type: 'test',
        config: { command: 'npm test' },
      },
    };

    setNodes([triggerNode, checkoutNode, setupNode, buildNode, testNode]);
    setEdges([
      { id: 'e1-2', source: triggerNode.id, target: checkoutNode.id, type: 'custom', data: { onDelete: deleteEdge } },
      { id: 'e2-3', source: checkoutNode.id, target: setupNode.id, type: 'custom', data: { onDelete: deleteEdge } },
      { id: 'e3-4', source: setupNode.id, target: buildNode.id, type: 'custom', data: { onDelete: deleteEdge } },
      { id: 'e4-5', source: buildNode.id, target: testNode.id, type: 'custom', data: { onDelete: deleteEdge } },
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Node Palette */}
      <div className="w-64 flex-shrink-0">
        <NodePalette onAddNode={(type) => addNode(type)} />
        
        <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Start</h3>
          <button
            onClick={createQuickStartPipeline}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition flex items-center justify-center gap-2"
          >
            <Play size={16} />
            Basic Pipeline
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-zinc-950"
          deleteKeyCode="Delete"
          defaultEdgeOptions={{
            type: 'custom',
            animated: true,
            style: { stroke: '#52525b', strokeWidth: 2 },
            data: { onDelete: deleteEdge },
          }}
        >
          <Background color="#3f3f46" variant={BackgroundVariant.Dots} />
          <Controls className="bg-zinc-900 border border-zinc-800" />
          <MiniMap
            className="bg-zinc-900 border border-zinc-800"
            nodeColor={(node) => {
              const colors: Record<NodeType, string> = {
                trigger: '#2563eb',
                checkout: '#16a34a',
                setup: '#9333ea',
                build: '#ea580c',
                test: '#ca8a04',
                deploy: '#dc2626',
                custom: '#52525b',
              };
              return colors[(node.data as NodeData).type] || '#52525b';
            }}
          />
          
          <Panel position="top-right" className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex gap-2">
            <button
              onClick={generateYAML}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition flex items-center gap-2"
              title="Preview YAML"
            >
              <FileCode size={16} />
              Preview
            </button>
            <button
              onClick={exportYAML}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition flex items-center gap-2"
              title="Export YAML"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={clearPipeline}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition flex items-center gap-2"
              title="Clear All"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right Sidebar - Configuration Panel */}
      {selectedNode && (
        <div className="w-80 flex-shrink-0">
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={updateNode}
            onDelete={deleteNode}
          />
        </div>
      )}

      {/* YAML Preview Modal */}
      {showYAML && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Generated GitHub Actions Workflow</h3>
              <button
                onClick={() => setShowYAML(false)}
                className="text-zinc-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <pre className="bg-zinc-950 border border-zinc-800 rounded p-4 overflow-auto text-sm text-zinc-300">
              {generatedYAML}
            </pre>
            <div className="flex gap-2 mt-4">
              <button
                onClick={exportYAML}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition flex items-center gap-2"
              >
                <Download size={16} />
                Download YAML
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedYAML);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PipelineBuilder() {
  return (
    <ReactFlowProvider>
      <PipelineBuilderFlow />
    </ReactFlowProvider>
  );
}

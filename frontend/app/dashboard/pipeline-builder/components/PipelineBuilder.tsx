'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  Connection,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PipelineNode as PipelineNodeComponent } from './PipelineNode';
import { NodePalette } from './NodePalette';
import { NodeConfigPanel } from './NodeConfigPanel';
import { NodeType, NodeData, PipelineNode } from '../types';

const nodeTypes = {
  pipelineNode: PipelineNodeComponent,
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

function PipelineBuilderFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: NodeData } | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
    const newNode: PipelineNode = {
      id: getId(),
      type: 'pipelineNode',
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `New ${type}`,
        type,
        config: {},
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

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Sidebar - Node Palette */}
      <div className="w-64 flex-shrink-0">
        <NodePalette onAddNode={(type) => addNode(type)} />
        <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-400 text-sm">
          Logic refactor in progress. Use the palette to sketch layout only.
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
          fitView
          className="bg-zinc-950"
          deleteKeyCode="Delete"
        >
          <Background color="#3f3f46" variant={BackgroundVariant.Dots} />
          <Controls className="bg-zinc-900 border border-zinc-800" />
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

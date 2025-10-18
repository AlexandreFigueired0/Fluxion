'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  addEdge,
  Connection,
  Node,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Hide React Flow watermark
import './pipelineBuilder.css';

import { Pipeline, Job, Trigger } from '../types';
import { createDefaultPipeline, generateId } from '../utils/pipelineUtils';
import { JobNode } from './JobNode';
import { TriggerEditor } from './TriggerEditor';
import { JobConfigPanel } from './JobConfigPanel';
import { CustomEdge } from './CustomEdge';
import { Save, Download, Plus, Maximize2 } from 'lucide-react';

const nodeTypes = {
  jobNode: JobNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function PipelineBuilderFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [pipeline, setPipeline] = useState<Pipeline>(createDefaultPipeline());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(pipeline.jobs[0]?.id || null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Initialize nodes and edges from pipeline jobs
  useEffect(() => {
    const newNodes = pipeline.jobs.map((job, idx) => ({
      id: job.id,
      type: 'jobNode',
      position: { x: idx * 350, y: 100 }, // Better spacing and offset from top
      data: {
        job,
        isSelected: job.id === selectedJobId,
      },
    }));

    // Create edges from job dependencies
    const newEdges = pipeline.jobs
      .flatMap((job) =>
        (job.needs || []).map((dependencyId) => ({
          id: `${dependencyId}-${job.id}`,
          source: dependencyId,
          target: job.id,
          type: 'custom',
          animated: true,
        }))
      );

    setNodes(newNodes);
    setEdges(newEdges);

    // Fit to view after nodes are set
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.3, minZoom: 0.3, maxZoom: 2 });
      }
    }, 100);
  }, [pipeline, selectedJobId, setNodes, setEdges, reactFlowInstance]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection and update job dependencies
      if (connection.source && connection.target) {
        const targetJob = pipeline.jobs.find((j) => j.id === connection.target);
        if (targetJob) {
          const updatedJob = {
            ...targetJob,
            needs: [...(targetJob.needs || []), connection.source],
          };
          updateJob(connection.target, updatedJob);
        }
      }
      setEdges((eds) => addEdge(connection, eds));
    },
    [pipeline]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleJobClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedJobId(node.id);
  }, []);

  const handleAddJob = () => {
    const newJob: Job = {
      id: generateId('job'),
      name: `Job ${pipeline.jobs.length + 1}`,
      runsOn: 'ubuntu-latest',
      steps: [],
    };

    setPipeline({
      ...pipeline,
      jobs: [...pipeline.jobs, newJob],
      updatedAt: new Date().toISOString(),
    });
    setSelectedJobId(newJob.id);
  };

  const updateJob = (jobId: string, updatedJob: Job) => {
    setPipeline({
      ...pipeline,
      jobs: pipeline.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteJob = (jobId: string) => {
    setPipeline({
      ...pipeline,
      jobs: pipeline.jobs.filter((job) => job.id !== jobId),
      updatedAt: new Date().toISOString(),
    });
    setSelectedJobId(null);
  };

  const handleTriggerUpdate = (trigger: Trigger) => {
    setPipeline({
      ...pipeline,
      trigger,
      updatedAt: new Date().toISOString(),
    });
  };

    const handleFitToView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.3, minZoom: 0.3, maxZoom: 2 });
    }
  };

  const handleTriggerExpandChange = (isExpanded: boolean) => {
    // Re-fit the canvas when trigger expands/collapses
    setTimeout(() => {
      handleFitToView();
    }, 150); // Wait for CSS transition to complete
  };

  const selectedJob = pipeline.jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-4">
      {/* Trigger Editor - Top Panel */}
      <div className="flex-shrink-0">
        <TriggerEditor 
          trigger={pipeline.trigger} 
          onUpdate={handleTriggerUpdate}
          onExpandChange={handleTriggerExpandChange}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-4 min-h-0">
      {/* Canvas */}
      <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 relative overflow-hidden" ref={reactFlowWrapper} style={{ '--rf-watermark': 'none' } as any}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDragOver={onDragOver}
          onNodeClick={handleJobClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-zinc-950"
          deleteKeyCode="Delete"
        >
          <Background color="#3f3f46" variant={BackgroundVariant.Dots} />
        </ReactFlow>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <button
            onClick={handleAddJob}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition shadow-lg"
          >
            <Plus size={18} />
            Add Job
          </button>
          <button
            onClick={handleFitToView}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition shadow-lg"
            title="Fit all jobs in view"
          >
            <Maximize2 size={18} />
            Fit View
          </button>
        </div>
      </div>        {/* Right Sidebar - Job Config Panel */}
        {selectedJob && (
          <JobConfigPanel
            job={selectedJob}
            onUpdate={(updatedJob) => updateJob(selectedJob.id, updatedJob)}
            onDelete={() => deleteJob(selectedJob.id)}
            onClose={() => setSelectedJobId(null)}
          />
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{pipeline.name}</h3>
          <p className="text-xs text-zinc-400">
            {pipeline.jobs.length} job{pipeline.jobs.length !== 1 ? 's' : ''} • Last updated{' '}
            {new Date(pipeline.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              // Save to localStorage for now
              localStorage.setItem('pipeline', JSON.stringify(pipeline));
              alert('Pipeline saved to localStorage');
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <Save size={18} />
            Save
          </button>

          <button
            disabled
            className="bg-zinc-800 text-zinc-500 font-semibold px-4 py-2 rounded flex items-center gap-2 cursor-not-allowed"
            title="Export YAML - Coming in Phase 2"
          >
            <Download size={18} />
            Export YAML
          </button>
        </div>
      </div>
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

'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { downloadPipelineYaml, copyPipelineYamlToClipboard } from '../utils/yamlGenerator';
import { JobNode } from './JobNode';
import { TriggerEditor } from './TriggerEditor';
import { JobConfigPanel } from './JobConfigPanel';
import { CustomEdge } from './CustomEdge';
import { Save, Download, Plus, Maximize2, Copy, Check } from 'lucide-react';

const nodeTypes = {
  jobNode: JobNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

function PipelineBuilderFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [pipeline, setPipeline] = useState<Pipeline>(createDefaultPipeline());
  const [selectedJobName, setSelectedJobName] = useState<string | null>(pipeline.jobs[0]?.name || null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Helper to get job key from name (same as YAML generator)
  // Memoize to prevent infinite useEffect loops
  const getJobKey = useCallback((jobName: string) =>
    jobName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''), []);

    // Compute nodes and edges from pipeline (memoized to prevent constant re-renders)
  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    const newNodes = pipeline.jobs.map((job, idx) => ({
      id: getJobKey(job.name),
      type: 'jobNode',
      position: { x: idx * 420, y: 100 }, // Increased spacing for larger cards
      data: {
        job,
        isSelected: job.name === selectedJobName,
      },
    }));

    // Create edges from job dependencies
    const newEdges = pipeline.jobs
      .flatMap((job) =>
        (job.needs || []).map((dependencyName) => {
          const dependencyKey = getJobKey(dependencyName);
          const jobKey = getJobKey(job.name);
          return {
            id: `${dependencyKey}-${jobKey}`,
            source: dependencyKey,
            target: jobKey,
            type: 'custom',
            animated: true,
          };
        })
      );

    return { nodes: newNodes, edges: newEdges };
  }, [pipeline.jobs, selectedJobName, getJobKey]);

  // Update React Flow nodes and edges when computed values change
  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

  // Initial fit to view on mount and when job count changes
  useEffect(() => {
    if (reactFlowInstance && computedNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.3, minZoom: 0.3, maxZoom: 2 });
      }, 100);
    }
  }, [reactFlowInstance, computedNodes.length]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection and update job dependencies
      if (connection.source && connection.target) {
        const targetJobName = pipeline.jobs.find((j) => getJobKey(j.name) === connection.target)?.name;
        const sourceJobName = pipeline.jobs.find((j) => getJobKey(j.name) === connection.source)?.name;
        
        if (targetJobName && sourceJobName) {
          const targetJob = pipeline.jobs.find((j) => j.name === targetJobName);
          if (targetJob && !targetJob.needs?.includes(sourceJobName)) {
            const updatedJob = {
              ...targetJob,
              needs: [...(targetJob.needs || []), sourceJobName],
            };
            updateJob(targetJobName, updatedJob);
          }
        }
      }
      setEdges((eds) => addEdge(connection, eds));
    },
    [pipeline, getJobKey]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleJobClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const jobName = pipeline.jobs.find((j) => getJobKey(j.name) === node.id)?.name;
    if (jobName) {
      setSelectedJobName(jobName);
    }
  }, [pipeline, getJobKey]);

  const handleAddJob = () => {
    const newJob: Job = {
      name: `Job ${pipeline.jobs.length + 1}`,
      runsOn: 'ubuntu-latest',
      steps: [],
    };

    setPipeline({
      ...pipeline,
      jobs: [...pipeline.jobs, newJob],
      updatedAt: new Date().toISOString(),
    });
    setSelectedJobName(newJob.name);
  };

  const updateJob = (jobName: string, updatedJob: Job) => {
    setPipeline((prev) => {
      const renamed = jobName !== updatedJob.name;

      const jobs = prev.jobs.map((job) => {
        if (job.name === jobName) {
          return updatedJob;
        }

        if (renamed && job.needs?.includes(jobName)) {
          return {
            ...job,
            needs: job.needs.map((need) => (need === jobName ? updatedJob.name : need)),
          };
        }

        return job;
      });

      return {
        ...prev,
        jobs,
        updatedAt: new Date().toISOString(),
      };
    });

    if (selectedJobName === jobName) {
      setSelectedJobName(updatedJob.name);
    }
  };

  const deleteJob = (jobName: string) => {
    setPipeline({
      ...pipeline,
      jobs: pipeline.jobs.filter((job) => job.name !== jobName),
      updatedAt: new Date().toISOString(),
    });
    setSelectedJobName(null);
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

  const selectedJob = pipeline.jobs.find((j) => j.name === selectedJobName);

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
            onUpdate={(updatedJob) => updateJob(selectedJob.name, updatedJob)}
            onDelete={() => deleteJob(selectedJob.name)}
            onClose={() => setSelectedJobName(null)}
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
            onClick={() => copyPipelineYamlToClipboard(pipeline).then(() => {
              setCopiedToClipboard(true);
              setTimeout(() => setCopiedToClipboard(false), 2000);
            })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
            title="Copy YAML to clipboard"
          >
            {copiedToClipboard ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy YAML
              </>
            )}
          </button>

          <button
            onClick={() => downloadPipelineYaml(pipeline)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
            title="Download as .yml file"
          >
            <Download size={18} />
            Download YAML
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

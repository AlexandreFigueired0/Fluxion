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

import { Workflow, Job, WorkflowTrigger } from '../types';
import { createDefaultPipeline } from '../utils/pipelineUtils';
import { JobNode } from './JobNode';
import { TriggerEditor } from './TriggerEditor';
import { JobConfigPanel } from './JobConfigPanel';
import { YamlPreviewModal } from './YamlPreviewModal';
import { CustomEdge } from './CustomEdge';
import { Save, Download, Plus, Maximize2, Copy, Check, AlertCircle, Loader } from 'lucide-react';
import pipelineService from '../services/pipelineService';
import { useSession } from 'next-auth/react';
import { parsePipelineFromBackend } from '../utils/pipelineParser';

const nodeTypes = {
  jobNode: JobNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface PipelineBuilderFlowProps {
  pipelineId?: string;
  initialWorkflow?: Workflow;
}

function PipelineBuilderFlow({ pipelineId, initialWorkflow }: PipelineBuilderFlowProps) {
  const { data: session } = useSession();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [pipeline, setPipeline] = useState<Workflow>(initialWorkflow || createDefaultPipeline());
  const [selectedJobName, setSelectedJobName] = useState<string | null>("");
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showYamlPreview, setShowYamlPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!pipelineId);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Helper to get job key from name (same as YAML generator)
  // Memoize to prevent infinite useEffect loops
  const getJobKey = useCallback((jobName: string) =>
    jobName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, ''), []);

  // Load pipeline from backend if pipelineId is provided
  useEffect(() => {
    if (!pipelineId || !session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const loadPipeline = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const userToken = session.user.id;
        const response = await pipelineService.getPipeline(userToken, pipelineId);
        const loadedPipeline = parsePipelineFromBackend(response);

        setPipeline(loadedPipeline);
        // Get first job name from jobs object
        const firstJobName = Object.keys(loadedPipeline.jobs)[0] || null;
        setSelectedJobName(firstJobName);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load pipeline';
        setLoadError(errorMessage);
        console.error('Load pipeline error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPipeline();
  }, [pipelineId, session?.user?.id]);

    // Compute nodes and edges from pipeline (memoized to prevent constant re-renders)
  const { nodes: computedNodes, edges: computedEdges } = useMemo(() => {
    const jobsArray = Object.entries(pipeline.jobs);
    const newNodes = jobsArray.map(([jobName, jobData], idx) => ({
      id: getJobKey(jobName),
      type: 'jobNode',
      position: { x: idx * 420, y: 100 }, // Increased spacing for larger cards
      data: {
        job: { name: jobName, ...jobData },
        isSelected: jobName === selectedJobName,
      },
    }));

    // Create edges from job dependencies
    const newEdges = jobsArray
      .flatMap(([jobName, jobData]) => {
        const needsArray = Array.isArray(jobData.needs) ? jobData.needs : (jobData.needs ? [jobData.needs] : []);
        return needsArray.map((dependencyName: string) => {
          const dependencyKey = getJobKey(dependencyName);
          const jobKey = getJobKey(jobName);
          return {
            id: `${dependencyKey}-${jobKey}`,
            source: dependencyKey,
            target: jobKey,
            type: 'custom',
            animated: true,
          };
        });
      });

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
        reactFlowInstance.fitView({ padding: 0.3, minZoom: 0.3, maxZoom: 1 });
      }, 100);
    }
  }, [reactFlowInstance, computedNodes.length]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection and update job dependencies
      if (connection.source && connection.target) {
        // Find job names by matching keys
        const targetJobName = Object.keys(pipeline.jobs).find(
          (jobName) => getJobKey(jobName) === connection.target
        );
        const sourceJobName = Object.keys(pipeline.jobs).find(
          (jobName) => getJobKey(jobName) === connection.source
        );
        
        if (targetJobName && sourceJobName) {
          const targetJobData = pipeline.jobs[targetJobName];
          if (targetJobData) {
            const needsArray = Array.isArray(targetJobData.needs) 
              ? targetJobData.needs 
              : (targetJobData.needs ? [targetJobData.needs] : []);
            if (!needsArray.includes(sourceJobName)) {
              const updatedJob = {
                ...targetJobData,
                needs: [...needsArray, sourceJobName],
              };
              updateJob(targetJobName, updatedJob as Job);
            }
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
    const jobName = Object.keys(pipeline.jobs).find((name) => getJobKey(name) === node.id);
    if (jobName) {
      setSelectedJobName(jobName);
    }
  }, [pipeline.jobs, getJobKey]);

  const handleAddJob = () => {
    const newJobName = `Job ${Object.keys(pipeline.jobs).length + 1}`;
    
    setPipeline({
      ...pipeline,
      jobs: {
        ...pipeline.jobs,
        [newJobName]: {
          'runs-on': 'ubuntu-latest',
          steps: [],
        },
      },
    });
    setSelectedJobName(newJobName);
  };

  const updateJob = (oldJobName: string, updatedJob: Job) => {
    setPipeline((prev) => {
      const newJobName = updatedJob.name || oldJobName;
      const renamed = oldJobName !== newJobName;
      
      // Build new jobs object
      let newJobs: Record<string, Omit<Job, 'name'>> = {};
      
      Object.entries(prev.jobs).forEach(([jobName, jobData]) => {
        if (jobName === oldJobName) {
          // Replace with updated job (without name field)
          const { name, ...jobDataWithoutName } = updatedJob;
          newJobs[newJobName] = jobDataWithoutName;
        } else if (renamed) {
          // Update dependencies if job was renamed
          const needsArray = Array.isArray(jobData.needs) 
            ? jobData.needs 
            : (jobData.needs ? [jobData.needs] : []);
          
          if (needsArray.includes(oldJobName)) {
            const updatedNeeds = needsArray.map((need: string) => 
              need === oldJobName ? newJobName : need
            ) as string[];
            newJobs[jobName] = {
              ...jobData,
              needs: updatedNeeds.length === 1 ? updatedNeeds[0] : updatedNeeds,
            };
          } else {
            newJobs[jobName] = jobData;
          }
        } else {
          newJobs[jobName] = jobData;
        }
      });

      return {
        ...prev,
        jobs: newJobs,
      };
    });

    if (selectedJobName === oldJobName) {
      setSelectedJobName(updatedJob.name || oldJobName);
    }
  };

  const deleteJob = (jobName: string) => {
    const newJobs = { ...pipeline.jobs };
    delete newJobs[jobName];
    
    setPipeline({
      ...pipeline,
      jobs: newJobs,
    });
    setSelectedJobName(null);
  };

  const handleTriggerUpdate = (trigger: WorkflowTrigger) => {
    setPipeline({
      ...pipeline,
      on: trigger,
    });
  };

  const handleFitToView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.3, minZoom: 0.3, maxZoom: 1 });
    }
  };

  const handleTriggerExpandChange = (isExpanded: boolean) => {
    // Re-fit the canvas when trigger expands/collapses
    setTimeout(() => {
      handleFitToView();
    }, 150); // Wait for CSS transition to complete
  };

  const handleSavePipeline = async () => {
    if (!session?.user?.id) {
      setSaveError('Authentication required');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const userToken = session.user.id;
      const userID = session.user.id;

      if (pipelineId) {
        // Update existing pipeline
        await pipelineService.updatePipeline(userToken, pipelineId, pipeline);
      } else {
        // Create new pipeline
        await pipelineService.createPipeline(userToken, userID, pipeline);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save pipeline';
      setSaveError(errorMessage);
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedJobData = selectedJobName ? pipeline.jobs[selectedJobName] : null;
  const selectedJob: Job | null = selectedJobData ? { name: selectedJobName || '', ...selectedJobData } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-8 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-4" size={40} />
        <p className="text-red-400 font-semibold mb-2">Failed to Load Pipeline</p>
        <p className="text-red-300 text-sm">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen gap-4">
      {/* Pipeline Metadata Panel */}
      <div className="flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Pipeline Name</label>
            <input
              type="text"
              value={pipeline.name}
              onChange={(e) => setPipeline({ ...pipeline, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g., CI/CD Pipeline"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-2">Description</label>
            <input
              type="text"
              value={pipeline.description || ''}
              onChange={(e) => setPipeline({ ...pipeline, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              placeholder="What does this pipeline do?"
            />
          </div>
        </div>
      </div>

      {/* Trigger Editor - Top Panel */}
      <div className="flex-shrink-0">
        <TriggerEditor 
          trigger={pipeline.on} 
          onUpdate={handleTriggerUpdate}
          onExpandChange={handleTriggerExpandChange}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex gap-4 flex-1 min-h-0">
      {/* Canvas */}
      <div className="flex-1 bg-zinc-950 rounded-lg border border-zinc-800 relative" ref={reactFlowWrapper} style={{ '--rf-watermark': 'none' } as any}>
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
        {selectedJob && selectedJob.name && (
          <JobConfigPanel
            job={selectedJob}
            onUpdate={(updatedJob) => updateJob(selectedJob.name!, updatedJob)}
            onDelete={() => deleteJob(selectedJob.name!)}
            onClose={() => setSelectedJobName(null)}
          />
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{pipeline.name}</h3>
          <p className="text-xs text-zinc-400">
            {Object.keys(pipeline.jobs).length} job{Object.keys(pipeline.jobs).length !== 1 ? 's' : ''}
          </p>
          {saveError && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {saveError}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSavePipeline}
            disabled={isSaving}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
          >
            {isSaving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>

          <button
            onClick={() => setShowYamlPreview(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
            title="Preview YAML"
          >
            <Download size={18} />
            Preview YAML
          </button>
        </div>
      </div>

      {/* YAML Preview Modal */}
      <YamlPreviewModal 
        pipeline={pipeline}
        isOpen={showYamlPreview} 
        onClose={() => setShowYamlPreview(false)}
      />
    </div>
  );
}

export function PipelineBuilder({ pipelineId, initialWorkflow }: PipelineBuilderFlowProps) {
  return (
    <ReactFlowProvider>
      <PipelineBuilderFlow pipelineId={pipelineId} initialWorkflow={initialWorkflow} />
    </ReactFlowProvider>
  );
}

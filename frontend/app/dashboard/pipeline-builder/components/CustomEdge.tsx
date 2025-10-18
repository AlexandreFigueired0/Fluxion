'use client';

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';
import { X } from 'lucide-react';
import { useState } from 'react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#ea580c' : '#52525b',
        }} 
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        {selected && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              className="w-6 h-6 bg-red-600 hover:bg-red-700 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
              onClick={handleDelete}
              title="Delete connection (or press Delete key)"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

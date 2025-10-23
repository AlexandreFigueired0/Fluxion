'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Workflow, Code2, Play } from 'lucide-react';

const WorkflowTransition = () => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Sample YAML for demonstration
  const sampleYaml = `name: CI Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test`;

  const jobs = [
    { name: 'build', color: 'from-blue-500 to-blue-600', steps: 3 },
    { name: 'test', color: 'from-orange-500 to-orange-600', steps: 4 },
    { name: 'deploy', color: 'from-green-500 to-green-600', steps: 2 }
  ];

  const generatedYaml = `name: Enhanced CI Pipeline
on: 
  push:
    branches: [main]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm build
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run deploy`;

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearTimeout(timer);
  }, [step, isAnimating]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 border-t border-zinc-800">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
          <Workflow size={16} className="text-orange-500" />
          <span className="text-sm text-zinc-400">New Feature</span>
        </div>
        <h2 className="text-4xl font-black mb-4">Visual Workflow Builder</h2>
        <p className="text-zinc-400 text-lg">From YAML to visual blocks and back—edit with confidence</p>
      </div>

      {/* Interactive Demo Container */}
      <div className="relative">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-8">
          {['YAML Input', 'Parse', 'Visual Edit', 'YAML Output'].map((label, index) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                  step >= index
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {index + 1}
              </div>
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-500 ${
                  step > index ? 'bg-orange-500' : 'bg-zinc-800'
                }`}
              />
            </div>
          ))}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            4
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* YAML Input Panel */}
          <div
            className={`transition-all duration-500 ${
              step === 0 ? 'lg:col-span-2 opacity-100 scale-100' : 'lg:col-span-1 opacity-60 scale-95'
            }`}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex items-center gap-2">
                <Code2 size={16} className="text-orange-500" />
                <span className="text-sm font-mono text-zinc-300">workflow.yml</span>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-300 max-h-64 overflow-y-auto">
                <pre>{sampleYaml}</pre>
              </div>
            </div>
          </div>

          {/* Parsing Animation */}
          {step >= 1 && (
            <div className="hidden lg:flex items-center justify-center opacity-100 animate-pulse">
              <div className="text-center">
                <Play size={24} className="text-orange-500 mx-auto mb-2 animate-bounce" />
                <span className="text-xs text-zinc-400">Parsing...</span>
              </div>
            </div>
          )}

          {/* Visual Block Editor */}
          <div
            className={`lg:col-span-2 transition-all duration-500 ${
              step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'
            }`}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex items-center gap-2">
                <Workflow size={16} className="text-orange-500" />
                <span className="text-sm font-mono text-zinc-300">Visual Builder</span>
              </div>
              <div className="p-8 h-64 bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col justify-center items-center gap-8">
                {/* Job Nodes */}
                <div className="flex gap-4 justify-center w-full flex-wrap items-center">
                  {jobs.map((job, index) => (
                    <React.Fragment key={job.name}>
                      <div
                        className={`bg-gradient-to-br ${job.color} rounded-lg px-8 py-5 text-white font-semibold text-sm shadow-lg transform transition-all duration-300 hover:scale-110 cursor-grab active:cursor-grabbing border border-opacity-50 ${
                          step === 2 ? 'animate-slideIn' : ''
                        }`}
                        style={{ 
                          animationDelay: `${index * 200}ms`,
                          boxShadow: step === 2 ? `0 0 20px rgba(255, 107, 53, 0.3)` : 'none'
                        }}
                      >
                        <div className="mb-2 font-bold">{job.name.charAt(0).toUpperCase() + job.name.slice(1)}</div>
                        <div className="text-xs opacity-80">{job.steps} steps</div>
                      </div>
                      {index < jobs.length - 1 && (
                        <div className={`flex items-center text-zinc-600 transition-all duration-300 ${
                          step === 2 ? 'opacity-100 animate-flowRight' : 'opacity-0'
                        }`} style={{ animationDelay: `${400 + index * 200}ms` }}>
                          <ChevronRight size={28} className="font-bold" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Drag Hint */}
                <div className="text-center text-xs text-zinc-500 mt-4 animate-pulse">
                  ✨ Drag to reorder • Click to edit • Delete to remove
                </div>
              </div>
            </div>
          </div>

          {/* YAML Output Panel */}
          <div
            className={`transition-all duration-500 ${
              step >= 3 ? 'lg:col-span-2 opacity-100 scale-100' : 'lg:col-span-1 opacity-0 scale-95 hidden'
            }`}
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex items-center gap-2">
                <Code2 size={16} className="text-green-500" />
                <span className="text-sm font-mono text-zinc-300">Enhanced Workflow</span>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-300 max-h-64 overflow-y-auto">
                <pre className="text-green-400">{generatedYaml}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={() => {
              setStep(Math.max(0, step - 1));
              setIsAnimating(false);
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition"
          >
            ← Previous
          </button>

          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm text-white font-semibold transition"
          >
            {isAnimating ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={() => {
              setStep(Math.min(3, step + 1));
              setIsAnimating(false);
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm transition"
          >
            Next →
          </button>
        </div>

        {/* Step Description */}
        <div className="mt-8 text-center text-sm text-zinc-400">
          {step === 0 && '📝 Import your existing YAML workflow'}
          {step === 1 && '⚙️ Fluxion intelligently parses your configuration'}
          {step === 2 && '🎨 Edit visually with drag-and-drop blocks'}
          {step === 3 && '✨ Export enhanced YAML with best practices'}
        </div>
      </div>

      {/* Benefit Callout */}
      <div className="mt-16 bg-gradient-to-r from-orange-950/20 to-orange-950/10 border border-orange-900/30 rounded-lg p-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-orange-500 mb-2">5x</div>
            <div className="text-sm text-zinc-400">Faster workflow editing</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500 mb-2">0%</div>
            <div className="text-sm text-zinc-400">Syntax errors after export</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500 mb-2">100%</div>
            <div className="text-sm text-zinc-400">Best practices applied</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTransition;

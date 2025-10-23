'use client';

import React, { useState } from 'react';
import { ArrowRight, Workflow, Code2, Sparkles } from 'lucide-react';

const WorkflowTransition = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { id: 0, label: 'YAML Input', icon: Code2, emoji: '📝', description: 'Import your existing YAML workflow' },
    { id: 1, label: 'Parse', icon: Sparkles, emoji: '⚙️', description: 'Fluxion intelligently parses your configuration' },
    { id: 2, label: 'Visual Edit', icon: Workflow, emoji: '🎨', description: 'Edit visually with drag-and-drop blocks' },
    { id: 3, label: 'YAML Output', icon: Code2, emoji: '✨', description: 'Export enhanced YAML with best practices' }
  ];

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

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800/50">
      {/* Header */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-full mb-6 backdrop-blur-sm">
          <Workflow size={16} className="text-orange-500" />
          <span className="text-sm text-zinc-400 font-medium">Visual Pipeline Builder</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Edit Workflows Visually
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Transform YAML into intuitive visual blocks. Edit, rearrange, and export—all without touching code.
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex justify-between items-center mb-12 max-w-3xl mx-auto">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setStep(s.id)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= s.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110'
                    : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {index + 1}
              </button>
              <span className={`text-xs font-medium transition-colors hidden sm:block ${
                step >= s.id ? 'text-orange-500' : 'text-zinc-600'
              }`}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-3 transition-all duration-500">
                <div className={`h-full transition-all duration-500 ${
                  step > s.id ? 'bg-orange-500' : 'bg-zinc-800/50'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[400px] mb-12">
        {/* Step 0: YAML Input */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-orange-500" />
                  <span className="text-sm font-mono text-zinc-300">workflow.yml</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
              </div>
              <div className="p-6 font-mono text-sm text-zinc-300 leading-relaxed">
                <pre className="whitespace-pre-wrap">{sampleYaml}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Parsing Animation */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
                  <Sparkles size={40} className="text-white" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-orange-500/20 animate-ping" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Analyzing Structure</h3>
              <p className="text-zinc-400">Parsing jobs, steps, and dependencies...</p>
            </div>
          </div>
        </div>

        {/* Step 2: Visual Builder */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="bg-zinc-800/30 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
              <Workflow size={16} className="text-orange-500" />
              <span className="text-sm font-mono text-zinc-300">Visual Builder</span>
            </div>
            <div className="p-12 min-h-[320px] bg-gradient-to-br from-zinc-950/50 to-zinc-900/50 flex flex-col justify-center items-center">
              {/* Job Nodes */}
              <div className="flex gap-6 justify-center items-center flex-wrap mb-8">
                {jobs.map((job, index) => (
                  <React.Fragment key={job.name}>
                    <div
                      className={`group bg-gradient-to-br ${job.color} rounded-xl px-8 py-6 text-white font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 cursor-move border border-white/10`}
                      style={{
                        animation: step === 2 ? `fadeInUp 0.5s ease-out ${index * 0.15}s both` : 'none'
                      }}
                    >
                      <div className="text-base font-bold mb-1">{job.name.charAt(0).toUpperCase() + job.name.slice(1)}</div>
                      <div className="text-xs opacity-75">{job.steps} steps</div>
                    </div>
                    {index < jobs.length - 1 && (
                      <ArrowRight 
                        size={24} 
                        className="text-zinc-600 transition-all duration-300" 
                        style={{
                          animation: step === 2 ? `fadeIn 0.4s ease-out ${0.5 + index * 0.15}s both` : 'none'
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Interactive Hint */}
              <div className="text-center text-sm text-zinc-500 space-y-1">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span>🖱️ Drag to reorder</span>
                  <span>✏️ Click to edit</span>
                  <span>🗑️ Delete to remove</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: YAML Output */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
          }`}
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-zinc-900/50 border border-green-500/20 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-green-500" />
                  <span className="text-sm font-mono text-zinc-300">enhanced-workflow.yml</span>
                </div>
                <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-500/10 rounded">Ready to export</span>
              </div>
              <div className="p-6 font-mono text-sm text-green-400/90 leading-relaxed max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{generatedYaml}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Description */}
      <div className="text-center mb-12">
        <p className="text-base text-zinc-400 font-medium">
          <span className="text-2xl mr-2">{steps[step].emoji}</span>
          {steps[step].description}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center gap-3 mb-16">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            step === 0 
              ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed' 
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={() => setStep(Math.min(3, step + 1))}
          disabled={step === 3}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            step === 3 
              ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
          }`}
        >
          {step === 3 ? 'Complete' : 'Next →'}
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-orange-500/5 to-orange-600/5 border border-orange-500/10 rounded-2xl p-8 backdrop-blur-sm">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-black bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">5x</div>
            <div className="text-sm text-zinc-400 font-medium">Faster workflow editing</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">Zero</div>
            <div className="text-sm text-zinc-400 font-medium">Syntax errors guaranteed</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-black bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">100%</div>
            <div className="text-sm text-zinc-400 font-medium">Best practices applied</div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default WorkflowTransition;

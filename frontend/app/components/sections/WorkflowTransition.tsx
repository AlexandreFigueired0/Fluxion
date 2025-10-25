'use client';

import React, { useState } from 'react';
import { ArrowRight, Workflow, Code2, Sparkles } from 'lucide-react';

const WorkflowTransition = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { id: 0, label: 'Generate YAML', icon: Sparkles, emoji: '⚡', description: 'Fluxion generates your initial workflow configuration' },
    { id: 1, label: 'Visual Editor', icon: Workflow, emoji: '🎨', description: 'Edit visually with drag-and-drop blocks and export back to yaml when ready' }
  ];

  const sampleYaml = `name: CI Pipeline
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
      - run: npm build`;

  const jobs = [
    { name: 'build', color: 'from-blue-500 to-blue-600', steps: 3 },
    { name: 'test', color: 'from-orange-500 to-orange-600', steps: 4 },
    { name: 'deploy', color: 'from-green-500 to-green-600', steps: 2 }
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-12 border-t border-zinc-800/50">
      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Generate & Edit Workflows Visually
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
        {/* Step 0: Generate YAML */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          <div className="grid md:grid-cols-2 gap-6 items-center h-full">
            {/* User Prompt Input */}
            <div className="space-y-4">
              <div className="text-sm text-zinc-400 font-medium mb-3">User Input</div>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center gap-2">
                  <Sparkles size={16} className="text-orange-500" />
                  <span className="text-sm font-mono text-zinc-300">Generate Workflow</span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-2 block">Describe your workflow</label>
                    <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50 min-h-[120px]">
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        &ldquo;Create a CI/CD pipeline for my Node.js app. 
                        Build, run tests, and deploy to production on main branch.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow/Flow Indicator */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 shadow-xl">
                <Sparkles size={16} className="text-orange-500 animate-pulse" />
                <ArrowRight size={20} className="text-orange-500" />
              </div>
            </div>

            {/* Generated YAML Output */}
            <div className="space-y-4">
              <div className="text-sm text-zinc-400 font-medium mb-3">Generated Output</div>
              <div className="bg-zinc-900/50 border border-orange-500/20 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-orange-500" />
                    <span className="text-sm font-mono text-zinc-300">workflow.yml</span>
                  </div>
                  <span className="text-xs text-orange-500 font-medium px-2 py-1 bg-orange-500/10 rounded flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    Generated
                  </span>
                </div>
                <div className="p-4 font-mono text-xs text-zinc-300 leading-relaxed max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{sampleYaml}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Visual Editor */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Pipeline Builder Header */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-t-xl px-4 py-3 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-orange-500" />
                <span className="text-sm font-mono text-zinc-300">Pipeline Builder</span>
              </div>
              <div className="flex gap-2">
                <button className="text-xs text-white font-medium px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors flex items-center gap-1.5 shadow-lg">
                  <Code2 size={14} />
                  Export YAML
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-zinc-950/80 border-x border-b border-zinc-800/50 rounded-b-xl backdrop-blur-sm relative overflow-hidden">
              {/* Dot Grid Background */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: 'radial-gradient(circle, #52525b 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  opacity: 0.3
                }}
              />

              {/* Job Nodes Container */}
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="flex gap-8 items-center">
                  {jobs.map((job, index) => (
                    <React.Fragment key={job.name}>
                      {/* Job Card - Styled like actual PipelineBuilder */}
                      <div
                        className="bg-zinc-700 border-2 border-zinc-600 rounded-lg px-5 py-4 min-w-[240px] shadow-xl transform transition-all duration-300 hover:scale-105 cursor-pointer relative"
                        style={{
                          animation: step === 1 ? `fadeInUp 0.5s ease-out ${index * 0.15}s both` : 'none'
                        }}
                      >
                        {/* Connection Handles */}
                        {index > 0 && (
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-zinc-900 rounded-full" />
                        )}
                        {index < jobs.length - 1 && (
                          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-zinc-900 rounded-full" />
                        )}

                        {/* Job Header */}
                        <h3 className="text-white font-bold text-base mb-1">
                          {job.name.charAt(0).toUpperCase() + job.name.slice(1)}
                        </h3>
                        <p className="text-white/70 text-sm mb-3">ubuntu-latest</p>

                        {/* Steps Preview */}
                        <div className="bg-white/10 rounded px-3 py-2">
                          <p className="text-white/80 text-sm font-semibold">
                            {job.steps} step{job.steps !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Connection Line */}
                      {index < jobs.length - 1 && (
                        <div 
                          className="flex items-center"
                          style={{
                            animation: step === 1 ? `fadeIn 0.4s ease-out ${0.5 + index * 0.15}s both` : 'none'
                          }}
                        >
                          <div className="w-12 h-0.5 bg-zinc-600" />
                          <ArrowRight size={16} className="text-zinc-600 -ml-2" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Floating Hint */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>🖱️ Drag & drop</span>
                  <span>✏️ Click to edit</span>
                  <span>➕ Add jobs</span>
                </div>
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
          onClick={() => setStep(Math.min(1, step + 1))}
          disabled={step === 1}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            step === 1 
              ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
          }`}
        >
          {step === 1 ? 'Complete' : 'Next →'}
        </button>
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

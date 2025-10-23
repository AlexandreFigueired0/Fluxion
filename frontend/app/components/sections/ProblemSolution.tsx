import React from 'react'

const ProblemSolution = () => {
  const problems = [
    "Large unreadable YAML files",
    "Hours wasted debugging YAML indentation",
    "Cryptic error messages with no guidance",
    "Workflows that never complete successfully"
  ];

  const solutions = [
    "Generates workflows that actually work",
    "Detects your language, framework, dependencies",
    "Easy workflow building with visual editor",
    "Better communication of workflow behavior"
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 border-t border-zinc-800">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">The Problem</h3>
          <h2 className="text-4xl font-black">GitHub Actions YAML hell</h2>
          <div className="space-y-4 text-zinc-400">
            {problems.map((problem) => (
              <div key={problem} className="flex gap-3">
                <div className="text-red-500 font-bold">×</div>
                <div>{problem}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider">The Solution</h3>
          <h2 className="text-4xl font-black">Fluxion reads your stack, fixes your workflows</h2>
          <div className="space-y-4 text-zinc-400">
            {solutions.map((solution) => (
              <div key={solution} className="flex gap-3">
                <div className="text-orange-500 font-bold">✓</div>
                <div>{solution}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemSolution;
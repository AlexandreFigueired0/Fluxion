import React from 'react'

const Use = () => {
  const steps = [
    {
      num: "01",
      title: "Install",
      cmd: "brew install fluxion",
      desc: "One command. Works on Mac, Linux, Windows."
    },
    {
      num: "02",
      title: "Generate",
      cmd: "fluxion generate 'deploy to AWS'",
      desc: "Detects your project. Creates perfect workflow."
    },
    {
      num: "03",
      title: "Debug",
      cmd: "fluxion debug",
      desc: "Paste error. Get solution. Ship code."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 border-t border-zinc-800">
      <h2 className="text-4xl font-black mb-16 text-center">Three commands. That's it.</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div 
            key={step.num} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 hover:border-orange-600/50 transition"
          >
            <div className="text-5xl font-black text-zinc-800 mb-4">{step.num}</div>
            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
            <div className="bg-zinc-950 rounded px-4 py-3 font-mono text-sm text-orange-400 mb-4">
              {step.cmd}
            </div>
            <p className="text-zinc-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Use;

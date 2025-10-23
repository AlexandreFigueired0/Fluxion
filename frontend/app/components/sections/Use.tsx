import React from 'react';
import { Sparkles, Workflow, Download } from 'lucide-react';

const Use = () => {
  const steps = [
    {
      num: "01",
      title: "Describe",
      icon: Sparkles,
      desc: "Tell Fluxion what you need in plain English. Our AI understands your project."
    },
    {
      num: "02",
      title: "Edit Visually",
      icon: Workflow,
      desc: "Drag, drop, and customize your workflow in our visual builder. No YAML required."
    },
    {
      num: "03",
      title: "Export",
      icon: Download,
      desc: "Download your production-ready workflow and deploy instantly to GitHub Actions."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 border-t border-zinc-800">
      <h2 className="text-4xl font-black mb-16 text-center">Three steps. That&apos;s it.</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div 
            key={step.num} 
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 hover:border-orange-600/50 transition group"
          >
            <div className="text-5xl font-black text-zinc-800 mb-4">{step.num}</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition">
                <step.icon size={24} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
            </div>
            <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Use;

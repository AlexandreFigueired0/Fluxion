'use client';

import React from 'react'
import { useState, useEffect } from 'react'
import { AlertCircle, Zap } from 'lucide-react'

const TerminalDemo = () => {
  const [terminalText, setTerminalText] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  
  const fullCommand = "fluxion debug workflow.yml";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullCommand.length) {
        setTerminalText(fullCommand.slice(0, index));
        index++;
      } else {
        setTimeout(() => setShowOutput(true), 500);
        clearInterval(timer);
      }
    }, 60);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="bg-zinc-800/50 px-4 py-3 flex items-center justify-between border-b border-zinc-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">bash</span>
        <div className="w-12" />
      </div>
      
      <div className="p-6 font-mono text-sm">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-orange-500">❯</span>
          <span className="text-zinc-300">{terminalText}</span>
          <span className="w-2 h-4 bg-orange-500 animate-pulse" />
        </div>
        
        {showOutput && (
          <div className="space-y-3 animate-fadeIn mt-6">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5" />
              <div>
                <div className="text-red-400 font-semibold">Error Found</div>
                <div className="text-zinc-400 text-xs mt-1">
                  Line 23: permission denied - needs contents: write
                </div>
              </div>
            </div>

            <div className="border-l-2 border-orange-500 pl-4 py-2 bg-orange-950/20">
              <div className="text-orange-400 font-semibold mb-2">Fix:</div>
              <pre className="text-zinc-300 text-xs">
{`permissions:
  contents: write
  pull-requests: write`}
              </pre>
            </div>

            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Zap size={14} className="text-orange-500" />
              Fixed in 1.2s
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TerminalDemo;
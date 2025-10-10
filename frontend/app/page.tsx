import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { TerminalDemo } from '@/components/sections/TerminalDemo';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { CTA } from '@/components/sections/CTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(82, 82, 91) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(82, 82, 91) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10">
        <Nav />
        
        <Hero />
        
        {/* Terminal Demo Section */}
        <div className="max-w-7xl mx-auto px-8 pb-24">
          <TerminalDemo />
        </div>
        
        <ProblemSolution />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
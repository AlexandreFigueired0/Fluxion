import Nav  from './components/layout/Nav';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import ProblemSolution from './components/sections/ProblemSolution';
import Use from './components/sections/Use';
import WorkflowTransition from './components/sections/WorkflowTransition';
import CTA from './components/sections/CTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-20"
      />

      <div className="relative z-10">
        <Nav />
        
        <Hero />
        
        <ProblemSolution />
        <WorkflowTransition />
        <Use />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
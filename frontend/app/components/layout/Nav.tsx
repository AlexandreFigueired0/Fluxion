import React from 'react'

const Nav = () => {
  return (
    <nav className="px-8 py-6 flex justify-between items-center border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-black text-sm">
          FX
        </div>
        <span className="text-xl font-bold">FLUXION</span>
      </div>
      <div className="space-x-8">
        <a href="#" className="text-zinc-400 hover:text-white transition">Documentation</a>
        <a href="#" className="text-zinc-400 hover:text-white transition">Pricing</a>
        <button className="bg-orange-600 text-white px-6 py-2 rounded font-semibold hover:bg-orange-700 transition">
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Nav;

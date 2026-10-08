import React from 'react';

export const PaniniHeader: React.FC = () => {
  return (
    <header className="relative w-full bg-gradient-to-r from-[#031526] via-[#082846] to-[#04192e] text-white px-3 sm:px-6 py-2 sm:py-3 border-b-2 border-[#164470] shadow-md flex items-center justify-between overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0e487a]/40 via-transparent to-transparent pointer-events-none" />

      {/* Left: MGK 25 Aniversario Logo Replica */}
      <div className="flex items-center gap-2 sm:gap-3 z-10 shrink-0">
        <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1f33] to-[#040e18] border-2 border-slate-400/80 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-inner min-w-[70px] sm:min-w-[85px]">
          <span className="text-[7px] sm:text-[9px] font-mono tracking-tight text-slate-300 font-semibold leading-none">
            2002-03 / 2026-27
          </span>
          <div className="flex items-baseline leading-none my-0.5">
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-slate-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-['Barlow_Condensed']">
              MGK
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-gradient-to-b from-amber-300 to-yellow-500 text-black font-black text-[10px] sm:text-[12px] px-1 rounded-sm leading-tight border border-amber-200">
              25
            </span>
            <span className="text-[6px] sm:text-[7px] font-bold tracking-widest text-slate-300 uppercase">
              ANIVERSARIO
            </span>
          </div>
        </div>
      </div>

      {/* Center: CHECKLIST Title */}
      <div className="text-center z-10 flex-1 px-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-wider sm:tracking-widest uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-['Barlow_Condensed']">
          CHECKLIST
        </h1>
      </div>

      {/* Right: LaLiga EA Sports & Panini Logo */}
      <div className="flex items-center gap-2 sm:gap-4 z-10 shrink-0">
        {/* LaLiga EA Sports Badge */}
        <div className="flex flex-col items-end leading-none text-right">
          <div className="flex items-center gap-1 text-white font-extrabold tracking-tight text-xs sm:text-base font-['Barlow_Condensed']">
            <span>LALIGA</span>
            <div className="bg-white text-black px-1 rounded-sm text-[8px] sm:text-[10px] font-black uppercase tracking-tighter border border-red-600">
              EA
            </div>
          </div>
          <span className="text-[6px] sm:text-[7px] tracking-widest uppercase text-slate-300 font-bold">
            SPORTS
          </span>
        </div>

        {/* Panini Classic Logo */}
        <div className="bg-[#ffe600] text-[#e60000] font-['Barlow_Condensed'] font-black text-xs sm:text-base md:text-lg tracking-wider px-2 sm:px-3 py-0.5 rounded shadow border-2 border-black uppercase flex items-center justify-center leading-tight">
          PANINI
        </div>
      </div>
    </header>
  );
};

import React from 'react';

export const PaniniFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#051c33] text-white px-3 sm:px-6 py-2 border-t-2 border-[#164470] flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Panini Web Pill */}
      <div className="flex items-center gap-1.5 bg-[#ffe600] text-black font-extrabold px-3 py-1 rounded-full shadow border border-amber-500 text-xs sm:text-sm font-['Barlow_Condensed'] tracking-wider">
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" fill="none" />
          <polygon points="12,5 15,10 13,15 11,15 9,10" fill="black" />
          <line x1="12" y1="5" x2="12" y2="2" stroke="black" strokeWidth="1.5" />
          <line x1="15" y1="10" x2="19" y2="8" stroke="black" strokeWidth="1.5" />
          <line x1="13" y1="15" x2="16" y2="20" stroke="black" strokeWidth="1.5" />
          <line x1="11" y1="15" x2="8" y2="20" stroke="black" strokeWidth="1.5" />
          <line x1="9" y1="10" x2="5" y2="8" stroke="black" strokeWidth="1.5" />
        </svg>
        <span>www.panini.es</span>
      </div>

      {/* Social Handles */}
      <div className="flex items-center gap-3 sm:gap-5 text-slate-200 text-[11px] sm:text-xs font-semibold tracking-wide">
        {/* Facebook */}
        <div className="flex items-center gap-1">
          <span className="bg-[#1877F2] text-white font-bold w-4 h-4 rounded-sm flex items-center justify-center text-[10px] leading-none">
            f
          </span>
          <span>/paninicromos</span>
        </div>

        {/* X / Twitter */}
        <div className="flex items-center gap-1">
          <span className="bg-black text-white font-bold w-4 h-4 rounded-sm flex items-center justify-center text-[10px] leading-none">
            𝕏
          </span>
          <span>@paninicromos</span>
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-1">
          <span className="bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white font-bold w-4 h-4 rounded-sm flex items-center justify-center text-[10px] leading-none">
            📷
          </span>
          <span>@paninicromos</span>
        </div>
      </div>
    </footer>
  );
};

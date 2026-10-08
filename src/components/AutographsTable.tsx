import React from 'react';
import { CardItem } from '../types';

interface AutographsTableProps {
  cards: CardItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  searchTerm?: string;
}

export const AutographsTable: React.FC<AutographsTableProps> = ({
  cards,
  checkedIds,
  onToggle,
  searchTerm = '',
}) => {
  // Group cards into the 5 tiers exactly as in PDF
  const tier200 = cards.filter(c => c.section === 'AUTÓGRAFOS 200');
  const tier100 = cards.filter(c => c.section === 'AUTÓGRAFOS 100');
  const tier50 = cards.filter(c => c.section === 'AUTÓGRAFOS 50');
  const tier50dobles = cards.filter(c => c.section === 'AUTÓGRAFOS 50 DOBLES');
  const tier5 = cards.filter(c => c.section === 'AUTÓGRAFOS 5');

  const renderTier = (
    tierCards: CardItem[],
    label: string,
    subLabel: string,
    count: string
  ) => {
    return (
      <tbody>
        {tierCards.map((card, idx) => {
          const isChecked = Boolean(checkedIds[card.id]);
          const isHighlighted = searchTerm
            ? card.name.toLowerCase().includes(searchTerm.toLowerCase())
            : false;

          return (
            <tr
              key={card.id}
              onClick={() => onToggle(card.id)}
              className={`border-b border-[#2d4b68]/50 h-[19px] sm:h-[21px] text-[11px] sm:text-[12px] font-sans cursor-pointer transition-colors select-none ${
                isChecked
                  ? 'bg-emerald-100/90 text-emerald-950 font-medium'
                  : isHighlighted
                  ? 'bg-amber-100/90 text-amber-950 font-semibold ring-1 ring-amber-400'
                  : 'bg-white hover:bg-sky-50 odd:bg-[#f8fafc]'
              }`}
              title={isChecked ? 'Clic para desmarcar' : 'Clic para marcar autógrafo conseguido'}
            >
              {/* Vertical side label rendered on the first row of each tier */}
              {idx === 0 && (
                <td
                  rowSpan={tierCards.length}
                  className="w-10 sm:w-12 text-center border-r border-[#2d4b68]/60 bg-slate-100 font-bold text-[9px] sm:text-[10px] text-slate-700 py-1 leading-tight select-none border-b border-[#2d4b68]/60"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-slate-900 font-['Barlow_Condensed']">
                      {label}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-semibold tracking-tighter uppercase leading-none">
                      {subLabel}
                    </span>
                  </div>
                </td>
              )}

              {/* Player / Team Name */}
              <td className="px-1.5 sm:px-2 border-r border-[#2d4b68]/50 text-left">
                <div className="flex items-center justify-between gap-1">
                  <span className={`truncate ${isChecked ? 'line-through text-emerald-900' : 'text-slate-900'}`}>
                    {card.name}
                  </span>
                  <div
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 fill-current stroke-current" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </td>

              {/* Number of print copies */}
              <td className="w-10 sm:w-12 text-center font-bold text-[10px] sm:text-[11px] text-slate-700 select-none">
                {count}
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  return (
    <div className="border border-[#163a5f] rounded-t overflow-hidden shadow-sm bg-white mb-2">
      {/* Header */}
      <div className="bg-[#0b2742] text-white text-center py-1 sm:py-1.5 px-2 font-black font-['Barlow_Condensed'] text-xs sm:text-sm tracking-wider uppercase border-b border-[#163a5f]">
        LISTADO AUTÓGRAFOS MEGACRACKS 26-27
      </div>

      <table className="w-full border-collapse">
        {renderTier(tier200, '200', 'autógrafos', '200')}
        {renderTier(tier100, '100', 'autógrafos', '100')}
        {renderTier(tier50, '50', 'autógrafos', '50')}
        {renderTier(tier50dobles, '50', 'dobles', '50')}
        {renderTier(tier5, '5', 'autógrafos', '5')}
      </table>
    </div>
  );
};

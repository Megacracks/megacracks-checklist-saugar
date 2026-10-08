import React from 'react';
import { CardItem } from '../types';

interface CardRowProps {
  card: CardItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
  isHighlighted?: boolean;
}

export const CardRow: React.FC<CardRowProps> = ({
  card,
  isChecked,
  onToggle,
  isHighlighted = false,
}) => {
  const isSlotEmpty = Boolean(card.isEmpty || !card.name || card.name.trim() === '');
  const displayName = isSlotEmpty ? '' : card.name;
  const displaySubtitle = isSlotEmpty ? '' : (card.positionOrTeam || '');

  return (
    <tr
      onClick={() => onToggle(card.id)}
      className={`border-b border-[#2d4b68]/50 h-[19px] sm:h-[21px] text-[11px] sm:text-[12px] font-sans cursor-pointer transition-colors duration-100 select-none ${
        isChecked
          ? 'bg-emerald-100/90 hover:bg-emerald-200/90 text-emerald-950 font-medium'
          : isHighlighted
          ? 'bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 font-semibold ring-1 ring-amber-400'
          : isSlotEmpty
          ? 'bg-slate-50/60 hover:bg-sky-50 text-slate-700'
          : 'bg-white hover:bg-sky-50/80 text-slate-900 odd:bg-[#f8fafc]'
      }`}
      title={isChecked ? `Marcado: cromo ${card.number} (clic para desmarcar)` : `Marcar cromo ${card.number}`}
    >
      {/* Number + Checkbox Cell */}
      <td className="w-11 sm:w-14 text-center font-bold border-r border-[#2d4b68]/50 shrink-0 relative group">
        <div className="flex items-center justify-center gap-0.5 px-0.5 sm:px-1 whitespace-nowrap">
          <span className={`text-[10px] sm:text-[11px] whitespace-nowrap ${isChecked ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
            {card.number}
          </span>
          <div
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] border flex items-center justify-center ml-0.5 shrink-0 transition-transform active:scale-90 ${
              isChecked
                ? 'bg-emerald-600 border-emerald-700 text-white'
                : 'border-slate-400 bg-white group-hover:border-blue-500'
            }`}
          >
            {isChecked && (
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current stroke-current stroke-1" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            )}
          </div>
        </div>
      </td>

      {/* Name Cell - completely empty for empty slots like before */}
      <td className="px-1.5 sm:px-2 border-r border-[#2d4b68]/50 truncate max-w-[120px] sm:max-w-none">
        {displayName ? (
          <span className={isChecked ? 'text-emerald-950 font-semibold' : ''}>
            {displayName}
          </span>
        ) : null}
      </td>

      {/* Position or Team Cell */}
      <td className="w-16 sm:w-24 px-1 text-center border-l border-[#2d4b68]/20 truncate text-[10px] sm:text-[11px] text-slate-700">
        {displaySubtitle ? (
          <span className={`px-1 py-0.2 rounded ${
            displaySubtitle === 'Portero'
              ? 'text-amber-800'
              : displaySubtitle === 'Defensa'
              ? 'text-blue-800'
              : displaySubtitle === 'Medio'
              ? 'text-emerald-800'
              : displaySubtitle === 'Delantero'
              ? 'text-red-800'
              : displaySubtitle === 'BIS'
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wide'
              : 'text-slate-600 font-medium'
          }`}>
            {displaySubtitle}
          </span>
        ) : null}
      </td>
    </tr>
  );
};

import React, { useEffect } from 'react';
import { CardItem } from '../types';
import { AlertTriangle, X, Check, Undo2 } from 'lucide-react';

interface UnmarkConfirmModalProps {
  card: CardItem | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnmarkConfirmModal: React.FC<UnmarkConfirmModalProps> = ({
  card,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen || !card) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-[#0b1f33] border-2 border-amber-500/80 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-transparent px-5 py-3.5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/20 border border-amber-400 p-2 rounded-xl text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Barlow_Condensed'] uppercase tracking-wide text-white">
                Confirmar desmarcado
              </h3>
              <p className="text-[11px] text-amber-200/80">
                Checklist Panini Megacracks 26-27
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Details Box */}
        <div className="p-5 flex flex-col gap-4 text-center">
          <p className="text-slate-200 text-sm">
            ¿Estás seguro de que quieres desmarcar este cromo de tu colección?
          </p>

          <div className="bg-[#061423] border border-[#1b436b] rounded-xl p-4 flex items-center justify-between gap-3 text-left shadow-inner">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 text-black font-black text-sm sm:text-base px-2.5 py-1 rounded font-mono shadow-md min-w-[42px] text-center">
                {card.number}
              </div>
              <div className="leading-tight">
                <h4 className="font-bold text-base sm:text-lg text-white font-['Barlow_Condensed'] tracking-wide">
                  {card.name}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  {card.positionOrTeam ? card.positionOrTeam : card.section}
                  {card.positionOrTeam && card.section ? ` • ${card.section}` : ''}
                </p>
              </div>
            </div>

            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded">
              Página {card.page}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Si confirmas, volverá a figurar en tu lista de cromos que te faltan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#061423] px-5 py-3.5 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 transition flex items-center gap-1.5"
          >
            <Undo2 className="w-4 h-4" />
            <span>Cancelar y mantener</span>
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Sí, desmarcar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

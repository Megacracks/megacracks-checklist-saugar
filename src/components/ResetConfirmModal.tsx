import React, { useEffect } from 'react';
import { AlertOctagon, X, RotateCcw, Trash2 } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  totalCollected: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  totalCollected,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-[#0b1f33] border-2 border-rose-500/80 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600/30 via-rose-500/20 to-transparent px-5 py-3.5 border-b border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-500/20 border border-rose-400 p-2 rounded-xl text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Barlow_Condensed'] uppercase tracking-wide text-white">
                ¿Reiniciar toda la checklist?
              </h3>
              <p className="text-[11px] text-rose-200/80">
                Esta acción desmarcará todos tus cromos
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

        {/* Body */}
        <div className="p-5 flex flex-col gap-3 text-center">
          <p className="text-slate-200 text-sm leading-relaxed">
            Actualmente tienes <b className="text-amber-400">{totalCollected} cromos conseguidos</b> marcados en tu colección.
          </p>
          <div className="bg-rose-950/40 border border-rose-600/40 rounded-xl p-3 text-xs text-rose-200 text-left">
            ⚠️ Si confirmas, tu checklist volverá a estar a <b>0 cromos</b> tanto en tu navegador como en tu base de datos de Supabase.
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-[#061423] px-5 py-3.5 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 transition"
          >
            Cancelar y no borrar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-md transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Sí, reiniciar a 0</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CardItem } from '../types';
import { X, Copy, Check, Search } from 'lucide-react';

interface MissingCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export const MissingCardsModal: React.FC<MissingCardsModalProps> = ({
  isOpen,
  onClose,
  cards,
  checkedIds,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const missingCards = cards.filter((c) => !c.isEmpty && !checkedIds[c.id]);
  const filteredMissing = missingCards.filter(
    (c) =>
      c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.positionOrTeam && c.positionOrTeam.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyList = () => {
    const listText =
      `📋 CROMOS FALTANTES MEGACRACKS 26-27 (${missingCards.length} restantes):\n\n` +
      missingCards
        .map(
          (c) =>
            `#${c.number} - ${c.name} (${c.positionOrTeam || c.section} - Pág. ${c.page})`
        )
        .join('\n');

    navigator.clipboard.writeText(listText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#0b2742] px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div>
            <h2 className="text-lg font-black text-white font-['Barlow_Condensed'] uppercase tracking-wider flex items-center gap-2">
              Listado de Faltas ({missingCards.length} cromos pendientes)
            </h2>
            <p className="text-xs text-slate-400">
              Cromos que aún necesitas para completar tu colección
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-slate-800/60 border-b border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en faltas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            onClick={handleCopyList}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-1.5 rounded-lg text-xs transition shadow"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                ¡Copiado al portapapeles!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar listado de faltas
              </>
            )}
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMissing.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              {missingCards.length === 0 ? (
                <p className="text-sm font-semibold text-emerald-400">
                  🎉 ¡Felicidades! No te falta ningún cromo, colección completa.
                </p>
              ) : (
                <p className="text-xs">No se encontraron faltas que coincidan con la búsqueda.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredMissing.map((card) => (
                <div
                  key={`missing-${card.id}`}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-amber-400/50 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bg-amber-400/10 text-amber-400 font-mono font-bold text-xs px-2 py-1 rounded border border-amber-400/30 shrink-0">
                      #{card.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition">
                        {card.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {card.positionOrTeam || card.section} • Pág. {card.page}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggle(card.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shrink-0 transition shadow"
                    title="Marcar como conseguido"
                  >
                    Marcar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando {filteredMissing.length} de {missingCards.length} faltas
          </span>
          <button
            onClick={onClose}
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-1.5 rounded transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { X, Copy, CheckCircle, Search, Sparkles } from 'lucide-react';
import { CardItem } from '../types';

interface MissingCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: CardItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelectFilterMode: (mode: 'all' | 'missing' | 'collected') => void;
}

export const MissingCardsModal: React.FC<MissingCardsModalProps> = ({
  isOpen,
  onClose,
  allCards,
  checkedIds,
  onToggle,
  onSelectFilterMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const missingCards = useMemo(() => {
    return allCards.filter((c) => !c.isEmpty && !checkedIds[c.id]);
  }, [allCards, checkedIds]);

  const filteredMissing = useMemo(() => {
    if (!searchTerm.trim()) return missingCards;
    const term = searchTerm.toLowerCase();
    return missingCards.filter(
      (c) =>
        c.number.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        (c.positionOrTeam && c.positionOrTeam.toLowerCase().includes(term)) ||
        (c.teamOrCategory && c.teamOrCategory.toLowerCase().includes(term)) ||
        c.section.toLowerCase().includes(term)
    );
  }, [missingCards, searchTerm]);

  const handleCopyList = () => {
    const text =
      `📋 LISTA DE FALTAS - PANINI MEGACRACKS 26-27 (${missingCards.length} faltas):\n\n` +
      missingCards
        .map((c) => `• Nº ${c.number} - ${c.name} (${c.positionOrTeam || c.teamOrCategory || c.section})`)
        .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b2238] border border-[#1b4b7a] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-white overflow-hidden">
        {/* Header */}
        <div className="bg-[#071727] px-5 py-4 border-b border-[#143c63] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Barlow_Condensed'] text-lg font-bold tracking-wide flex items-center gap-2">
                <span>Listado de Cromos Faltantes</span>
                <span className="bg-rose-500/30 border border-rose-500/60 text-rose-200 text-xs px-2 py-0.5 rounded-full font-sans">
                  {missingCards.length} faltas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cromos que aún no has marcado como conseguidos en tu colección
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar inside modal: Search & Copy */}
        <div className="p-4 bg-[#081b2e] border-b border-[#143c63] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en tus faltas (jugador, nº, equipo...)"
              className="w-full bg-[#04121f] border border-[#143c63] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={handleCopyList}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-lg text-xs transition shadow"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? '¡Copiado!' : 'Copiar listado'}</span>
          </button>
        </div>

        {/* Missing Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredMissing.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-medium text-sm">
                {searchTerm ? 'No se encontraron faltas con ese criterio.' : '¡Enhorabuena! No te falta ningún cromo.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredMissing.map((card) => (
                <div
                  key={card.id}
                  className="bg-[#051424] border border-[#12365a] hover:border-cyan-500/50 rounded-lg p-2.5 flex items-center justify-between gap-2 transition group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs font-bold px-2 py-1 rounded shrink-0">
                      #{card.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">
                        {card.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {card.positionOrTeam || card.teamOrCategory || card.section} • Pág {card.page}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggle(card.id)}
                    className="shrink-0 bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded transition shadow flex items-center gap-1"
                    title="Marcar como conseguido"
                  >
                    <span>Marcar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#071727] px-5 py-3 border-t border-[#143c63] flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando {filteredMissing.length} de {missingCards.length} faltas</span>
          <button
            onClick={() => {
              onSelectFilterMode('missing');
              onClose();
            }}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            Ver en cuadrícula principal
          </button>
        </div>
      </div>
    </div>
  );
};

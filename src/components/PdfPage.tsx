import React from 'react';
import { CardItem } from '../types';
import { PaniniHeader } from './PaniniHeader';
import { PaniniFooter } from './PaniniFooter';
import { PdfColumn } from './PdfColumn';

interface PdfPageProps {
  pageNumber: 1 | 2 | 3 | 4 | 5;
  cards: CardItem[];
  checkedIds: Record<string, boolean>;
  onToggle: (id: string) => void;
  onMarkAll: (ids: string[]) => void;
  onUnmarkAll: (ids: string[]) => void;
  searchTerm?: string;
}

export const PdfPage: React.FC<PdfPageProps> = ({
  pageNumber,
  cards,
  checkedIds,
  onToggle,
  onMarkAll,
  onUnmarkAll,
  searchTerm = '',
}) => {
  const col1Cards = cards.filter((c) => c.column === 1);
  const col2Cards = cards.filter((c) => c.column === 2);
  const col3Cards = cards.filter((c) => c.column === 3);

  const collectableInPage = cards;
  const collectedInPage = collectableInPage.filter((c) => checkedIds[c.id]).length;
  const pagePercent =
    collectableInPage.length > 0
      ? Math.round((collectedInPage / collectableInPage.length) * 100)
      : 0;

  return (
    <div className="pdf-page bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden mb-8 max-w-[1240px] mx-auto print:shadow-none print:border-none print:m-0 print:p-0 print:break-after-page">
      {/* Page Header bar helper (Non-print) */}
      <div className="bg-slate-800 text-white px-4 py-1.5 flex flex-wrap items-center justify-between text-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded text-xs font-['Barlow_Condensed']">
            PÁGINA {pageNumber} DE 5
          </span>
          <span className="text-slate-300 font-medium">
            Progreso página: <b className="text-white">{collectedInPage}</b> / {collectableInPage.length} ({pagePercent}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onMarkAll(collectableInPage.map((c) => c.id))}
            className="hover:bg-slate-700 active:bg-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-400 transition"
          >
            ✓ Marcar pág. {pageNumber}
          </button>
          <span className="text-slate-500">|</span>
          <button
            onClick={() => {
              if (window.confirm(`¿Seguro que deseas desmarcar todos los cromos de la página ${pageNumber}?`)) {
                onUnmarkAll(collectableInPage.map((c) => c.id));
              }
            }}
            className="hover:bg-slate-700 active:bg-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-400 transition"
          >
            ✕ Desmarcar pág. {pageNumber}
          </button>
        </div>
      </div>

      {/* Exact Panini Header */}
      <PaniniHeader />

      {/* 3 Columns Content Area */}
      <div className="p-2 sm:p-4 bg-[#f1f5f9] grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3.5 items-start">
        <PdfColumn
          pageNumber={pageNumber}
          columnNumber={1}
          cards={col1Cards}
          checkedIds={checkedIds}
          onToggle={onToggle}
          searchTerm={searchTerm}
        />
        <PdfColumn
          pageNumber={pageNumber}
          columnNumber={2}
          cards={col2Cards}
          checkedIds={checkedIds}
          onToggle={onToggle}
          searchTerm={searchTerm}
        />
        <PdfColumn
          pageNumber={pageNumber}
          columnNumber={3}
          cards={col3Cards}
          checkedIds={checkedIds}
          onToggle={onToggle}
          searchTerm={searchTerm}
        />
      </div>

      {/* Exact Panini Footer */}
      <PaniniFooter />
    </div>
  );
};

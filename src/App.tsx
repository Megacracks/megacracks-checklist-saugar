import React, { useState, useMemo } from 'react';
import { useChecklist } from './hooks/useChecklist';
import {
  allCards,
  page1Cards,
  page2Cards,
  page3Cards,
  page4Cards,
  page5Cards,
} from './data/allCards';
import { TopToolbar } from './components/TopToolbar';
import { PdfPage } from './components/PdfPage';
import { SupabaseModal } from './components/SupabaseModal';
import { UnmarkConfirmModal } from './components/UnmarkConfirmModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { MissingCardsModal } from './components/MissingCardsModal';
import { Search, Trophy, CheckCircle, ChevronUp } from 'lucide-react';
import { CardItem } from './types';

export default function App() {
  const {
    checkedIds,
    setCardState,
    markAll,
    unmarkAll,
    resetAll,
    importChecklist,
    totalCollected,
    totalCount,
    percentage,
    // Supabase
    isSupabaseConfigured,
    isTableMissing,
    isSyncing,
    lastSyncTime,
    syncError,
    manualSync,
    manualDownloadFromCloud,
    checkSupabaseStatus,
  } = useChecklist();

  const [selectedPage, setSelectedPage] = useState<number | 'all'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'missing' | 'collected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);

  // Confirmation modal state for unchecking cards
  const [cardToUnmark, setCardToUnmark] = useState<CardItem | null>(null);
  const [isUnmarkModalOpen, setIsUnmarkModalOpen] = useState(false);

  // When clicking a card: if already marked, ask confirmation; if not marked, mark directly!
  const handleCardToggle = (id: string) => {
    const isCurrentlyChecked = Boolean(checkedIds[id]);
    if (isCurrentlyChecked) {
      const foundCard = allCards.find((c) => c.id === id);
      if (foundCard) {
        setCardToUnmark(foundCard);
        setIsUnmarkModalOpen(true);
      }
    } else {
      setCardState(id, true);
    }
  };

  const handleConfirmUnmark = () => {
    if (cardToUnmark) {
      setCardState(cardToUnmark.id, false);
      setCardToUnmark(null);
      setIsUnmarkModalOpen(false);
    }
  };

  const handleCancelUnmark = () => {
    setCardToUnmark(null);
    setIsUnmarkModalOpen(false);
  };

  const handleConfirmReset = async () => {
    await resetAll();
    setIsResetModalOpen(false);
  };

  // Search filtered results for quick listing
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const term = searchTerm.toLowerCase().trim();
    return allCards.filter(
      (c) =>
        c.number.toLowerCase() === term ||
        c.number.toLowerCase().includes(term) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        c.positionOrTeam?.toLowerCase().includes(term) ||
        c.section.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Sticky Control & Status Toolbar */}
      <TopToolbar
        totalCollected={totalCollected}
        totalCount={totalCount}
        percentage={percentage}
        selectedPage={selectedPage}
        onSelectPage={setSelectedPage}
        filterMode={filterMode}
        onSelectFilterMode={setFilterMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={() => setIsResetModalOpen(true)}
        allCards={allCards}
        checkedIds={checkedIds}
        onImport={importChecklist}
        isSupabaseConfigured={isSupabaseConfigured}
        isTableMissing={isTableMissing}
        isSyncing={isSyncing}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onManualDownload={manualDownloadFromCloud}
        onOpenMissingModal={() => setIsMissingModalOpen(true)}
      />

      {/* Missing Cards Modal */}
      <MissingCardsModal
        isOpen={isMissingModalOpen}
        onClose={() => setIsMissingModalOpen(false)}
        allCards={allCards}
        checkedIds={checkedIds}
        onToggle={handleCardToggle}
        onSelectFilterMode={setFilterMode}
      />

      {/* Banner if Supabase is linked but table is missing */}
      {isSupabaseConfigured && isTableMissing && (
        <div className="bg-amber-950/70 border-b border-amber-500/50 px-3 sm:px-6 py-2.5 print:hidden animate-in fade-in duration-200">
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <span className="bg-amber-400 text-black font-black px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0">
                SUPABASE
              </span>
              <span>
                <b>Acción requerida:</b> Tus cromos se guardan en el navegador. Para sincronizarlos en la nube, falta generar la tabla <code>megacracks_checklist</code> en tu panel de Supabase.
              </span>
            </div>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-bold px-3 py-1 rounded text-xs transition shrink-0 shadow"
            >
              Generar tabla en Supabase (SQL)
            </button>
          </div>
        </div>
      )}

      {/* Supabase Connection Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isConfigured={isSupabaseConfigured}
        isTableMissing={isTableMissing}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        syncError={syncError}
        onConfigChange={() => checkSupabaseStatus()}
        onManualSync={manualSync}
        onManualDownload={manualDownloadFromCloud}
      />

      {/* Unmark Confirmation Modal */}
      <UnmarkConfirmModal
        card={cardToUnmark}
        isOpen={isUnmarkModalOpen}
        onConfirm={handleConfirmUnmark}
        onCancel={handleCancelUnmark}
      />

      {/* Reset Entire Checklist Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        totalCollected={totalCollected}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Main Checklist Canvas */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto p-2 sm:p-4 md:p-6">
        {/* Search Results Drawer if user is searching */}
        {searchResults && (
          <div className="mb-6 bg-slate-800 border-2 border-amber-400/80 rounded-lg p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white font-['Barlow_Condensed'] text-lg uppercase tracking-wide">
                  Resultados de búsqueda ({searchResults.length} cromos encontrados para "{searchTerm}")
                </h3>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-slate-200"
              >
                Limpiar búsqueda
              </button>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No se encontraron cromos que coincidan con la búsqueda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
                {searchResults.map((card) => {
                  const isChecked = Boolean(checkedIds[card.id]);
                  return (
                    <div
                      key={`search-${card.id}`}
                      onClick={() => handleCardToggle(card.id)}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer transition select-none text-xs ${
                        isChecked
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-amber-400 shrink-0">
                          {card.number}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold truncate">{card.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {card.positionOrTeam || card.section} (Pág. {card.page})
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 ml-2 ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-slate-500 bg-slate-800'
                        }`}
                      >
                        {isChecked && <CheckCircle className="w-3.5 h-3.5 fill-current" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Completion Celebration Banner when collection is 100% */}
        {percentage === 100 && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black p-4 rounded-lg shadow-2xl flex items-center justify-center gap-3 font-bold text-center">
            <Trophy className="w-8 h-8 text-black animate-bounce" />
            <div>
              <h2 className="text-xl font-black font-['Barlow_Condensed'] uppercase tracking-wider">
                ¡ENHORABUENA! ¡HAS COMPLETADO LA COLECCIÓN MEGACRACKS 26-27!
              </h2>
              <p className="text-xs font-semibold text-black/80">
                Tienes los {totalCount} cromos oficiales marcados en tu checklist.
              </p>
            </div>
            <Trophy className="w-8 h-8 text-black animate-bounce" />
          </div>
        )}

        {/* 4 Official Pages matching the PDF exactly */}
        <div className="space-y-10">
          {(selectedPage === 'all' || selectedPage === 1) && (
            <PdfPage
              pageNumber={1}
              cards={page1Cards}
              checkedIds={checkedIds}
              onToggle={handleCardToggle}
              onMarkAll={markAll}
              onUnmarkAll={unmarkAll}
              searchTerm={searchTerm}
            />
          )}

          {(selectedPage === 'all' || selectedPage === 2) && (
            <PdfPage
              pageNumber={2}
              cards={page2Cards}
              checkedIds={checkedIds}
              onToggle={handleCardToggle}
              onMarkAll={markAll}
              onUnmarkAll={unmarkAll}
              searchTerm={searchTerm}
            />
          )}

          {(selectedPage === 'all' || selectedPage === 3) && (
            <PdfPage
              pageNumber={3}
              cards={page3Cards}
              checkedIds={checkedIds}
              onToggle={handleCardToggle}
              onMarkAll={markAll}
              onUnmarkAll={unmarkAll}
              searchTerm={searchTerm}
            />
          )}

          {(selectedPage === 'all' || selectedPage === 4) && (
            <PdfPage
              pageNumber={4}
              cards={page4Cards}
              checkedIds={checkedIds}
              onToggle={handleCardToggle}
              onMarkAll={markAll}
              onUnmarkAll={unmarkAll}
              searchTerm={searchTerm}
            />
          )}

          {(selectedPage === 'all' || selectedPage === 5) && (
            <PdfPage
              pageNumber={5}
              cards={page5Cards}
              checkedIds={checkedIds}
              onToggle={handleCardToggle}
              onMarkAll={markAll}
              onUnmarkAll={unmarkAll}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </main>

      {/* Floating Scroll to Top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 bg-amber-400 hover:bg-amber-300 text-black p-3 rounded-full shadow-2xl transition-all duration-200 z-30 print:hidden flex items-center justify-center font-bold"
        title="Subir arriba"
      >
        <ChevronUp className="w-5 h-5 stroke-[3]" />
      </button>

      {/* Subtle Bottom Credit */}
      <footer className="text-center py-4 text-xs text-slate-500 border-t border-slate-800 print:hidden">
        Checklist interactiva basada fielmente en el documento oficial de Panini Megacracks LaLiga EA Sports.
      </footer>
    </div>
  );
}

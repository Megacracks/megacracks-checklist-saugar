import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Download,
  Upload,
  Sparkles,
  Database,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CardItem } from '../types';

interface TopToolbarProps {
  totalCollected: number;
  totalCount: number;
  percentage: number;
  selectedPage: number | 'all';
  onSelectPage: (p: number | 'all') => void;
  filterMode: 'all' | 'missing' | 'collected';
  onSelectFilterMode: (m: 'all' | 'missing' | 'collected') => void;
  searchTerm: string;
  onSearchChange: (s: string) => void;
  onReset: () => void;
  allCards: CardItem[];
  checkedIds: Record<string, boolean>;
  onImport: (json: string) => boolean;
  // Supabase props
  isSupabaseConfigured: boolean;
  isTableMissing: boolean;
  isSyncing: boolean;
  onOpenSupabaseModal: () => void;
  onManualDownload: () => Promise<boolean>;
  onOpenMissingModal?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  totalCollected,
  totalCount,
  percentage,
  selectedPage,
  onSelectPage,
  filterMode,
  onSelectFilterMode,
  searchTerm,
  onSearchChange,
  onReset,
  allCards,
  checkedIds,
  onImport,
  isSupabaseConfigured,
  isTableMissing,
  isSyncing,
  onOpenSupabaseModal,
  onManualDownload,
  onOpenMissingModal,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadSuccess, setReloadSuccess] = useState(false);

  const handleCopyMissing = () => {
    const missing = allCards
      .filter((c) => !c.isEmpty && !checkedIds[c.id])
      .map((c) => `${c.number} ${c.name} (${c.positionOrTeam || c.section})`);

    const text = `📋 MIS FALTAS MEGACRACKS 26-27 (${missing.length} restantes):\n\n` +
      missing.join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    });
  };

  const handleReloadFromCloud = async () => {
    setIsReloading(true);
    const success = await onManualDownload();
    setIsReloading(false);
    if (success) {
      setReloadSuccess(true);
      setTimeout(() => setReloadSuccess(false), 2200);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(checkedIds, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `megacracks-26-27-checklist-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImport(content);
        if (success) {
          setReloadSuccess(true);
          setTimeout(() => setReloadSuccess(false), 2000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="sticky top-0 z-40 bg-[#071d33] text-white shadow-xl border-b border-[#143c63] print:hidden">
      {/* Top Banner with Stats, Progress & Supabase */}
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Title and Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-black font-black text-sm sm:text-base px-2 py-0.5 rounded font-['Barlow_Condensed'] tracking-wider shadow">
              MGK 26-27
            </span>
            <div className="leading-tight">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5 font-['Barlow_Condensed'] uppercase">
                Checklist Panini Megacracks 26-27
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[10px] text-slate-400">
                Toca cualquier cromo para marcarlo como conseguido
              </p>
            </div>
          </div>

          {/* Quick Counter (Mobile) */}
          <div className="text-right md:hidden flex items-center gap-2">
            <button
              onClick={handleReloadFromCloud}
              disabled={isReloading || isSyncing}
              className="p-1.5 rounded border border-emerald-500 bg-emerald-950/80 text-emerald-300 text-xs"
              title="Sincronizar con Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReloading || isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenSupabaseModal}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="Configuración de Supabase"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
            <div>
              <span className="text-xs font-bold text-emerald-400">
                {totalCollected}/{totalCount}
              </span>
              <span className="text-[10px] text-slate-400 block">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full md:w-64 lg:w-80 flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Progreso total:</span>
            <span className="font-bold text-amber-400 font-mono">
              {totalCollected} / {totalCount} ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-[#030e1a] rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-400 via-emerald-400 to-green-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Buttons & Supabase Status Button */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
          {/* Dedicated Reload / Sync Cloud Button (Fetches from Vercel/Supabase) */}
          <button
            onClick={handleReloadFromCloud}
            disabled={isReloading || isSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition shadow-sm ${
              reloadSuccess
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-600/80 text-emerald-200'
            }`}
            title="Recargar y sincronizar con los cambios de Vercel / Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading || isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {reloadSuccess ? '¡Sincronizado!' : isReloading ? 'Cargando...' : 'Sincronizar'}
            </span>
          </button>

          {/* Supabase Link Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition shadow-sm ${
              isSupabaseConfigured
                ? isTableMissing
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 hover:bg-amber-900/80'
                  : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200 hover:bg-emerald-900/80'
                : 'bg-[#0f2d4a] hover:bg-[#163f68] border-cyan-500/50 text-cyan-200'
            }`}
            title={
              isTableMissing
                ? 'Supabase conectado pero falta la tabla. Pulsa para ver el script SQL.'
                : 'Vincular con Supabase / Configurar claves'
            }
          >
            <Database className={`w-3.5 h-3.5 ${isTableMissing ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">
              {isSupabaseConfigured
                ? isTableMissing
                  ? 'Crear tabla Supabase'
                  : 'Supabase'
                : 'Vincular Supabase'}
            </span>
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 text-emerald-300 animate-spin" />
            ) : isSupabaseConfigured ? (
              isTableMissing ? (
                <span className="text-[10px] bg-amber-400 text-black px-1 font-bold rounded">
                  SQL
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )
            ) : (
              <span className="text-[10px] bg-cyan-500/20 px-1 py-0.2 rounded border border-cyan-400/40">
                Claves
              </span>
            )}
          </button>

          <button
            onClick={handleCopyMissing}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-xs px-2.5 py-1.5 rounded transition font-medium"
            title="Copiar lista de faltas al portapapeles"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{copiedMessage ? '¡Copiado!' : 'Copiar faltas'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 text-xs px-2.5 py-1.5 rounded transition font-medium"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Imprimir</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs px-2 py-1.5 rounded transition"
            title="Descargar copia de seguridad"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
          </button>

          <label
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs px-2 py-1.5 rounded cursor-pointer transition"
            title="Cargar copia de seguridad"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset All Button with Trash icon */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-xs px-2 py-1.5 rounded text-rose-200 transition"
            title="Reiniciar checklist (Borrar todos los cromos marcados)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden lg:inline text-[11px]">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Filter and Page Selectors row */}
      <div className="bg-[#041424] border-t border-[#13375c] px-3 sm:px-6 py-2">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Page Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-md border border-slate-800 overflow-x-auto max-w-full">
            <button
              onClick={() => onSelectPage('all')}
              className={`px-3 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 'all'
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Todas (1-5)
            </button>
            <button
              onClick={() => onSelectPage(1)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 1
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Página 1
            </button>
            <button
              onClick={() => onSelectPage(2)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 2
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Página 2
            </button>
            <button
              onClick={() => onSelectPage(3)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 3
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Página 3
            </button>
            <button
              onClick={() => onSelectPage(4)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 4
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Página 4
            </button>
            <button
              onClick={() => onSelectPage(5)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition whitespace-nowrap ${
                selectedPage === 5
                  ? 'bg-amber-400 text-black shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Página 5
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar jugador, nº, equipo..."
              className="w-full bg-slate-900 border border-slate-700 rounded-md pl-8 pr-7 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Status (All / Faltan / Conseguidos) */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-md border border-slate-800">
            <button
              onClick={() => onSelectFilterMode('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => {
                onSelectFilterMode('missing');
                onOpenMissingModal?.();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                filterMode === 'missing'
                  ? 'bg-rose-900/80 text-rose-200 font-bold'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>Faltas ({totalCount - totalCollected})</span>
            </button>
            <button
              onClick={() => onSelectFilterMode('collected')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                filterMode === 'collected'
                  ? 'bg-emerald-900/80 text-emerald-200 font-bold'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Tengo ({totalCollected})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

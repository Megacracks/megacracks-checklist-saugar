import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  UploadCloud,
  DownloadCloud,
  Download,
  Code2,
} from 'lucide-react';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  getUserIdentifier,
  setUserIdentifier,
  SUPABASE_SQL_SCRIPT,
  getProjectRef,
  createTableViaSupabaseManagementApi,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConfigured: boolean;
  isTableMissing: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  onConfigChange: () => void;
  onManualSync: () => Promise<void>;
  onManualDownload: () => Promise<boolean>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  isConfigured,
  isTableMissing,
  isSyncing,
  lastSyncTime,
  syncError,
  onConfigChange,
  onManualSync,
  onManualDownload,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [userId, setUserId] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; tableMissing?: boolean; message: string } | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [creatingViaApi, setCreatingViaApi] = useState(false);
  const [apiResult, setApiResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCreateAutoViaApi = async () => {
    const projectRef = getProjectRef(url);
    if (!projectRef) {
      setApiResult({
        success: false,
        message: 'No se pudo identificar la referencia del proyecto desde la URL. Verifica que sea https://tu-proyecto.supabase.co',
      });
      return;
    }
    if (!accessToken.trim()) {
      setApiResult({
        success: false,
        message: 'Introduce tu Supabase Personal Access Token (creado en supabase.com/dashboard/account/tokens).',
      });
      return;
    }

    setCreatingViaApi(true);
    setApiResult(null);
    const res = await createTableViaSupabaseManagementApi(projectRef, accessToken);
    setCreatingViaApi(false);
    setApiResult(res);

    if (res.success) {
      // Re-test connection immediately
      setTimeout(async () => {
        const testRes = await testSupabaseConnection(url, anonKey);
        setTestResult(testRes);
        if (testRes.success && !testRes.tableMissing) {
          onManualSync();
        }
      }, 1000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const config = getSavedSupabaseConfig();
      setUrl(config.url || '');
      setAnonKey(config.anonKey || '');
      setUserId(getUserIdentifier());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Por favor, introduce la URL del proyecto y la clave Anon Key de Supabase.');
      return;
    }

    saveSupabaseConfig(url.trim(), anonKey.trim());
    if (userId.trim()) {
      setUserIdentifier(userId.trim());
    }
    onConfigChange();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Auto-test on save
    setTesting(true);
    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(result);
    if (result.success && !result.tableMissing) {
      onManualSync();
    }
  };

  const handleTest = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Introduce la URL y la clave Anon Key para probar.',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(res);
    if (res.success && !res.tableMissing) {
      onManualSync();
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Seguro que deseas desvincular las claves de Supabase? La checklist seguirá funcionando con almacenamiento local.')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      onConfigChange();
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  const downloadSqlFile = () => {
    const element = document.createElement('a');
    const file = new Blob([SUPABASE_SQL_SCRIPT], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyUserIdToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b1f33] border border-[#1e4873] text-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#071726] to-[#0d2a48] border-b border-[#1c436b] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500/20 border border-emerald-500/40 p-2 rounded-lg text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-['Barlow_Condensed'] uppercase tracking-wide flex items-center gap-2">
                Vincular con Supabase
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {isConfigured ? (isTableMissing ? 'Falta tabla' : 'Conectado') : 'Sin vincular'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Sincroniza y guarda tu colección Checklist Panini Megacracks 26-27 en tu propia base de datos Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Action Required Banner: Table Missing */}
          {isConfigured && isTableMissing && (
            <div className="p-3.5 rounded-lg border bg-amber-950/60 border-amber-500/60 text-amber-100 flex flex-col gap-2 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    Acción necesaria: Falta crear la tabla en Supabase
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tus credenciales de Supabase son válidas, pero la tabla <code>megacracks_checklist</code> aún no existe en tu base de datos.
                    Copia el script SQL de abajo y ejecútalo en el <b>SQL Editor</b> de tu panel de Supabase.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-500/30">
                <button
                  onClick={copySqlToClipboard}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-3 py-1 rounded text-xs flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? '¡Script SQL Copiado!' : 'Copiar Script SQL'}</span>
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1 rounded text-xs flex items-center gap-1.5 transition border border-slate-700"
                >
                  <span>Abrir Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          )}

          {/* Status Indicator Banner */}
          <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
            isConfigured && !isTableMissing
              ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
              : 'bg-slate-900/60 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              {isConfigured && !isTableMissing ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {isConfigured && !isTableMissing
                    ? 'Checklist vinculada y sincronizando en Supabase'
                    : 'Modo local: Los cromos se guardan de forma segura en tu navegador'}
                </p>
                {lastSyncTime && (
                  <p className="text-[11px] text-emerald-300/80">
                    Última sincronización: {lastSyncTime.toLocaleTimeString()} ({lastSyncTime.toLocaleDateString()})
                  </p>
                )}
                {syncError && !isTableMissing && (
                  <p className="text-[11px] text-rose-300 font-semibold mt-0.5">
                    Aviso: {syncError}
                  </p>
                )}
              </div>
            </div>

            {isConfigured && !isTableMissing && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-2.5 py-1 rounded text-xs flex items-center gap-1 shadow"
                  title="Subir checklist a Supabase ahora"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Subiendo...' : 'Sincronizar'}</span>
                </button>
                <button
                  onClick={onManualDownload}
                  disabled={isSyncing}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 px-2.5 py-1 rounded text-xs flex items-center gap-1 shadow"
                  title="Descargar desde Supabase"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Fields for Project URL and Anon Key */}
          <div className="space-y-3 bg-[#071625] p-4 rounded-lg border border-[#16385a]">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Supabase Project URL (URL del proyecto)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full bg-[#030d17] border border-slate-700 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Disponible en: <i>Project Settings &gt; API &gt; Project URL</i> en Supabase.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Supabase Anon Public Key (Clave anónima pública)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJh..."
                className="w-full bg-[#030d17] border border-slate-700 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Disponible en: <i>Project Settings &gt; API &gt; Project API keys &gt; anon public</i>.
              </p>
            </div>

            {/* User ID Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Identificador de Usuario / Colección (opcional para compartir o sincronizar dispositivos)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="mi_usuario_megacracks"
                  className="w-full bg-[#030d17] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
                <button
                  type="button"
                  onClick={copyUserIdToClipboard}
                  className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-xs font-medium border border-slate-700 flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div className={`p-2.5 rounded text-xs flex items-start gap-2 ${
                testResult.success
                  ? testResult.tableMissing
                    ? 'bg-amber-950/80 border border-amber-600 text-amber-200'
                    : 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-600 text-rose-200'
              }`}>
                {testResult.success ? (
                  testResult.tableMissing ? (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Comprobando...' : 'Probar conexión'}</span>
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-2 py-1.5 rounded text-xs flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Desvincular</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded text-xs shadow-md transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveSuccess ? '¡Guardado con éxito!' : 'Guardar y Vincular Claves'}</span>
              </button>
            </div>
          </div>

          {/* Quick SQL Table Setup Helper */}
          <div className="bg-[#05111d] border border-[#14324f] rounded-lg p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-400" />
                ⚡ Generar tabla "megacracks_checklist" en Supabase
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={downloadSqlFile}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Descargar archivo schema.sql"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>Descargar .sql</span>
                </button>
                <button
                  onClick={copySqlToClipboard}
                  className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? '¡SQL Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>
            </div>

            {/* Option A: SQL Editor in Supabase */}
            <div className="bg-black/30 p-2.5 rounded border border-slate-800">
              <p className="text-[11px] text-slate-300 mb-2 leading-relaxed font-medium">
                <b>Método recomendado (1 minuto):</b> Copia el código SQL y ejecútalo en el SQL Editor de tu panel de Supabase:
              </p>
              <pre className="bg-black/60 p-2.5 rounded font-mono text-[10px] text-emerald-300 border border-slate-800 overflow-x-auto leading-relaxed select-all max-h-36">
                {SUPABASE_SQL_SCRIPT}
              </pre>
              <div className="mt-2 flex items-center justify-between">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1 underline"
                >
                  <span>Abrir Supabase Dashboard &gt; SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Option B: Automatic generation with Access Token */}
            <div className="bg-[#081827] p-2.5 rounded border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-200 block">
                O generar automáticamente desde aquí con tu Supabase Access Token:
              </span>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="sbp_... (Supabase Personal Access Token)"
                  className="w-full bg-[#030d17] border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleCreateAutoViaApi}
                  disabled={creatingViaApi || !accessToken.trim()}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold px-3 py-1 rounded text-xs shrink-0 transition flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${creatingViaApi ? 'animate-spin' : ''}`} />
                  <span>{creatingViaApi ? 'Generando...' : 'Crear tabla'}</span>
                </button>
              </div>
              {apiResult && (
                <p className={`text-[11px] font-medium ${apiResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {apiResult.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#071625] border-t border-[#1a3f65] flex items-center justify-between text-xs text-slate-400">
          <span>También puedes configurar <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en <code>.env</code></span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-1.5 rounded transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

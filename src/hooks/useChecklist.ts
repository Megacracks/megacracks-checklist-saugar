import { useState, useEffect, useCallback, useRef } from 'react';
import { collectableCards } from '../data/allCards';
import {
  getSupabaseClient,
  getSavedSupabaseConfig,
  getUserIdentifier,
  fetchFromSupabase,
  pushToSupabase,
  subscribeToSupabaseChanges,
} from '../lib/supabase';

const STORAGE_KEY = 'megacracks_25_checklist_v1';

export function useChecklist() {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load checklist from localStorage', e);
    }
    return {};
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [isTableMissing, setIsTableMissing] = useState(false);

  const initialLoadDoneRef = useRef(false);

  // Check if Supabase client is configured
  const checkSupabaseStatus = useCallback(() => {
    const config = getSavedSupabaseConfig();
    const hasConfig = Boolean(
      config.url &&
      config.anonKey &&
      !config.url.includes('YOUR_PROJECT_ID') &&
      !config.anonKey.includes('YOUR_SUPABASE_ANON_KEY')
    );
    setIsSupabaseConfigured(hasConfig);
    return hasConfig;
  }, []);

  // Sync to Supabase function
  const syncToCloud = useCallback(async (data: Record<string, boolean>) => {
    const client = getSupabaseClient();
    if (!client) return;

    setIsSyncing(true);
    try {
      const userId = getUserIdentifier();
      const res = await pushToSupabase(userId, data);
      if (res.success) {
        setIsTableMissing(false);
        setSyncError(null);
        setLastSyncTime(new Date());
      } else if (res.tableMissing) {
        setIsTableMissing(true);
        setSyncError(res.error || 'Falta crear la tabla "megacracks_checklist" en Supabase.');
      } else if (res.error) {
        setSyncError(res.error);
      }
    } catch {
      // Non-fatal, local checklist remains fully functional
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Fetch initial data from Supabase on mount if available
  useEffect(() => {
    const configured = checkSupabaseStatus();
    if (configured && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      const userId = getUserIdentifier();
      setIsSyncing(true);
      fetchFromSupabase(userId).then((res) => {
        setIsSyncing(false);
        if (res.tableMissing) {
          setIsTableMissing(true);
          setSyncError('Falta crear la tabla "megacracks_checklist" en tu panel de Supabase.');
        } else {
          setIsTableMissing(false);
          setSyncError(null);
          if (res.data && Object.keys(res.data).length > 0) {
            // Merge local and cloud
            setCheckedIds((prev) => {
              const merged = { ...prev, ...res.data };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
            setLastSyncTime(new Date());
          }
        }
      });
    }
  }, [checkSupabaseStatus]);

  // Real-time synchronization and window focus listener (syncs between Vercel & AI Studio)
  useEffect(() => {
    if (!checkSupabaseStatus() || isTableMissing) return;

    const userId = getUserIdentifier();

    // 1. Listen for real-time changes via Supabase Channel
    const unsubscribe = subscribeToSupabaseChanges(userId, (remoteChecked) => {
      setCheckedIds(remoteChecked);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteChecked));
      setLastSyncTime(new Date());
    });

    // 2. Refresh when user switches back to this tab/window
    const handleRefresh = () => {
      if (document.visibilityState === 'visible') {
        fetchFromSupabase(userId).then((res) => {
          if (res.data && Object.keys(res.data).length > 0) {
            setCheckedIds((prev) => {
              const merged = { ...prev, ...res.data };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
            setLastSyncTime(new Date());
          }
        });
      }
    };

    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [checkSupabaseStatus, isTableMissing]);

  const toggleCard = useCallback((id: string) => {
    setCheckedIds(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      syncToCloud(next);
      return next;
    });
  }, [syncToCloud]);

  const setCardState = useCallback((id: string, state: boolean) => {
    setCheckedIds(prev => {
      const next = { ...prev };
      if (state) {
        next[id] = true;
      } else {
        delete next[id];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      // Envía a Supabase inmediatamente tanto al marcar como al desmarcar/eliminar
      syncToCloud(next);
      return next;
    });
  }, [syncToCloud]);

  const markAll = useCallback((ids: string[]) => {
    setCheckedIds(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        next[id] = true;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      syncToCloud(next);
      return next;
    });
  }, [syncToCloud]);

  const unmarkAll = useCallback((ids: string[]) => {
    setCheckedIds(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        delete next[id];
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      // Envía a Supabase inmediatamente al desmarcar
      syncToCloud(next);
      return next;
    });
  }, [syncToCloud]);

  const resetAll = useCallback(async () => {
    setCheckedIds({});
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
    } catch (e) {
      console.error(e);
    }
    // Envía a Supabase inmediatamente el reinicio completo
    await syncToCloud({});
  }, [syncToCloud]);

  const importChecklist = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed === 'object' && parsed !== null) {
        setCheckedIds(parsed);
        return true;
      }
    } catch (err) {
      console.error('Invalid JSON', err);
    }
    return false;
  }, []);

  const manualSync = useCallback(async () => {
    await syncToCloud(checkedIds);
  }, [checkedIds, syncToCloud]);

  const manualDownloadFromCloud = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const userId = getUserIdentifier();
      const res = await fetchFromSupabase(userId);
      if (res.tableMissing) {
        setIsTableMissing(true);
        setSyncError('Falta crear la tabla "megacracks_checklist" en tu panel de Supabase.');
        return false;
      }
      setIsTableMissing(false);
      setSyncError(null);
      if (res.data) {
        setCheckedIds(res.data);
        setLastSyncTime(new Date());
        return true;
      }
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setIsSyncing(false);
    }
    return false;
  }, []);

  const totalCollected = collectableCards.filter(c => checkedIds[c.id]).length;
  const totalCount = collectableCards.length;
  const percentage = totalCount > 0 ? Math.round((totalCollected / totalCount) * 100) : 0;

  return {
    checkedIds,
    toggleCard,
    setCardState,
    markAll,
    unmarkAll,
    resetAll,
    importChecklist,
    totalCollected,
    totalCount,
    percentage,
    // Supabase state & actions
    isSupabaseConfigured,
    isTableMissing,
    isSyncing,
    lastSyncTime,
    syncError,
    manualSync,
    manualDownloadFromCloud,
    checkSupabaseStatus,
    setIsTableMissing,
  };
}

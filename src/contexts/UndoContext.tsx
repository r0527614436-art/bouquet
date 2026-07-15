import React, { createContext, useCallback, useContext, useState } from 'react';

export interface UndoEntry {
  id: string;
  label: string;
  run: () => Promise<void>;
}

interface UndoContextValue {
  stack: UndoEntry[];
  pushUndo: (entry: Omit<UndoEntry, 'id'>) => void;
  undoLast: () => Promise<void>;
  isUndoing: boolean;
}

const UndoContext = createContext<UndoContextValue | null>(null);

const MAX_STACK = 10;

export const UndoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<UndoEntry[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);

  const pushUndo = useCallback((entry: Omit<UndoEntry, 'id'>) => {
    setStack((prev) => {
      const next = [...prev, { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` }];
      // keep only the latest MAX_STACK
      return next.length > MAX_STACK ? next.slice(next.length - MAX_STACK) : next;
    });
  }, []);

  const undoLast = useCallback(async () => {
    let entry: UndoEntry | undefined;
    setStack((prev) => {
      if (prev.length === 0) return prev;
      entry = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    // wait a tick so state has committed then run the undo
    await Promise.resolve();
    if (!entry) return;
    try {
      setIsUndoing(true);
      await entry.run();
    } catch (e) {
      // if undo fails, restore the entry back on top so user can retry / see it
      const failed = entry;
      setStack((prev) => [...prev, failed]);
      throw e;
    } finally {
      setIsUndoing(false);
    }
  }, []);

  return (
    <UndoContext.Provider value={{ stack, pushUndo, undoLast, isUndoing }}>
      {children}
    </UndoContext.Provider>
  );
};

export const useUndo = () => {
  const ctx = useContext(UndoContext);
  if (!ctx) {
    // Safe no-op fallback so components mounted outside the provider don't crash.
    return {
      stack: [] as UndoEntry[],
      pushUndo: (_: Omit<UndoEntry, 'id'>) => {},
      undoLast: async () => {},
      isUndoing: false,
    } as UndoContextValue;
  }
  return ctx;
};
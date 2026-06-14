// src/store/useDatasetStore.ts
import { create } from 'zustand';

export interface ColumnMetadata {
  name: string;
  type: 'numeric' | 'categorical';
  missingCount: number;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

interface DatasetState {
  fullData: Record<string, any>[];
  columnMetadata: ColumnMetadata[];
  activityLog: ActivityLogEntry[];
  activeView: string;
  isLoading: boolean;
  setDataset: (data: Record<string, any>[]) => void;
  logActivity: (action: string, details: string) => void;
  setActiveView: (view: string) => void;
  clearDataset: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  fullData: [],
  columnMetadata: [],
  activityLog: [
    {
      id: 'init',
      timestamp: new Date().toLocaleTimeString(),
      action: 'System Initialized',
      details: 'StatToolkit State Engine is live and ready.',
    },
  ],
  activeView: 'dashboard',
  isLoading: false,

  setDataset: (data) => {
    if (data.length === 0) {
      set({ fullData: [], columnMetadata: [] });
      return;
    }

    // Infer metadata by scanning columns
    const columns = Object.keys(data[0]);
    const metadata: ColumnMetadata[] = columns.map((col) => {
      let missingCount = 0;
      let numericCount = 0;
      let validCount = 0;

      data.forEach((row) => {
        const val = row[col];
        if (val === undefined || val === null || val === '') {
          missingCount++;
        } else {
          validCount++;
          if (!isNaN(Number(val))) {
            numericCount++;
          }
        }
      });

      // If more than 70% of valid values are numeric, classify as numeric
      const type = numericCount / validCount > 0.7 ? 'numeric' : 'categorical';

      return {
        name: col,
        type,
        missingCount,
      };
    });

    set((state) => ({
      fullData: data,
      columnMetadata: metadata,
      activityLog: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          action: 'Dataset Imported',
          details: `Successfully loaded ${data.length} rows across ${columns.length} features.`,
        },
        ...state.activityLog,
      ],
    }));
  },

  logActivity: (action, details) =>
    set((state) => ({
      activityLog: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          action,
          details,
        },
        ...state.activityLog,
      ],
    })),

  setActiveView: (view) => set({ activeView: view }),

  clearDataset: () =>
    set((state) => ({
      fullData: [],
      columnMetadata: [],
      activityLog: [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          action: 'Dataset Cleared',
          details: 'Active workspace dataset flushed from client memory.',
        },
        ...state.activityLog,
      ],
    })),
}));
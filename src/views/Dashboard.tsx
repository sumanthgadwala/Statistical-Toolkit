// src/views/Dashboard.tsx
import React from 'react';
import { useDatasetStore } from '../store/useDatasetStore';
import { BarChart3, Layers, Terminal as CliIcon, Hourglass } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { fullData, columnMetadata, activityLog, setActiveView } = useDatasetStore();

  return (
    <div className="space-y-10">
      {/* Hero Header Area */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-gradient-to-tr from-violet-600 to-indigo-600 opacity-10 blur-3xl rounded-full" />
        <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
          Welcome to StatToolkit Workspace
        </h2>
        <p className="text-slate-400 max-w-xl text-base leading-relaxed">
          An elite, client-side analytical workspace engineered for zero-latency numeric modeling, distribution processing, and descriptive visualization.
        </p>
      </div>

      {/* Primary Analytics Track Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memory Allocation</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{fullData.length.toLocaleString()} Rows</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discovered Fields</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{columnMetadata.length} Attributes</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <CliIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Run-Log</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">{activityLog.length} Executions</div>
          </div>
        </div>
      </div>

      {/* Real-time Audit Activity Timeline Trace Logging */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-6">
          <Hourglass className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-slate-200">System Trace Logs</h3>
        </div>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {activityLog.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-sm transition-colors hover:border-slate-800/80">
              <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 border border-slate-800/60 rounded-md mt-0.5">{log.timestamp}</span>
              <div>
                <h4 className="font-semibold text-slate-300">{log.action}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
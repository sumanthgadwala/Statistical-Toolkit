// src/components/layout/Sidebar.tsx
import React from 'react';
import { useDatasetStore } from '../../store/useDatasetStore';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Binary, 
  LineChart, 
  Cpu, 
  Terminal, 
  Database 
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'ingestion', name: 'Data Ingestion', icon: UploadCloud },
  { id: 'stats', name: 'Statistics Engine', icon: Binary },
  { id: 'analytics', name: 'ML & Visualizations', icon: LineChart },
  { id: 'simulators', name: 'Math Simulators', icon: Cpu },
  { id: 'reporting', name: 'CLI & AI Reports', icon: Terminal },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, fullData } = useDatasetStore();

  return (
    <aside className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between p-6 text-slate-200 min-h-screen">
      <div>
        {/* App Branding */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              StatToolkit
            </h1>
            <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Enterprise Analytics</span>
          </div>
        </div>

        {/* Navigation Context Links */}
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group text-left"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-l-2 border-violet-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className={isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-200'}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dataset Status Banner */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Workspace RAM</span>
          <span className="text-sm font-medium text-slate-300">
            {fullData.length > 0 ? `${fullData.length.toLocaleString()} rows` : 'Empty Buffer'}
          </span>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full pulse ${fullData.length > 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-500'}`} />
      </div>
    </aside>
  );
};
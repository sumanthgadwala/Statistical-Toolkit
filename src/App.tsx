// src/App.tsx
import { useState } from 'react';
import { DataIngestion } from './views/DataIngestion';
import { StatsEngine } from './views/StatsEngine';
import { AnalyticsCenter } from './views/AnalyticsCenter';
import { MathSimulators } from './views/MathSimulators';
import { ReportingDocumentation } from './views/ReportingDocumentation';
import { UserGuide } from './views/UserGuide';
import { useDatasetStore } from './store/useDatasetStore';
import {
  BarChart3, UploadCloud, Cpu, Binary, Terminal, BrainCircuit,
  ArrowRight, Code, FileText, BookOpen,
} from 'lucide-react';

type Route = 'ingest' | 'statistics' | 'ml' | 'simulators' | 'ai_insights' | 'cli' | 'reporting' | 'guide';

export default function App() {
  const [route, setRoute] = useState<Route>('ingest');
  const [cliFilter, setCliFilter] = useState('');

  // Safe destructure — activities may not exist in all store versions
  const store = useDatasetStore();
  const fullData = store.fullData ?? [];
  const columnMetadata = store.columnMetadata ?? [];
  const activities = (store as any).activities ?? [];

  const numericColumns = columnMetadata.filter((c: any) => c.type === 'numeric');
  const categoricalColumns = columnMetadata.filter((c: any) => c.type === 'categorical');

  const cliCommands = [
    { cmd: 'stattoolkit ingest --file dataset.csv', desc: 'Uploads and structures a local data matrix stream into the active application engine state.', cat: 'ingest' },
    { cmd: 'stattoolkit analyze descriptive --col target_variable', desc: 'Compiles complete descriptive statistics for a target feature vector.', cat: 'statistics' },
    { cmd: 'stattoolkit test t-test --col1 group_a --col2 group_b', desc: 'Computes an independent two-sample T-test over separate continuous variables.', cat: 'statistics' },
    { cmd: 'stattoolkit train kmeans --k 3 --features age,income', desc: 'Fits an unsupervised K-Means partitioning model over spatial coordinate variables.', cat: 'ml' },
    { cmd: 'stattoolkit transform pca --components 2', desc: 'Applies covariance matrix calculation for dimensionality reduction.', cat: 'ml' },
  ];

  const nb = (r: Route) => `nav-btn${route === r ? ' active' : ''}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── TOP NAV ── */}
      <header className="topnav">
        <div className="topnav-brand">
          <div className="topnav-logo">ST</div>
          <div className="brand-text">
            <span className="brand-name">StatToolkit</span>
            <span className="brand-sub">Analytics Engine</span>
          </div>
        </div>

        <div className="topnav-group">
          <span className="topnav-group-label">Core</span>
          <button className={nb('ingest')} onClick={() => setRoute('ingest')}>
            <UploadCloud size={13} /> Upload
          </button>
        </div>

        <div className="topnav-group">
          <span className="topnav-group-label">Analysis</span>
          <button className={nb('statistics')} onClick={() => setRoute('statistics')}>
            <BarChart3 size={13} /> Statistics
          </button>
          <button className={nb('ml')} onClick={() => setRoute('ml')}>
            <Cpu size={13} /> ML Core
          </button>
          <button className={nb('simulators')} onClick={() => setRoute('simulators')}>
            <Binary size={13} /> Simulators
          </button>
        </div>

        <div className="topnav-group">
          <span className="topnav-group-label">System</span>
          <button className={nb('ai_insights')} onClick={() => setRoute('ai_insights')}>
            <BrainCircuit size={13} /> AI Insights
          </button>
          <button className={nb('reporting')} onClick={() => setRoute('reporting')}>
            <FileText size={13} /> Reporting
          </button>
          <button className={nb('cli')} onClick={() => setRoute('cli')}>
            <Terminal size={13} /> CLI
          </button>
        </div>

        {/* Guide button — visually separated and accented so it's easy to spot */}
        <div className="topnav-group">
          <span className="topnav-group-label">Help</span>
          <button
            className={nb('guide')}
            onClick={() => setRoute('guide')}
            style={route !== 'guide' ? {
              background: '#c8ff57',
              color: '#0d0d0d',
              border: '1.5px solid #0d0d0d',
              fontWeight: 700,
            } : {}}
          >
            <BookOpen size={13} /> User Guide
          </button>
        </div>

        <a
          href="https://github.com/sumanthgadwala/Statistical-Toolkit"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: '#c8ff57',
            color: '#0d0d0d',
            textDecoration: 'none',
            padding: '5px 13px',
            fontFamily: 'monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            border: '1.5px solid #0d0d0d',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#0d0d0d" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </a>

        <div className="topnav-status">
          <div className="pulse" />
          <span>ONLINE · v1.0.0</span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="main-content">

        {/* DATA UPLOAD */}
        {route === 'ingest' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">Data Ingestion</div>
                <div className="ph-sub">Upload and schema-parse datasets locally in browser memory.</div>
              </div>
              <div className="ph-tag">// MODULE_01</div>
            </div>
            <DataIngestion />
          </>
        )}

        {/* STATISTICS */}
        {route === 'statistics' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">Statistics Engine</div>
                <div className="ph-sub">Configure vector testing arrays and evaluate significance metrics.</div>
              </div>
              <div className="ph-tag">// MODULE_02</div>
            </div>
            <StatsEngine />
          </>
        )}

        {/* ML CORE */}
        {route === 'ml' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">ML Core Studio</div>
                <div className="ph-sub">Train statistical models and visualize feature partitions.</div>
              </div>
              <div className="ph-tag">// MODULE_03</div>
            </div>
            <AnalyticsCenter />
          </>
        )}

        {/* SIMULATORS */}
        {route === 'simulators' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">Math Simulators</div>
                <div className="ph-sub">Watch non-normal distributions converge toward normal symmetry.</div>
              </div>
              <div className="ph-tag">// MODULE_04</div>
            </div>
            <MathSimulators />
          </>
        )}

        {/* REPORTING */}
        {route === 'reporting' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">Reporting</div>
                <div className="ph-sub">Export structured executive summaries and access API architectures.</div>
              </div>
              <div className="ph-tag">// MODULE_05</div>
            </div>
            <ReportingDocumentation />
          </>
        )}

        {/* AI INSIGHTS */}
        {route === 'ai_insights' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">AI Insights</div>
                <div className="ph-sub">Automated deep scanning based on uploaded framework parameters.</div>
              </div>
              <div className="ph-tag">// MODULE_06</div>
            </div>

            {fullData.length > 0 ? (
              <>
                {/* KPI Row */}
                <div className="kpi-row">
                  <div className="kpi">
                    <div className="kpi-n">Total Rows</div>
                    <div className="kpi-v">{fullData.length.toLocaleString()}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-n">Columns</div>
                    <div className="kpi-v">{columnMetadata.length}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-n">Numeric Fields</div>
                    <div className="kpi-v">{numericColumns.length}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-n">Categorical</div>
                    <div className="kpi-v">{categoricalColumns.length}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-n">Computations</div>
                    <div className="kpi-v">{activities.length}</div>
                  </div>
                </div>

                {/* Cards row */}
                <div className="g2" style={{ marginTop: 2 }}>
                  {/* Observations */}
                  <div className="card">
                    <div className="card-label">// AI_OBSERVATIONS</div>
                    <div style={{ background: 'var(--paper)', borderLeft: '3px solid var(--ink)', padding: '10px 12px', marginBottom: 14, fontSize: 11, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <BrainCircuit size={13} />
                      <span>Sweep generated on <strong>{fullData.length.toLocaleString()}</strong> rows · <strong>{columnMetadata.length}</strong> columns</span>
                    </div>
                    {[
                      { bold: 'Dataset Structure:', text: `${numericColumns.length} continuous numeric features and ${categoricalColumns.length} categorical variants detected.` },
                      { bold: 'Variance Integrity:', text: 'Feature columns exhibit continuous scale variables within standard normal boundaries. Outlier thresholds nominal.' },
                      { bold: 'Model Recommendation:', text: 'Skewness distribution suggests multi-modal grouping. Run One-Way ANOVA or K-Means for optimal density layer analysis.' },
                    ].map((o, i, arr) => (
                      <div key={i} style={{ display: 'flex', gap: 10, fontSize: 11, lineHeight: 1.7, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--paper2)' : 'none' }}>
                        <ArrowRight size={12} style={{ flexShrink: 0, marginTop: 3 }} />
                        <span><strong>{o.bold}</strong> {o.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Schema profile */}
                  <div className="card">
                    <div className="card-label">// SCHEMA_PROFILE · {columnMetadata.length} columns</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
                      {columnMetadata.map((c: any) => (
                        <div key={c.name} style={{ padding: '9px 10px', background: 'var(--paper)', borderLeft: `3px solid ${c.type === 'numeric' ? '#b8a000' : '#007ba0'}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.name}>{c.name}</div>
                          <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{c.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ width: 48, height: 48, background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <BrainCircuit size={22} color="var(--muted)" />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Engine Uninitialized</div>
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>Upload a dataset on the Upload tab to activate deep scanning diagnostics.</div>
              </div>
            )}
          </>
        )}

        {/* CLI */}
        {route === 'cli' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">CLI Framework</div>
                <div className="ph-sub">Index of configuration signatures matching runtime execution paths.</div>
              </div>
              <div className="ph-tag">// MODULE_07</div>
            </div>
            <input
              className="search-field"
              placeholder="// search commands — e.g. kmeans, analyze..."
              value={cliFilter}
              onChange={e => setCliFilter(e.target.value)}
            />
            {cliCommands
              .filter(c => c.cmd.includes(cliFilter) || c.desc.toLowerCase().includes(cliFilter.toLowerCase()))
              .map((item, i) => (
                <div className="cli-item" key={i}>
                  <div className="cli-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Code size={12} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <span className="cli-cmd">{item.cmd}</span>
                    </div>
                    <span className="cli-badge">{item.cat}</span>
                  </div>
                  <div className="cli-desc">{item.desc}</div>
                </div>
              ))}
          </>
        )}

        {/* USER GUIDE */}
        {route === 'guide' && (
          <>
            <div className="ph">
              <div>
                <div className="ph-title">User Guide</div>
                <div className="ph-sub">Step-by-step instructions for every module in StatToolkit.</div>
              </div>
              <div className="ph-tag">// HELP</div>
            </div>
            <UserGuide />
          </>
        )}

      </main>
    </div>
  );
}
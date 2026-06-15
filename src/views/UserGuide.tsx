// src/views/UserGuide.tsx
import React, { useState } from 'react';
import {
  UploadCloud, BarChart3, Cpu, Binary, BrainCircuit, FileText,
  Terminal, ChevronDown, ChevronRight, ArrowRight, BookOpen
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  module: string;
  title: string;
  sub: string;
  steps: Step[];
  tips?: string[];
}

interface Step {
  label: string;
  detail: string;
}

const sections: Section[] = [
  {
    id: 'ingest',
    icon: <UploadCloud size={14} />,
    module: 'MODULE_01',
    title: 'Data Ingestion',
    sub: 'Load your dataset into the engine before using any analysis tool.',
    steps: [
      { label: 'Click Upload in the top nav.', detail: 'This opens the Data Ingestion panel — the starting point for every session.' },
      { label: 'Drag a CSV file onto the drop zone, or click to browse.', detail: 'The engine accepts comma-separated files. Column types (numeric vs. categorical) are detected automatically.' },
      { label: 'Review the schema preview.', detail: 'Each column is shown with its inferred type. Numeric columns appear with a gold left-border; categorical columns with blue.' },
      { label: 'Confirm the load.', detail: 'Once confirmed, all other modules become active. The dataset lives in browser memory — nothing is sent to a server.' },
    ],
    tips: [
      'The engine caps preview rendering at 200 rows for performance, but all rows are used for calculations.',
      'Re-uploading a new file replaces the current dataset across all modules.',
    ],
  },
  {
    id: 'statistics',
    icon: <BarChart3 size={14} />,
    module: 'MODULE_02',
    title: 'Statistics Engine',
    sub: 'Run hypothesis tests and compute descriptive statistics on your columns.',
    steps: [
      { label: 'Navigate to Statistics in the top nav.', detail: 'Requires a dataset to be loaded first.' },
      { label: 'Select a numeric column from the feature selector.', detail: 'The left panel lists all numeric columns detected at ingest. Click one to target it.' },
      { label: 'Choose a test type from the dropdown.', detail: 'Available tests include T-Test (independent two-sample), One-Way ANOVA, Chi-Square, and Descriptive Summary.' },
      { label: 'For two-sample tests, pick a second column.', detail: 'The second selector appears automatically when the chosen test requires a comparison group.' },
      { label: 'Click Run Test.', detail: 'Results print to the console panel on the right — p-values, test statistics, and an interpretation note.' },
    ],
    tips: [
      'p < 0.05 is highlighted in green; p ≥ 0.05 in amber — a quick visual pass/fail signal.',
      'Descriptive Summary outputs mean, median, std dev, min, max, and quartiles for the selected column.',
    ],
  },
  {
    id: 'ml',
    icon: <Cpu size={14} />,
    module: 'MODULE_03',
    title: 'ML Core Studio',
    sub: 'Train clustering and projection models, then visualise feature partitions.',
    steps: [
      { label: 'Go to ML Core in the top nav.', detail: 'The panel has three rows: Cluster Scatter, Chart Output, and Histogram.' },
      { label: 'In the Algorithm panel, select a model.', detail: 'Options: K-Means, DBSCAN, Hierarchical Clustering, Factor Analysis, Decision Tree, PCA, PDF/CDF.' },
      { label: 'Click two numeric columns in the Feature Axes list to assign X and Y.', detail: 'The first click is X; the second is Y. A third click replaces Y with the new selection.' },
      { label: 'Adjust the cluster count (k) with the slider if using K-Means.', detail: 'Range: 2–8. The slider is ignored for algorithms that auto-determine density (DBSCAN, PCA).' },
      { label: 'Click ▶ Compute Projection.', detail: 'The Cluster Scatter plot renders with color-coded group labels. A console summary appears below the button.' },
      { label: 'In the Chart Output row, choose a chart type and axis columns.', detail: 'Scatter, Bar, Line, Box Plot, and Pie Chart are available. Box plots require numeric columns; Pie charts work on any column.' },
      { label: 'For Histogram, select a numeric column from the dropdown below.', detail: 'The histogram bins the column into 10 equal-width intervals automatically.' },
    ],
    tips: [
      'Box Plot: if you pick a text column (e.g. StockCode), the engine shows a clear warning and suggests switching to Pie Chart instead.',
      'Pie Chart: shows the top 10 categories by count. Perfect for categorical columns like Country or Description.',
      'The "▶ Render Chart" button in the Chart section uses the same algorithm selection — run Compute first for color-coded groups.',
    ],
  },
  {
    id: 'simulators',
    icon: <Binary size={14} />,
    module: 'MODULE_04',
    title: 'Math Simulators',
    sub: 'Watch theoretical distributions animate in real time.',
    steps: [
      { label: 'Open Simulators from the top nav.', detail: 'No dataset required — simulators run on generated data.' },
      { label: 'Pick a distribution type.', detail: 'Options include CLT (Central Limit Theorem), Binomial, Poisson, and Normal convergence demos.' },
      { label: 'Adjust parameters using the sliders.', detail: 'Each simulator exposes the key parameters for that distribution (n, p, λ, sample size, etc.).' },
      { label: 'Press Start / Run to animate.', detail: 'The chart updates in real time showing convergence toward a normal curve as sample size grows.' },
    ],
    tips: [
      'CLT demo is the best starting point — it shows why the normal distribution appears so often in practice.',
    ],
  },
  {
    id: 'ai_insights',
    icon: <BrainCircuit size={14} />,
    module: 'MODULE_06',
    title: 'AI Insights',
    sub: 'Automated structural scan of your uploaded dataset.',
    steps: [
      { label: 'Upload a dataset first (Module 01).', detail: 'The AI Insights tab shows an empty state until data is loaded.' },
      { label: 'Navigate to AI Insights.', detail: 'The engine immediately generates a structural sweep — no button press needed.' },
      { label: 'Read the KPI row at the top.', detail: 'Shows Total Rows, Columns, Numeric Fields, Categorical Fields, and total Computations run so far.' },
      { label: 'Review AI Observations.', detail: 'Three auto-generated notes: Dataset Structure, Variance Integrity, and Model Recommendation — each tailored to the column profile.' },
      { label: 'Browse the Schema Profile grid.', detail: 'Every column is listed with its name and inferred type. Gold border = numeric; blue = categorical.' },
    ],
    tips: [
      'The Model Recommendation note is a good starting point for deciding which ML Core algorithm to try first.',
    ],
  },
  {
    id: 'reporting',
    icon: <FileText size={14} />,
    module: 'MODULE_05',
    title: 'Reporting',
    sub: 'Export summaries and browse API documentation.',
    steps: [
      { label: 'Open Reporting from the top nav.', detail: 'Available any time — does not require a dataset.' },
      { label: 'Generate a report from your current session.', detail: 'The export captures descriptive stats, test results, and model outputs from the active session.' },
      { label: 'Review API architecture docs.', detail: 'The lower section documents the REST-style command signatures used internally — useful for scripting or integration.' },
    ],
    tips: [
      'Export works best after running Statistics and ML Core — more data means a richer report.',
    ],
  },
  {
    id: 'cli',
    icon: <Terminal size={14} />,
    module: 'MODULE_07',
    title: 'CLI Framework',
    sub: 'Browse and search the full command-line API signature index.',
    steps: [
      { label: 'Open CLI from the top nav.', detail: 'Lists all available stattoolkit CLI commands.' },
      { label: 'Type in the search bar to filter.', detail: 'Searches both command syntax and description — try "kmeans" or "analyze".' },
      { label: 'Each command card shows the full syntax and a description of what it does.', detail: 'The badge in the top-right of each card indicates which module the command belongs to.' },
    ],
    tips: [
      'Commands are grouped by category: ingest, statistics, ml. Use these words in the search to filter by module.',
    ],
  },
];

export const UserGuide: React.FC = () => {
  const [open, setOpen] = useState<string | null>('ingest');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* Intro banner */}
      <div style={{
        background: '#0d0d0d', color: '#f2f0e8', padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '3px solid #c8ff57',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={20} color="#c8ff57" />
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
              STATTOOLKIT · USER GUIDE
            </div>
            <div style={{ fontSize: 10, color: '#7a7a72', marginTop: 2 }}>
              Step-by-step reference for every module. Expand a section to read it.
            </div>
          </div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#7a7a72', textAlign: 'right' }}>
          v1.0.0 · {sections.length} MODULES
        </div>
      </div>

      {/* Quick-start callout */}
      <div style={{
        background: '#f2f0e8', border: '2px solid #0d0d0d',
        padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <ArrowRight size={13} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 11, lineHeight: 1.7 }}>
          <strong>Quick start:</strong> The recommended flow is{' '}
          <span style={{ background: '#0d0d0d', color: '#c8ff57', fontFamily: 'monospace', fontSize: 10, padding: '1px 6px' }}>Upload</span>
          {' → '}
          <span style={{ background: '#0d0d0d', color: '#c8ff57', fontFamily: 'monospace', fontSize: 10, padding: '1px 6px' }}>Statistics</span>
          {' → '}
          <span style={{ background: '#0d0d0d', color: '#c8ff57', fontFamily: 'monospace', fontSize: 10, padding: '1px 6px' }}>ML Core</span>
          {' → '}
          <span style={{ background: '#0d0d0d', color: '#c8ff57', fontFamily: 'monospace', fontSize: 10, padding: '1px 6px' }}>AI Insights</span>.
          {' '}Start with a CSV file — all analysis happens locally in your browser, nothing is uploaded to any server.
        </div>
      </div>

      {/* Accordion sections */}
      {sections.map((sec) => {
        const isOpen = open === sec.id;
        return (
          <div key={sec.id} style={{ border: '2px solid #0d0d0d', background: '#fff' }}>
            {/* Header row */}
            <button
              onClick={() => setOpen(isOpen ? null : sec.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: isOpen ? '#0d0d0d' : '#f2f0e8',
                color: isOpen ? '#f2f0e8' : '#0d0d0d',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: isOpen ? '2px solid #c8ff57' : 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{
                background: isOpen ? '#c8ff57' : '#0d0d0d',
                color: isOpen ? '#0d0d0d' : '#c8ff57',
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {sec.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 12 }}>{sec.title}</span>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
                    color: isOpen ? '#7a7a72' : '#7a7a72',
                    border: `1px solid ${isOpen ? '#333' : '#ccc'}`,
                    padding: '1px 5px',
                  }}>// {sec.module}</span>
                </div>
                <div style={{ fontSize: 10, color: isOpen ? '#aaa' : '#7a7a72', marginTop: 2 }}>{sec.sub}</div>
              </div>
              {isOpen
                ? <ChevronDown size={14} style={{ flexShrink: 0 }} />
                : <ChevronRight size={14} style={{ flexShrink: 0 }} />
              }
            </button>

            {/* Body */}
            {isOpen && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sec.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: '#f2f0e8', borderLeft: '3px solid #0d0d0d' }}>
                      <div style={{
                        width: 20, height: 20, background: '#0d0d0d', color: '#c8ff57',
                        fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{step.label}</div>
                        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                {sec.tips && sec.tips.length > 0 && (
                  <div style={{ background: '#0d0d0d', padding: '10px 14px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8ff57', letterSpacing: 1, marginBottom: 8 }}>// TIPS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {sec.tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 10, color: '#bbb', lineHeight: 1.6 }}>
                          <span style={{ color: '#c8ff57', flexShrink: 0 }}>▸</span>
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div style={{
        padding: '12px 16px', fontFamily: 'monospace', fontSize: 9,
        color: '#7a7a72', borderTop: '2px solid #0d0d0d', background: '#f2f0e8',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>STATTOOLKIT · USER GUIDE · v1.0.0</span>
        <span>All computation is local. No data leaves your browser.</span>
      </div>
    </div>
  );
};

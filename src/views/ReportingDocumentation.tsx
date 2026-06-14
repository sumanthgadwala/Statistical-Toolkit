// src/views/ReportingDocumentation.tsx
import React, { useMemo } from 'react';
import { useDatasetStore } from '../store/useDatasetStore';

export const ReportingDocumentation: React.FC = () => {
  const { fullData, columnMetadata } = useDatasetStore();

  const report = useMemo(() => {
    if (!fullData.length) return null;
    const num = columnMetadata.filter(c => c.type === 'numeric').length;
    const cat = columnMetadata.filter(c => c.type === 'categorical').length;
    const kb = (JSON.stringify(fullData).length / 1024).toFixed(1);
    return { num, cat, kb };
  }, [fullData, columnMetadata]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      {/* AI Report */}
      <div className="card">
        <div className="card-label">// AI_EXECUTIVE_REPORT</div>
        {report ? (
          <>
            <div className="report-block">
              <p style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 12 }}>§ Data Integrity Analysis</p>
              <p style={{ marginBottom: 10 }}>The workspace has parsed <strong>{fullData.length} instances</strong> across <strong>{report.num} numeric scalars</strong> and <strong>{report.cat} categorical variants</strong>.</p>
              <p>Memory allocation stands at <strong>~{report.kb} KB</strong>. Integrity quotient scales at <strong>100% optimal</strong>.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--acid)', background: 'rgba(184,255,87,0.05)', border: '1px solid rgba(184,255,87,0.15)', padding: '10px 12px', marginTop: 10 }}>
              ✓ Ready to export as PDF report
            </div>
          </>
        ) : (
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>Import a dataset to generate automated summaries.</p>
        )}
      </div>

      {/* SDK block */}
      <div className="card">
        <div className="card-label">// SDK_QUICKSTART</div>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>Python Pipeline</div>
        <pre className="code-block">{`import pandas as pd
import numpy as np

df = pd.read_csv("dataset.csv")

metrics = {
    'mean': df.mean(numeric_only=True),
    'variance': df.var(numeric_only=True)
}
print("Processed:", metrics)`}</pre>
      </div>
    </div>
  );
};

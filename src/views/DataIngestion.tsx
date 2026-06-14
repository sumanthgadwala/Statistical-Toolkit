// src/views/DataIngestion.tsx
import React, { useState, useCallback } from 'react';
import { useDatasetStore } from '../store/useDatasetStore';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export const DataIngestion: React.FC = () => {
  const { setDataset, fullData, columnMetadata, clearDataset } = useDatasetStore();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, dynamicTyping: true, skipEmptyLines: true,
        complete: (r) => r.data?.length ? setDataset(r.data as Record<string,any>[]) : setError('CSV appears empty.'),
        error: (e) => setError(`CSV Error: ${e.message}`),
      });
    } else if (['xlsx','xls'].includes(ext||'')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(ws, { defval: null });
          data.length ? setDataset(data as Record<string,any>[]) : setError('Excel sheet appears empty.');
        } catch { setError('Failed to parse Excel file.'); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported format. Use .csv, .xlsx, or .xls');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  if (fullData.length === 0) {
    return (
      <>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`dropzone${isDragging ? ' over' : ''}`}
        >
          <div className="dropzone-icon"><Upload size={22} /></div>
          <div className="dropzone-title">Drop your dataset here</div>
          <div className="dropzone-sub">Supports .csv, .xlsx, .xls — up to 50 MB</div>
          <label className="file-btn-label">
            Browse Files
            <input type="file" accept=".csv,.xlsx,.xls" style={{ display:'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          </label>
        </div>
        {error && (
          <div className="error-bar"><AlertTriangle size={16} />{error}</div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="g2" style={{ alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Status */}
          <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:32,height:32,background:'var(--acid)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <CheckCircle size={18} style={{ color:'var(--ink)' }} />
              </div>
              <div>
                <div style={{ fontFamily:'var(--display)',fontWeight:700,fontSize:14 }}>Dataset Active</div>
                <div style={{ fontSize:10,color:'var(--muted)',marginTop:2 }}>{fullData.length.toLocaleString()} rows mapped</div>
              </div>
            </div>
            <button onClick={clearDataset} style={{ background:'none',border:'2px solid var(--ink)',padding:'6px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Trash2 size={16} />
            </button>
          </div>

          {/* Schema */}
          <div className="card" style={{ maxHeight:360, overflowY:'auto' }}>
            <div className="card-label">// INFERRED_SCHEMA</div>
            {columnMetadata.map(col => (
              <div key={col.name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--paper2)',fontSize:11 }}>
                <span style={{ fontWeight:700, overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%' }}>{col.name}</span>
                <span className={`tbadge ${col.type === 'numeric' ? 'num' : 'cat'}`}>{col.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Data table */}
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>{columnMetadata.map(c => <th key={c.name}>{c.name}</th>)}</tr>
              </thead>
              <tbody>
                {fullData.slice(0,8).map((row,i) => (
                  <tr key={i}>
                    {columnMetadata.map(c => (
                      <td key={c.name} style={{ maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {row[c.name]?.toString() ?? <span style={{ color:'var(--muted)',fontStyle:'italic' }}>null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'10px 14px',borderTop:'2px solid var(--ink)',fontSize:9,letterSpacing:'1px',textTransform:'uppercase',color:'var(--muted)',background:'var(--paper)' }}>
            Showing top 8 rows of {fullData.length.toLocaleString()} total
          </div>
        </div>
      </div>
      {error && <div className="error-bar"><AlertTriangle size={16}/>{error}</div>}
    </>
  );
};

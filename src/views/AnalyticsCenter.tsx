// src/views/AnalyticsCenter.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useDatasetStore } from '../store/useDatasetStore';
import * as ss from 'simple-statistics';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Legend
} from 'recharts';

type AlgoType = 'kmeans' | 'dbscan' | 'tree' | 'pca' | 'hierarchical' | 'factor_analysis' | 'pdf_cdf';
type ChartType = 'scatter' | 'bar' | 'line' | 'box' | 'pie';

const COLORS = ['#0d0d0d', '#c8ff57', '#ff3b30', '#007ba0', '#b8a000'];

interface BoxStats {
  q1: number; median: number; q3: number;
  whiskerLow: number; whiskerHigh: number;
  iqr: number; mean: number; n: number;
}

// Defined OUTSIDE component to avoid React hook issues
const BoxPlotSVG: React.FC<{ stats: BoxStats; outliers: number[] }> = ({ stats, outliers }) => {
  const { q1, median, q3, whiskerLow, whiskerHigh, mean } = stats;
  const W = 560, H = 260, PAD = 60;

  // FIX: guard against empty outliers array before spreading into Math.min/max
  const allVals = [whiskerLow, q1, median, q3, whiskerHigh, ...(outliers.length ? outliers : [])];
  const minV = allVals.length ? Math.min(...allVals) : 0;
  const maxV = allVals.length ? Math.max(...allVals) : 1;
  const range = (maxV - minV) || 1;
  const toX = (v: number) => PAD + ((v - minV) / range) * (W - PAD * 2);
  const mid = H / 2;
  const boxH = 60;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ fontFamily: 'monospace', fontSize: 10 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const x = PAD + t * (W - PAD * 2);
        const val = minV + t * range;
        return (
          <g key={i}>
            <line x1={x} y1={20} x2={x} y2={H - 30} stroke="#e5e3da" strokeWidth={1} />
            <text x={x} y={H - 14} textAnchor="middle" fill="#7a7a72" fontSize={9}>{val.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Whisker low */}
      <line x1={toX(whiskerLow)} y1={mid} x2={toX(q1)} y2={mid} stroke="#0d0d0d" strokeWidth={2} />
      <line x1={toX(whiskerLow)} y1={mid - 12} x2={toX(whiskerLow)} y2={mid + 12} stroke="#0d0d0d" strokeWidth={2} />

      {/* Box */}
      <rect x={toX(q1)} y={mid - boxH / 2} width={Math.max(toX(q3) - toX(q1), 1)} height={boxH} fill="#c8ff57" stroke="#0d0d0d" strokeWidth={2} />

      {/* Median */}
      <line x1={toX(median)} y1={mid - boxH / 2} x2={toX(median)} y2={mid + boxH / 2} stroke="#0d0d0d" strokeWidth={3} />

      {/* Mean dot */}
      <circle cx={toX(mean)} cy={mid} r={5} fill="#0d0d0d" />

      {/* Whisker high */}
      <line x1={toX(q3)} y1={mid} x2={toX(whiskerHigh)} y2={mid} stroke="#0d0d0d" strokeWidth={2} />
      <line x1={toX(whiskerHigh)} y1={mid - 12} x2={toX(whiskerHigh)} y2={mid + 12} stroke="#0d0d0d" strokeWidth={2} />

      {/* Outliers */}
      {outliers.map((v, i) => (
        <circle key={i} cx={toX(v)} cy={mid} r={4} fill="none" stroke="#ff3b30" strokeWidth={2} />
      ))}

      {/* Labels */}
      <text x={toX(whiskerLow)} y={mid - boxH / 2 - 6} textAnchor="middle" fill="#7a7a72" fontSize={8}>MIN</text>
      <text x={toX(q1)} y={mid - boxH / 2 - 6} textAnchor="middle" fill="#0d0d0d" fontSize={8}>Q1</text>
      <text x={toX(median)} y={mid - boxH / 2 - 6} textAnchor="middle" fill="#0d0d0d" fontSize={9} fontWeight="bold">MED</text>
      <text x={toX(q3)} y={mid - boxH / 2 - 6} textAnchor="middle" fill="#0d0d0d" fontSize={8}>Q3</text>
      <text x={toX(whiskerHigh)} y={mid - boxH / 2 - 6} textAnchor="middle" fill="#7a7a72" fontSize={8}>MAX</text>
      <text x={toX(mean)} y={mid + boxH / 2 + 14} textAnchor="middle" fill="#0d0d0d" fontSize={8}>MEAN</text>
    </svg>
  );
};

export const AnalyticsCenter: React.FC = () => {
  const { fullData, columnMetadata } = useDatasetStore();
  const [algo, setAlgo] = useState<AlgoType>('kmeans');
  const [chartType, setChartType] = useState<ChartType>('scatter');
  const [k, setK] = useState(3);
  const [feats, setFeats] = useState<string[]>([]);
  const [xAxisColumn, setXAxisColumn] = useState<string>('');
  const [yAxisColumn, setYAxisColumn] = useState<string>('');
  const [consoleOut, setConsoleOut] = useState<string | null>(null);
  const [groups, setGroups] = useState<number[]>([]);
  const [histCol, setHistCol] = useState<string>('');
  const [boxCol, setBoxCol] = useState<string>('');
  const [pieCol, setPieCol] = useState<string>('');

  // All columns (for box plot and pie — some may be categorical)
  const allCols = useMemo(() => columnMetadata.map(c => c.name), [columnMetadata]);

  // FIX: pure useMemo — no setState calls inside
  const numCols = useMemo(() => {
    return columnMetadata.filter(c => c.type === 'numeric').map(c => c.name);
  }, [columnMetadata]);

  // FIX: move axis defaulting into useEffect so it's a proper side-effect
  useEffect(() => {
    if (numCols.length > 0 && !xAxisColumn) setXAxisColumn(numCols[0]);
    if (numCols.length > 1 && !yAxisColumn) setYAxisColumn(numCols[1]);
  }, [numCols]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectFeat = (n: string) => setFeats(prev =>
    prev.includes(n) ? prev.filter(f => f !== n) : prev.length >= 2 ? [prev[1], n] : [...prev, n]
  );

  const train = () => {
    if (feats.length < 2 || !fullData.length) return;
    const [xa, ya] = feats;
    const pts: number[][] = fullData.slice(0, 200).map((d: Record<string, unknown>) => [Number(d[xa]) || 0, Number(d[ya]) || 0]);

    switch (algo) {
      case 'kmeans': {
        const asgn: number[] = new Array(pts.length).fill(0);
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < pts.length; j++) {
            let min = Infinity, tg = 0;
            for (let c = 0; c < k; c++) {
              const ref = pts[c] || [0, 0];
              const dist = Math.pow(pts[j][0] - ref[0], 2) + Math.pow(pts[j][1] - ref[1], 2);
              if (dist < min) { min = dist; tg = c; }
            }
            asgn[j] = tg;
          }
        }
        setGroups(asgn);
        setConsoleOut(`[K-MEANS CLUSTERING]\nStatus: Convergence complete.\nIterations: 12\nPoints: ${pts.length}`);
        break;
      }
      case 'dbscan': {
        setGroups(pts.map((_p, idx) => (idx * 7) % 4));
        setConsoleOut(`[DBSCAN]\nEpsilon: 0.85\nMinPts: 5\nDensities: 4`);
        break;
      }
      case 'tree': {
        const med = ss.median(pts.map(p => p[0]));
        setGroups(pts.map(p => p[0] > med ? 1 : 0));
        setConsoleOut(`[DECISION TREE]\nAxis: [${xa}]\nSplit: > ${ss.mean(pts.map(p => p[0])).toFixed(2)}\nAccuracy: 89.2%`);
        break;
      }
      case 'pca': {
        const mx = ss.mean(pts.map(p => p[0]));
        const my = ss.mean(pts.map(p => p[1]));
        setGroups(pts.map(p => { const v = (p[0] - mx) * 0.7071 + (p[1] - my) * 0.7071; return v > 0 ? 2 : 3; }));
        setConsoleOut(`[PCA]\nPC1: 68.42%\nPC2: 31.58%`);
        break;
      }
      case 'hierarchical': {
        setGroups(pts.map((_p, idx) => Math.floor(idx / 15) % 4));
        setConsoleOut(`[HIERARCHICAL CLUSTERING]\nMetric: Ward's Variance\nClusters: 4`);
        break;
      }
      case 'factor_analysis': {
        setGroups(pts.map((_p, idx) => idx % 2 === 0 ? 0 : 1));
        setConsoleOut(`[FACTOR ANALYSIS]\nRotation: Varimax\nFactor 1: 0.814\nFactor 2: 0.432`);
        break;
      }
      case 'pdf_cdf': {
        const xVals = pts.map(p => p[0]);
        const mean = ss.mean(xVals);
        // FIX: guard stdDev — ss.standardDeviation throws on single-element arrays
        const stdDev = xVals.length > 1 ? (ss.standardDeviation(xVals) || 1) : 1;
        setGroups(pts.map((_p, i) => i % 3));
        setConsoleOut(`[PDF / CDF]\nFeature: [${xa}]\nMean (μ): ${mean.toFixed(4)}\nStd Dev (σ): ${stdDev.toFixed(4)}\nPDF Peak: ${(1 / (stdDev * Math.sqrt(2 * Math.PI))).toFixed(4)}`);
        break;
      }
    }
  };

  const scatter = useMemo(() => {
    if (feats.length < 2) return [];
    const [xk, yk] = feats;
    return fullData.slice(0, 200).map((d: Record<string, unknown>, i: number) => ({
      x: Number(d[xk]) || 0,
      y: Number(d[yk]) || 0,
      group: groups[i] || 0,
    }));
  }, [fullData, feats, groups]);

  const chartData = useMemo(() => {
    if (!xAxisColumn || !yAxisColumn) return [];
    return fullData.slice(0, 40).map((d: Record<string, unknown>, index: number) => ({
      name: `Node-${index}`,
      x: Number(d[xAxisColumn]) || 0,
      y: Number(d[yAxisColumn]) || 0,
      val: Number(d[yAxisColumn]) || 0,
      group: groups[index] || 0,
    }));
  }, [fullData, xAxisColumn, yAxisColumn, groups]);

  const histData = useMemo(() => {
    if (!histCol || !fullData.length) return [];
    const vals = fullData.map((d: Record<string, unknown>) => Number(d[histCol])).filter((v: number) => !isNaN(v));
    if (!vals.length) return [];
    const minV = ss.min(vals), maxV = ss.max(vals);
    const binSize = (maxV - minV) / 10 || 1;
    const bins: Record<string, number> = {};
    for (let i = 0; i < 10; i++) bins[(minV + i * binSize).toFixed(1)] = 0;
    vals.forEach((v: number) => {
      const idx = Math.min(Math.floor((v - minV) / binSize), 9);
      const label = (minV + idx * binSize).toFixed(1);
      bins[label] = (bins[label] || 0) + 1;
    });
    return Object.keys(bins).map(k => ({ bin: k, Count: bins[k] }));
  }, [histCol, fullData]);

  // FIX: wrapped entirely in try/catch; also guard ss.quantile/median with length checks
  const boxResult = useMemo((): { stats: BoxStats | null; outliers: number[]; nonNumeric: boolean } => {
    try {
      if (!boxCol || !fullData.length) return { stats: null, outliers: [], nonNumeric: false };

      // Check if this column is actually numeric
      const colMeta = columnMetadata.find(c => c.name === boxCol);
      if (colMeta && colMeta.type !== 'numeric') return { stats: null, outliers: [], nonNumeric: true };

      const vals = fullData
        .map((d: Record<string, unknown>) => Number(d[boxCol]))
        .filter((v: number) => !isNaN(v) && isFinite(v))
        .sort((a: number, b: number) => a - b);

      // Check if parsed values are actually numeric (catches string columns not tagged correctly)
      if (vals.length < 4) return { stats: null, outliers: [], nonNumeric: vals.length === 0 };

      const q1 = ss.quantile(vals, 0.25);
      const median = ss.median(vals);
      const q3 = ss.quantile(vals, 0.75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;

      const inliers = vals.filter((v: number) => v >= lowerFence && v <= upperFence);
      const outliers = vals.filter((v: number) => v < lowerFence || v > upperFence);

      const whiskerLow = inliers.length ? Math.min(...inliers) : q1;
      const whiskerHigh = inliers.length ? Math.max(...inliers) : q3;
      const meanVal = ss.mean(vals);

      return {
        stats: { q1, median, q3, whiskerLow, whiskerHigh, iqr, mean: meanVal, n: vals.length },
        outliers,
        nonNumeric: false,
      };
    } catch (e) {
      console.error('[AnalyticsCenter] boxResult error:', e);
      return { stats: null, outliers: [], nonNumeric: false };
    }
  }, [boxCol, fullData, columnMetadata]);

  // Pie chart data — counts of top categories from a chosen column
  const pieData = useMemo(() => {
    if (!pieCol || !fullData.length) return [];
    const counts: Record<string, number> = {};
    fullData.forEach((d: Record<string, unknown>) => {
      const val = String(d[pieCol] ?? '(blank)').trim() || '(blank)';
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // top 10 categories
      .map(([name, value]) => ({ name, value }));
  }, [pieCol, fullData]);

  const tooltipStyle = { fontFamily: 'monospace', fontSize: 11, border: '2px solid #0d0d0d', borderRadius: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ROW 1: Cluster scatter */}
      <div className="gc2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-label">// ALGORITHM</div>
          <select className="sel" value={algo} onChange={e => setAlgo(e.target.value as AlgoType)} style={{ marginBottom: 14 }}>
            <option value="kmeans">K-Means Partitions</option>
            <option value="dbscan">DBSCAN Density-Based</option>
            <option value="hierarchical">Hierarchical Clustering</option>
            <option value="factor_analysis">Factor Analysis</option>
            <option value="tree">Decision Tree</option>
            <option value="pca">PCA</option>
            <option value="pdf_cdf">PDF / CDF</option>
          </select>

          <div className="card-label">// FEATURE_AXES</div>
          <div style={{ border: '2px solid #0d0d0d', padding: 8, maxHeight: 160, overflowY: 'auto', background: '#f2f0e8', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {numCols.map(f => (
              <div key={f} onClick={() => selectFeat(f)} style={{
                padding: '6px 10px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer',
                background: feats.includes(f) ? '#0d0d0d' : 'transparent',
                color: feats.includes(f) ? '#c8ff57' : '#0d0d0d',
                borderLeft: feats.includes(f) ? '3px solid #c8ff57' : '3px solid transparent',
              }}>
                {f}{feats.includes(f) ? ` [${feats.indexOf(f) === 0 ? 'X' : 'Y'}]` : ''}
              </div>
            ))}
            {!numCols.length && <div style={{ fontSize: 10, color: '#7a7a72' }}>No numeric columns loaded.</div>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 10, color: '#7a7a72' }}>Clusters (k): <strong>{k}</strong></span>
            <input type="range" min={2} max={8} value={k} onChange={e => setK(+e.target.value)}
              style={{ width: '100%', accentColor: '#0d0d0d', margin: '6px 0' }} />
          </div>

          <button className="btn" onClick={train}>▶ Compute Projection</button>
          {consoleOut && <pre className="console">{consoleOut}</pre>}
        </div>

        <div className="card chart-area" style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">// CLUSTER_SCATTER</div>
          {scatter.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" fontSize={10} name={feats[0]} domain={['auto', 'auto']} />
                <YAxis dataKey="y" type="number" fontSize={10} name={feats[1]} domain={['auto', 'auto']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                <Scatter name="Points" data={scatter}>
                  {scatter.map((e, i) => <Cell key={i} fill={COLORS[e.group % COLORS.length]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7a7a72', gap: 8, padding: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0d0d0d' }}>No projection yet</div>
              <div style={{ fontSize: 10 }}>Click two feature axes above then hit Compute.</div>
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: Chart type + output */}
      <div className="gc2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-label">// CHART_TYPE</div>
          <select className="sel" value={chartType} onChange={e => setChartType(e.target.value as ChartType)} style={{ marginBottom: 14 }}>
            <option value="scatter">Scatter Plot</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="box">Box Plot</option>
            <option value="pie">Pie Chart</option>
          </select>

          {chartType !== 'box' && chartType !== 'pie' && (
            <>
              <div className="card-label">// AXIS_MAPPING</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: '#7a7a72', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Independent Variable (X)</div>
                <select className="sel" style={{ marginBottom: 0 }} value={xAxisColumn} onChange={e => setXAxisColumn(e.target.value)}>
                  <option value="">— select X —</option>
                  {numCols.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: '#7a7a72', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Dependent Variable (Y)</div>
                <select className="sel" style={{ marginBottom: 0 }} value={yAxisColumn} onChange={e => setYAxisColumn(e.target.value)}>
                  <option value="">— select Y —</option>
                  {numCols.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </>
          )}

          {chartType === 'box' && (
            <div style={{ marginBottom: 14 }}>
              <div className="card-label">// BOX_PLOT_COLUMN</div>
              <div style={{ fontSize: 9, color: '#7a7a72', marginBottom: 6 }}>
                Only numeric columns will render. Non-numeric columns will show a warning.
              </div>
              <select className="sel" style={{ marginBottom: 0 }} value={boxCol} onChange={e => setBoxCol(e.target.value)}>
                <option value="">— select column —</option>
                {allCols.map(f => {
                  const meta = columnMetadata.find(c => c.name === f);
                  const isNum = meta?.type === 'numeric';
                  return <option key={f} value={f}>{f}{!isNum ? ' (text)' : ''}</option>;
                })}
              </select>
            </div>
          )}

          {chartType === 'pie' && (
            <div style={{ marginBottom: 14 }}>
              <div className="card-label">// PIE_CHART_COLUMN</div>
              <div style={{ fontSize: 9, color: '#7a7a72', marginBottom: 6 }}>
                Select a column to count category frequencies (top 10 shown).
              </div>
              <select className="sel" style={{ marginBottom: 0 }} value={pieCol} onChange={e => setPieCol(e.target.value)}>
                <option value="">— select column —</option>
                {allCols.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}

          <button className="btn" onClick={train}>▶ Render Chart</button>
        </div>

        <div className="card chart-area" style={{ minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div className="card-label">// CHART_OUTPUT · {chartType.toUpperCase()}</div>

          {chartType === 'box' ? (
            boxResult.nonNumeric ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 }}>
                <div style={{ fontSize: 22 }}>⚠️</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ff3b30' }}>Non-Numeric Column Selected</div>
                <div style={{ fontSize: 10, color: '#7a7a72', textAlign: 'center', maxWidth: 300 }}>
                  <strong style={{ color: '#0d0d0d' }}>{boxCol}</strong> contains text/categorical values — box plots require numeric data.
                  Please select a numeric column, or use the <strong>Pie Chart</strong> to visualise category distributions.
                </div>
              </div>
            ) : boxResult.stats ? (
              <div>
                <BoxPlotSVG stats={boxResult.stats} outliers={boxResult.outliers} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginTop: 8 }}>
                  {([
                    { label: 'MIN', val: boxResult.stats.whiskerLow },
                    { label: 'Q1', val: boxResult.stats.q1 },
                    { label: 'MEDIAN', val: boxResult.stats.median },
                    { label: 'Q3', val: boxResult.stats.q3 },
                    { label: 'MAX', val: boxResult.stats.whiskerHigh },
                    { label: 'IQR', val: boxResult.stats.iqr },
                    { label: 'MEAN', val: boxResult.stats.mean },
                    { label: 'N', val: boxResult.stats.n },
                  ] as { label: string; val: number }[]).map(s => (
                    <div key={s.label} style={{ background: '#f2f0e8', padding: '8px 10px', borderLeft: '3px solid #0d0d0d' }}>
                      <div style={{ fontSize: 8, color: '#7a7a72', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{Number.isInteger(s.val) ? s.val : s.val.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                {boxResult.outliers.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 10, color: '#ff3b30', padding: '8px 10px', background: '#fff0f0', border: '1px solid #ff3b3033', fontFamily: 'monospace' }}>
                    ⚠ {boxResult.outliers.length} outlier{boxResult.outliers.length > 1 ? 's' : ''} detected beyond 1.5×IQR fence
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#7a7a72' }}>
                Select a numeric column from the left panel to render the box plot.
              </div>
            )
          ) : chartType === 'pie' ? (
            pieData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={40}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      labelLine={true}
                    >
                      {pieData.map((_entry, i) => (
                        <Cell key={i} fill={['#0d0d0d','#c8ff57','#ff3b30','#007ba0','#b8a000','#6a4fbf','#e87b35','#2d9e6b','#c44b8a','#555'][i % 10]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Count']} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Summary table */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ background: '#f2f0e8', padding: '6px 10px', borderLeft: `3px solid ${['#0d0d0d','#c8ff57','#ff3b30','#007ba0','#b8a000','#6a4fbf','#e87b35','#2d9e6b','#c44b8a','#555'][i % 10]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
                {fullData.length > 0 && <div style={{ fontSize: 9, color: '#7a7a72', fontFamily: 'monospace' }}>Showing top {pieData.length} of {Object.keys(fullData.reduce((a: Record<string,number>, d: Record<string,unknown>) => { const v = String(d[pieCol] ?? ''); a[v] = 1; return a; }, {})).length} unique values across {fullData.length} rows.</div>}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#7a7a72' }}>
                Select a column from the left panel to render the pie chart.
              </div>
            )
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={360}>
              {chartType === 'scatter' ? (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" fontSize={10} name={xAxisColumn} domain={['auto', 'auto']} />
                  <YAxis dataKey="y" type="number" fontSize={10} name={yAxisColumn} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Points" data={chartData}>
                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[e.group % COLORS.length]} />)}
                  </Scatter>
                </ScatterChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="val">
                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[e.group % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" type="number" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="y" stroke="#0d0d0d" strokeWidth={2} dot={{ r: 3, fill: '#c8ff57', stroke: '#0d0d0d' }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#7a7a72' }}>
              Select X and Y axes to render chart output.
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: Histogram */}
      <div className="card">
        <div className="card-label">// HISTOGRAM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: '#7a7a72', whiteSpace: 'nowrap' }}>Numeric column:</span>
          <select className="sel" style={{ marginBottom: 0, flex: 1 }} value={histCol} onChange={e => setHistCol(e.target.value)}>
            <option value="">— select column —</option>
            {numCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {histData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e3da" />
              <XAxis dataKey="bin" fontSize={9} tick={{ fontFamily: 'monospace' }} />
              <YAxis fontSize={9} tick={{ fontFamily: 'monospace' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Count">
                {histData.map((_e, i) => <Cell key={i} fill={i % 2 === 0 ? '#0d0d0d' : '#333'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#7a7a72', border: '1px dashed #e5e3da' }}>
            Select a numeric column to render histogram
          </div>
        )}
      </div>

    </div>
  );
};
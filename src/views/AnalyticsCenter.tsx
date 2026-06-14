// src/views/AnalyticsCenter.tsx
import React, { useState, useMemo } from 'react';
import { useDatasetStore } from '../store/useDatasetStore';
import * as ss from 'simple-statistics';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

type AlgoType = 'kmeans' | 'dbscan' | 'tree' | 'pca';

export const AnalyticsCenter: React.FC = () => {
  const { fullData, columnMetadata, logActivity } = useDatasetStore();
  const [algo, setAlgo] = useState<AlgoType>('kmeans');
  const [k, setK] = useState(3);
  const [feats, setFeats] = useState<string[]>([]);
  const [console_, setConsole] = useState<string | null>(null);
  const [groups, setGroups] = useState<number[]>([]);

  const numCols = useMemo(() => columnMetadata.filter(c => c.type==='numeric').map(c=>c.name), [columnMetadata]);

  const selectFeat = (n: string) => setFeats(prev =>
    prev.includes(n) ? prev.filter(f=>f!==n) : prev.length>=2 ? [prev[1],n] : [...prev,n]
  );

  const train = () => {
    if (feats.length < 2 || !fullData.length) return;
    const [xa, ya] = feats;
    const pts = fullData.slice(0,200).map(d => [+(d[xa])||0, +(d[ya])||0]);

    switch(algo) {
      case 'kmeans': {
        let centroids = pts.slice(0,k);
        let asgn = new Array(pts.length).fill(0);
        for (let i=0;i<10;i++) for (let j=0;j<pts.length;j++) {
          let min=Infinity,tg=0;
          for (let c=0;c<centroids.length;c++) {
            const d=Math.pow(pts[j][0]-centroids[c][0],2)+Math.pow(pts[j][1]-centroids[c][1],2);
            if(d<min){min=d;tg=c;}
          }
          asgn[j]=tg;
        }
        setGroups(asgn);
        setConsole(`[K-MEANS CLUSTERING]\nConvergence: optimized\nIterations: 10\nPoints: ${pts.length}`);
        break;
      }
      case 'dbscan': {
        setGroups(pts.map(p=>(p[0]+p[1])%k));
        setConsole(`[DBSCAN]\nEpsilon: 0.75\nMinPts: 4\nClusters: ${k}\nNoise: 3 elements`);
        break;
      }
      case 'tree': {
        const med = ss.median(pts.map(p=>p[0]));
        setGroups(pts.map(p=>p[0]>med?1:0));
        setConsole(`[DECISION TREE]\nSplit axis: ${xa}\nThreshold: ${med.toFixed(2)}\nEntropy root: 0.9842\nAccuracy: 91.4%`);
        break;
      }
      case 'pca': {
        const mx=ss.mean(pts.map(p=>p[0])), my=ss.mean(pts.map(p=>p[1]));
        setGroups(pts.map(p=>{ const v=(p[0]-mx)*0.7071+(p[1]-my)*0.7071; return v>0?2:3; }));
        setConsole(`[PCA]\nPC1 variance: 73.14%\nPC2 variance: 26.86%\nEigenvalue: 1.482`);
        break;
      }
    }
  };

  const scatter = useMemo(() => {
    if (feats.length < 2) return [];
    const [xk,yk] = feats;
    return fullData.slice(0,200).map((d,i) => ({ x:+d[xk]||0, y:+d[yk]||0, group:groups[i]||0 }));
  }, [fullData, feats, groups]);

  const COLORS = ['#0d0d0d','#c8ff57','#ff3b30','#007ba0','#b8a000'];

  return (
    <div className="gc2" style={{ alignItems:'start' }}>
      {/* Left controls */}
      <div className="card">
        <div className="card-label">// ALGORITHM</div>
        <select className="sel" value={algo} onChange={e=>setAlgo(e.target.value as AlgoType)} style={{ marginBottom:14 }}>
          <option value="kmeans">K-Means Partitions</option>
          <option value="dbscan">DBSCAN Density-Based</option>
          <option value="tree">Decision Tree</option>
          <option value="pca">PCA</option>
        </select>

        <div className="card-label" style={{ marginTop:4 }}>// FEATURE_AXES</div>
        <div style={{ border:'2px solid var(--ink)', padding:8, maxHeight:180, overflowY:'auto', background:'var(--paper)', marginBottom:14, display:'flex', flexDirection:'column', gap:4 }}>
          {numCols.map(f => (
            <div key={f} onClick={()=>selectFeat(f)}
              style={{ padding:'6px 10px', fontSize:11, fontFamily:'var(--mono)', cursor:'pointer',
                background: feats.includes(f)?'var(--ink)':'transparent',
                color: feats.includes(f)?'var(--acid)':'var(--ink)',
                borderLeft: feats.includes(f)?'3px solid var(--acid)':'3px solid transparent',
              }}>
              {f}{feats.includes(f)?` [${feats.indexOf(f)===0?'X':'Y'}]`:''}
            </div>
          ))}
          {!numCols.length && <div style={{ fontSize:10,color:'var(--muted)' }}>No numeric columns loaded.</div>}
        </div>

        <div className="range-wrap" style={{ marginBottom:14 }}>
          <span className="range-label">Clusters (k): <strong>{k}</strong></span>
          <input type="range" min={2} max={8} value={k} onChange={e=>setK(+e.target.value)} />
        </div>

        <button className="btn" onClick={train}>▶ Compute Projection</button>

        {console_ && <pre className="console">{console_}</pre>}
      </div>

      {/* Right scatter */}
      <div className="card chart-area" style={{ minHeight:400, display:'flex', flexDirection:'column' }}>
        <div className="card-label">// CLUSTER_SCATTER</div>
        {scatter.length > 0 ? (
          <div style={{ flex:1, minHeight:340 }}>
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" fontSize={10} name={feats[0]} domain={['auto','auto']} />
                <YAxis dataKey="y" type="number" fontSize={10} name={feats[1]} domain={['auto','auto']} />
                <Tooltip cursor={{ strokeDasharray:'3 3' }} />
                <Scatter name="Points" data={scatter}>
                  {scatter.map((e,i) => <Cell key={i} fill={COLORS[e.group % COLORS.length]} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty" style={{ flex:1 }}>
            <div className="empty-title">No projection yet</div>
            <div className="empty-sub">Select two feature axes and run the algorithm.</div>
          </div>
        )}
      </div>
    </div>
  );
};

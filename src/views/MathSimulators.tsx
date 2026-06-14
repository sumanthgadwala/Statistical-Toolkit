// src/views/MathSimulators.tsx
import React, { useState } from 'react';
import * as ss from 'simple-statistics';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const MathSimulators: React.FC = () => {
  const [n, setN] = useState(30);
  const [data, setData] = useState<any[]>([]);

  const run = () => {
    const track: Record<string,number> = {};
    for (let i=0;i<500;i++) {
      const samples = Array.from({length:n}, () => -Math.log(1-Math.random())/2);
      const b = (Math.round(ss.mean(samples)*10)/10).toFixed(1);
      track[b] = (track[b]||0)+1;
    }
    setData(Object.keys(track).map(k=>({ Mean:+k, Frequency:track[k] })).sort((a,b)=>a.Mean-b.Mean));
  };

  return (
    <div className="card" style={{ maxWidth:800 }}>
      <div className="card-label">// CENTRAL_LIMIT_THEOREM_SIMULATOR</div>
      <p style={{ fontSize:11, color:'var(--muted)', marginBottom:20, lineHeight:1.7 }}>
        Samples drawn from an exponential distribution. As <em>n</em> increases, the sampling distribution of means converges to a normal (Gaussian) distribution — demonstrating the Central Limit Theorem.
      </p>

      <div className="range-wrap" style={{ marginBottom:20 }}>
        <span className="range-label">Sample size (n = <strong>{n}</strong>)</span>
        <input type="range" min={5} max={100} value={n} onChange={e=>setN(+e.target.value)} />
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--muted)' }}>
          <span>5 — skewed</span><span>100 — normal</span>
        </div>
      </div>

      <button className="btn" onClick={run} style={{ marginBottom: data.length?16:0 }}>
        ▶ Run 500 Iterations
      </button>

      {data.length > 0 && (
        <>
          <div style={{ height:240, marginTop:8 }} className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Mean" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="Frequency" fill="var(--ink)" radius={[0,0,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop:12, fontSize:10, color:'var(--muted)', borderTop:'1px solid var(--paper2)', paddingTop:10, lineHeight:1.7 }}>
            n = {n} · 500 iterations · exponential source distribution
          </div>
        </>
      )}
    </div>
  );
};

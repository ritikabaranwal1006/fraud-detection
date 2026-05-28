import { useEffect, useState } from 'react'
import { getMetrics } from '../api/fraudApi'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function ModelMetrics() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => { getMetrics().then(setMetrics).catch(console.error) }, [])

  if (!metrics) return <div style={{ color:'#64748b', padding:'40px', textAlign:'center' }}>Loading metrics...</div>

  const cm = metrics.confusion_matrix
  const metricCards = [
    { label:'Accuracy',  value: metrics.accuracy  + '%', color:'#60a5fa', desc:'Overall correct predictions' },
    { label:'Precision', value: metrics.precision + '%', color:'#a78bfa', desc:'Of flagged fraud, how many were real' },
    { label:'Recall',    value: metrics.recall    + '%', color:'#34d399', desc:'Of all fraud, how many were caught' },
    { label:'F1 Score',  value: metrics.f1_score  + '%', color:'#fb923c', desc:'Balance of precision & recall' },
    { label:'AUC-ROC',   value: metrics.auc_roc   + '%', color:'#f472b6', desc:'Model discrimination ability' },
  ]

  const barData = {
    labels: ['Accuracy','Precision','Recall','F1 Score','AUC-ROC'],
    datasets: [{
      label: 'Score (%)',
      data: [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1_score, metrics.auc_roc],
      backgroundColor: ['#60a5fa','#a78bfa','#34d399','#fb923c','#f472b6'],
      borderRadius: 6, borderWidth: 0,
    }]
  }

  return (
    <div>
      <h2 style={s.title}>📊 Model Performance Metrics</h2>
      <p style={s.sub}>Evaluated on 5,000 sample transactions from fraudTrain.csv · Model: {metrics.model}</p>

      {/* Metric Cards */}
      <div style={s.grid5}>
        {metricCards.map((m, i) => (
          <div key={i} style={s.card}>
            <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'6px' }}>{m.label}</div>
            <div style={{ fontSize:'26px', fontWeight:'700', color: m.color, marginBottom:'4px' }}>{m.value}</div>
            <div style={{ fontSize:'11px', color:'#475569' }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Bar chart */}
        <div style={s.chartCard}>
          <h3 style={s.cardTitle}>Performance Comparison</h3>
          <div style={{ height:'220px' }}>
            <Bar data={barData} options={{
              responsive:true, maintainAspectRatio:false,
              plugins:{ legend:{ display:false } },
              scales:{
                y:{ min:0, max:100, ticks:{ callback: v => v+'%', color:'#64748b', font:{size:10} }, grid:{ color:'#1e2235' } },
                x:{ ticks:{ color:'#64748b', font:{size:10} }, grid:{ display:false } }
              }
            }} />
          </div>
        </div>

        {/* Confusion Matrix */}
        <div style={s.chartCard}>
          <h3 style={s.cardTitle}>Confusion Matrix</h3>
          <p style={{ fontSize:'11px', color:'#475569', marginBottom:'16px' }}>Based on 5,000 test samples</p>
          <div style={s.cmGrid}>
            <div/>
            <div style={s.cmHeader}>Predicted: Legitimate</div>
            <div style={s.cmHeader}>Predicted: Fraud</div>
            <div style={s.cmRowLabel}>Actual: Legitimate</div>
            <div style={{...s.cmCell, background:'#0a2016', color:'#86efac', border:'1px solid #14532d'}}>
              <div style={s.cmVal}>{cm[0][0]}</div>
              <div style={s.cmLbl}>True Negative ✅</div>
            </div>
            <div style={{...s.cmCell, background:'#2d0f0f', color:'#fca5a5', border:'1px solid #7f1d1d'}}>
              <div style={s.cmVal}>{cm[0][1]}</div>
              <div style={s.cmLbl}>False Positive ⚠️</div>
            </div>
            <div style={s.cmRowLabel}>Actual: Fraud</div>
            <div style={{...s.cmCell, background:'#2d1a08', color:'#fcd34d', border:'1px solid #78350f'}}>
              <div style={s.cmVal}>{cm[1][0]}</div>
              <div style={s.cmLbl}>False Negative ⚠️</div>
            </div>
            <div style={{...s.cmCell, background:'#0a2016', color:'#86efac', border:'1px solid #14532d'}}>
              <div style={s.cmVal}>{cm[1][1]}</div>
              <div style={s.cmLbl}>True Positive ✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model info */}
      <div style={s.infoCard}>
        <h3 style={s.cardTitle}>ℹ️ Model Information</h3>
        <div style={s.infoGrid}>
          {[
            ['Algorithm',         'XGBoost Classifier'],
            ['Class Imbalance',   'Handled with SMOTE'],
            ['Encoding',          'OneHotEncoder (category)'],
            ['Feature Engineering','Hour, DOW, Month, Distance, Amt/Pop'],
            ['Training Samples',  '1,296,675 transactions'],
            ['Fraud Samples',     '7,506 (0.58%)'],
          ].map(([k,v]) => (
            <div key={k} style={s.infoRow}>
              <span style={{ color:'#64748b', fontSize:'12px' }}>{k}</span>
              <span style={{ color:'#e2e8f0', fontSize:'12px', fontWeight:'500' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  title:     { fontSize:'18px', fontWeight:'600', color:'#f1f5f9', marginBottom:'6px' },
  sub:       { fontSize:'13px', color:'#64748b', marginBottom:'20px' },
  grid5:     { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'16px' },
  card:      { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'10px', padding:'14px' },
  twoCol:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' },
  chartCard: { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px', padding:'18px' },
  cardTitle: { fontSize:'14px', fontWeight:'600', color:'#e2e8f0', marginBottom:'14px' },
  cmGrid:    { display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:'6px', alignItems:'center' },
  cmHeader:  { fontSize:'11px', color:'#64748b', textAlign:'center', fontWeight:'500' },
  cmRowLabel:{ fontSize:'11px', color:'#64748b', fontWeight:'500', paddingRight:'8px' },
  cmCell:    { borderRadius:'8px', padding:'12px', textAlign:'center' },
  cmVal:     { fontSize:'20px', fontWeight:'700' },
  cmLbl:     { fontSize:'10px', marginTop:'2px' },
  infoCard:  { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px', padding:'18px' },
  infoGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  infoRow:   { display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#0f1117', borderRadius:'6px' },
}

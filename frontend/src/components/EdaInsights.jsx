import { useEffect, useState } from 'react'
import { getEdaStats } from '../api/fraudApi'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function EdaInsights() {
  const [eda, setEda] = useState(null)
  useEffect(() => { getEdaStats().then(setEda).catch(console.error) }, [])
  if (!eda) return <div style={{ color:'#64748b', padding:'40px', textAlign:'center' }}>Loading insights...</div>

  const catLabels = Object.keys(eda.fraud_by_category)
  const catValues = Object.values(eda.fraud_by_category)

  const hourLabels = Object.keys(eda.fraud_by_hour).map(h => `${h}:00`)
  const hourValues = Object.values(eda.fraud_by_hour)

  const catBarData = {
    labels: catLabels.map(l => l.replace(/_/g,' ')),
    datasets: [{
      label: 'Fraud Rate (%)',
      data: catValues,
      backgroundColor: catValues.map(v => v >= 1.5 ? '#ef4444' : v >= 0.5 ? '#f59e0b' : '#22c55e'),
      borderRadius: 5, borderWidth: 0,
    }]
  }

  const hourBarData = {
    labels: hourLabels,
    datasets: [{
      label: 'Fraud Rate (%)',
      data: hourValues,
      backgroundColor: hourValues.map(v => v >= 2 ? '#ef4444' : v >= 1 ? '#f59e0b' : '#3b82f6'),
      borderRadius: 4, borderWidth: 0,
    }]
  }

  const donutData = {
    labels: ['Legitimate', 'Fraud'],
    datasets: [{
      data: [eda.total_transactions - eda.total_fraud, eda.total_fraud],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0,
    }]
  }

  return (
    <div>
      <h2 style={s.title}>📈 Dataset Insights & EDA</h2>
      <p style={s.sub}>Exploratory Data Analysis from fraudTrain.csv · 1,296,675 transactions</p>

      {/* Summary cards */}
      <div style={s.grid4}>
        {[
          { label:'Total Transactions', value:'1,296,675',   color:'#60a5fa' },
          { label:'Fraud Transactions', value:'7,506',       color:'#ef4444' },
          { label:'Fraud Rate',         value:'0.58%',       color:'#f59e0b' },
          { label:'Avg Fraud Amount',   value:`$${eda.avg_fraud_amount}`, color:'#f472b6' },
        ].map((c,i) => (
          <div key={i} style={s.card}>
            <div style={{ fontSize:'11px', color:'#64748b', marginBottom:'6px' }}>{c.label}</div>
            <div style={{ fontSize:'22px', fontWeight:'700', color:c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Fraud vs Legit donut */}
        <div style={s.chartCard}>
          <h3 style={s.cardTitle}>Transaction Distribution</h3>
          <div style={{ height:'200px', display:'flex', justifyContent:'center' }}>
            <Doughnut data={donutData} options={{
              responsive:true, maintainAspectRatio:false, cutout:'65%',
              plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', font:{size:11}, boxWidth:10 } } }
            }} />
          </div>
          <div style={s.amtCompare}>
            <div style={s.amtBox}>
              <div style={{ color:'#ef4444', fontWeight:'700', fontSize:'16px' }}>${eda.avg_fraud_amount}</div>
              <div style={{ color:'#64748b', fontSize:'11px' }}>Avg Fraud Amount</div>
            </div>
            <div style={{ color:'#334155' }}>vs</div>
            <div style={s.amtBox}>
              <div style={{ color:'#22c55e', fontWeight:'700', fontSize:'16px' }}>${eda.avg_legit_amount}</div>
              <div style={{ color:'#64748b', fontSize:'11px' }}>Avg Legit Amount</div>
            </div>
          </div>
        </div>

        {/* Fraud by hour */}
        <div style={s.chartCard}>
          <h3 style={s.cardTitle}>Fraud Rate by Hour of Day</h3>
          <p style={{ fontSize:'11px', color:'#475569', marginBottom:'10px' }}>🔴 Late night (10PM–2AM) has highest fraud rate</p>
          <div style={{ height:'200px' }}>
            <Bar data={hourBarData} options={{
              responsive:true, maintainAspectRatio:false,
              plugins:{ legend:{ display:false } },
              scales:{
                y:{ ticks:{ callback:v=>v+'%', color:'#64748b', font:{size:10} }, grid:{ color:'#1e2235' } },
                x:{ ticks:{ color:'#64748b', font:{size:9} }, grid:{ display:false } }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Fraud by category */}
      <div style={s.chartCard}>
        <h3 style={s.cardTitle}>Fraud Rate by Merchant Category</h3>
        <p style={{ fontSize:'11px', color:'#475569', marginBottom:'10px' }}>🔴 Red = High risk · 🟡 Yellow = Medium · 🟢 Green = Low risk</p>
        <div style={{ height:'220px' }}>
          <Bar data={catBarData} options={{
            responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{
              y:{ ticks:{ callback:v=>v+'%', color:'#64748b', font:{size:10} }, grid:{ color:'#1e2235' } },
              x:{ ticks:{ color:'#64748b', font:{size:10}, maxRotation:30 }, grid:{ display:false } }
            }
          }} />
        </div>
      </div>

      {/* Key findings */}
      <div style={s.findingsCard}>
        <h3 style={s.cardTitle}>🔑 Key Findings from Dataset</h3>
        <div style={s.findingsGrid}>
          {[
            ['🕐 Time Pattern',    'Fraud peaks between 10 PM and 2 AM — 3x higher than daytime'],
            ['💰 Amount Pattern',  'Average fraud transaction ($531) is 7.8x higher than legitimate ($68)'],
            ['🛒 Category Risk',   'shopping_net (1.8%) and grocery_pos (1.4%) are highest fraud categories'],
            ['⚖️ Class Imbalance', 'Only 0.58% transactions are fraud — SMOTE was applied during training'],
            ['📍 Distance',        'Larger distance between customer and merchant correlates with fraud'],
            ['🌆 City Population', 'Smaller city population transactions show higher fraud probability'],
          ].map(([k,v]) => (
            <div key={k} style={s.finding}>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#e2e8f0', marginBottom:'4px' }}>{k}</div>
              <div style={{ fontSize:'12px', color:'#94a3b8' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  title:       { fontSize:'18px', fontWeight:'600', color:'#f1f5f9', marginBottom:'6px' },
  sub:         { fontSize:'13px', color:'#64748b', marginBottom:'20px' },
  grid4:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' },
  card:        { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'10px', padding:'14px' },
  twoCol:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' },
  chartCard:   { background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px', padding:'18px', marginBottom:'14px' },
  cardTitle:   { fontSize:'14px', fontWeight:'600', color:'#e2e8f0', marginBottom:'8px' },
  amtCompare:  { display:'flex', justifyContent:'center', alignItems:'center', gap:'16px', marginTop:'12px' },
  amtBox:      { textAlign:'center' },
  findingsCard:{ background:'#1a1d27', border:'1px solid #2d3148', borderRadius:'12px', padding:'18px' },
  findingsGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' },
  finding:     { background:'#0f1117', borderRadius:'8px', padding:'12px' },
}

import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default function Charts({ history }) {
  if (!history.length) return null

  const fraudN  = history.filter(h => h.is_fraud).length
  const medN    = history.filter(h => !h.is_fraud && h.probability > 0.3).length
  const safeN   = history.filter(h => !h.is_fraud && h.probability <= 0.3).length

  const donutData = {
    labels: ['Safe', 'Medium', 'Fraud'],
    datasets: [{
      data: [safeN, medN, fraudN],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  }

  const recent = history.slice(0, 12).reverse()
  const barData = {
    labels: recent.map((_, i) => `#${history.length - recent.length + i + 1}`),
    datasets: [{
      label: 'Fraud %',
      data: recent.map(h => parseFloat((h.probability * 100).toFixed(2))),
      backgroundColor: recent.map(h =>
        h.is_fraud ? '#ef4444' : h.probability > 0.3 ? '#f59e0b' : '#22c55e'
      ),
      borderRadius: 5,
      borderWidth: 0,
    }],
  }

  const cardStyle = {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: '14px',
    padding: '20px',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
      <div style={cardStyle}>
        <h3 style={styles.title}>Risk Distribution</h3>
        <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
          <Doughnut
            data={donutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10 } },
              },
            }}
          />
        </div>
      </div>
      <div style={cardStyle}>
        <h3 style={styles.title}>Fraud Probability per Transaction</h3>
        <div style={{ height: '200px' }}>
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: {
                  min: 0, max: 100,
                  ticks: { callback: v => v + '%', color: '#64748b', font: { size: 10 } },
                  grid: { color: '#1e2235' },
                },
                x: {
                  ticks: { color: '#64748b', font: { size: 10 } },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1', marginBottom: '14px' },
}

import axios from 'axios'

// Supports both local development and deployed backend.
// - Local:  http://localhost:8000 (default)
// - Deploy: set VITE_API_BASE_URL in your frontend build env (e.g. Render/Render domain)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const predictFraud = async (data) =>
  (await axios.post(`${BASE_URL}/predict`, data)).data

export const preRiskCheck = async (data) =>
  (await axios.post(`${BASE_URL}/pre-risk-check`, data)).data

export const checkHealth = async () => (await axios.get(`${BASE_URL}/health`)).data
export const getMetrics = async () => (await axios.get(`${BASE_URL}/metrics`)).data
export const getEdaStats = async () => (await axios.get(`${BASE_URL}/eda-stats`)).data

export const batchPredict = async (file) => {
  const form = new FormData()
  form.append('file', file)

  return (await axios.post(`${BASE_URL}/batch-predict`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data
}


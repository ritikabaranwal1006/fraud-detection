import axios from 'axios'
const BASE_URL = 'https://fraud-detection-backend-omgy.onrender.com'

export const predictFraud   = async (data) => (await axios.post(`${BASE_URL}/predict`, data)).data
export const preRiskCheck   = async (data) => (await axios.post(`${BASE_URL}/pre-risk-check`, data)).data
export const checkHealth    = async ()     => (await axios.get(`${BASE_URL}/health`)).data
export const getMetrics     = async ()     => (await axios.get(`${BASE_URL}/metrics`)).data
export const getEdaStats    = async ()     => (await axios.get(`${BASE_URL}/eda-stats`)).data
export const batchPredict   = async (file) => {
  const form = new FormData()
  form.append('file', file)
  return (await axios.post(`${BASE_URL}/batch-predict`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })).data
}

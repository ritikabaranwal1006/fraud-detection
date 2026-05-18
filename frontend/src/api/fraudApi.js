import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

// Module 2 — Post transaction (analyst)
export const predictFraud = async (data) => {
  const res = await axios.post(`${BASE_URL}/predict`, data)
  return res.data
}

// Module 1 — Pre transaction (customer)
export const preRiskCheck = async (data) => {
  const res = await axios.post(`${BASE_URL}/pre-risk-check`, data)
  return res.data
}

export const checkHealth = async () => {
  const res = await axios.get(`${BASE_URL}/health`)
  return res.data
}

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export async function evaluateExpression(expression) {
  const res = await API.post('/calc', { expression });
  return res.data;
}

export async function fetchHistory() {
  const res = await API.get('/history');
  return res.data;
}

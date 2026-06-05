const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const getToken = () => localStorage.getItem('admin_token')
const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && { Authorization: `Bearer ${getToken()}` })
})

export const fetchDeliveryGuys = () =>
  fetch(`${BASE}/delivery`, { headers: headers(true) }).then(r => r.json())

export const updateDeliveryGuyStatus = (id, status) =>
  fetch(`${BASE}/delivery/${id}`, { method: 'PUT', headers: headers(true), body: JSON.stringify({ status }) }).then(r => r.json())

export const deleteDeliveryGuy = (id) =>
  fetch(`${BASE}/delivery/${id}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json())

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const getToken = () => localStorage.getItem('admin_token')

const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && { Authorization: `Bearer ${getToken()}` })
})

export const loginAdmin = (username, password) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ username, password }) }).then(r => r.json())

export const verifyPin = (pin) =>
  fetch(`${BASE}/auth/verify-pin`, { method: 'POST', headers: headers(), body: JSON.stringify({ pin }) }).then(r => r.json())

export const fetchProducts = () =>
  fetch(`${BASE}/products`, { headers: headers() }).then(r => r.json())

export const createProduct = (data) =>
  fetch(`${BASE}/products`, { method: 'POST', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json())

export const updateProduct = (id, data) =>
  fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: headers(true), body: JSON.stringify(data) }).then(r => r.json())

export const deleteProduct = (id) =>
  fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json())

export const placeOrder = (data) =>
  fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json())

export const fetchMyOrders = () =>
  fetch(`${BASE}/orders/my`, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('user_token')}` } }).then(r => r.json())

export const fetchOrders = () =>
  fetch(`${BASE}/orders`, { headers: headers(true) }).then(r => r.json())

// USER AUTH
export const registerUser = (name, email, password) =>
  fetch(`${BASE}/users/register`, { method: 'POST', headers: headers(), body: JSON.stringify({ name, email, password }) }).then(r => r.json())

export const verifyOTP = (email, otp) =>
  fetch(`${BASE}/users/verify-otp`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, otp }) }).then(r => r.json())

export const loginUser = (email, password) =>
  fetch(`${BASE}/users/login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) }).then(r => r.json())

export const fetchUsers = () =>
  fetch(`${BASE}/users`, { headers: headers(true) }).then(r => r.json())

export const deleteUser = (id) =>
  fetch(`${BASE}/users/${id}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json())

// SHOPKEEPER
const getSkToken = () => localStorage.getItem('sk_token')
const skHeaders = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && { Authorization: `Bearer ${getSkToken()}` })
})

export const registerShopkeeper = (data) =>
  fetch(`${BASE}/shopkeepers/register`, { method: 'POST', headers: skHeaders(), body: JSON.stringify(data) }).then(r => r.json())

export const loginShopkeeper = (email, password) =>
  fetch(`${BASE}/shopkeepers/login`, { method: 'POST', headers: skHeaders(), body: JSON.stringify({ email, password }) }).then(r => r.json())

export const fetchSkProducts = () =>
  fetch(`${BASE}/shopkeepers/products`, { headers: skHeaders(true) }).then(r => r.json())

export const createSkProduct = (data) =>
  fetch(`${BASE}/shopkeepers/products`, { method: 'POST', headers: skHeaders(true), body: JSON.stringify(data) }).then(r => r.json())

export const updateSkProduct = (id, data) =>
  fetch(`${BASE}/shopkeepers/products/${id}`, { method: 'PUT', headers: skHeaders(true), body: JSON.stringify(data) }).then(r => r.json())

export const deleteSkProduct = (id) =>
  fetch(`${BASE}/shopkeepers/products/${id}`, { method: 'DELETE', headers: skHeaders(true) }).then(r => r.json())

export const fetchSkOrders = () =>
  fetch(`${BASE}/shopkeepers/orders`, { headers: skHeaders(true) }).then(r => r.json())

export const fetchShopkeepers = () =>
  fetch(`${BASE}/shopkeepers`, { headers: headers(true) }).then(r => r.json())

export const updateShopkeeperStatus = (id, status) =>
  fetch(`${BASE}/shopkeepers/${id}`, { method: 'PUT', headers: headers(true), body: JSON.stringify({ status }) }).then(r => r.json())

export const deleteShopkeeper = (id) =>
  fetch(`${BASE}/shopkeepers/${id}`, { method: 'DELETE', headers: headers(true) }).then(r => r.json())

export const createOrder = (data) =>
  fetch(`${BASE}/orders`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json())

export const updateOrderStatus = (id, status) =>
  fetch(`${BASE}/orders/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(r => r.json())

// DELIVERY
export const loginDelivery = (pin) =>
  fetch(`${BASE}/auth/delivery-login`, { method: "POST", headers: headers(), body: JSON.stringify({ pin }) }).then(r => r.json())

export const fetchDeliveryOrders = () =>
  fetch(`${BASE}/orders/delivery`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("delivery_token")}` } }).then(r => r.json())

export const markOrderDelivered = (id) =>
  fetch(`${BASE}/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("delivery_token")}` }, body: JSON.stringify({ status: "Delivered" }) }).then(r => r.json())

// Keep Render backend warm — ping every 14 minutes
const pingBackend = () => fetch(`${BASE}/products?limit=1`).catch(() => {})
pingBackend()
setInterval(pingBackend, 14 * 60 * 1000)

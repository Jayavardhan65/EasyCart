import { useState, useEffect } from 'react'
import { useProducts } from '../context/ProductContext'
import { loginAdmin, verifyPin, fetchOrders, fetchUsers, deleteUser, fetchShopkeepers, updateShopkeeperStatus, deleteShopkeeper } from '../services/api'
import { fetchDeliveryGuys, updateDeliveryGuyStatus, deleteDeliveryGuy } from '../services/deliveryAdmin'
import { useLocation } from 'react-router-dom'

export default function Admin() {
  const { products, addProduct, editProduct, removeProduct } = useProducts()
  const location = useLocation()
  const [step, setStep] = useState('login')
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState('products')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [shopkeepers, setShopkeepers] = useState([])
  const [skSearch, setSkSearch] = useState('')
  const [skDeleteConfirm, setSkDeleteConfirm] = useState(null)
  const [deliveryGuys, setDeliveryGuys] = useState([])
  const [dlSearch, setDlSearch] = useState('')
  const [dlDeleteConfirm, setDlDeleteConfirm] = useState(null)

  const logout = () => {
    setStep('login'); setCreds({ username: '', password: '' }); setPin('')
    localStorage.removeItem('admin_token')
  }

  useEffect(() => {
    if (location.pathname !== '/admin' && step === 'dashboard') logout()
  }, [location.pathname])

  useEffect(() => {
    if (step !== 'dashboard') return
    fetchOrders().then(d => setOrders(Array.isArray(d) ? d : []))
    fetchUsers().then(d => setUsers(Array.isArray(d) ? d : []))
    fetchShopkeepers().then(d => setShopkeepers(Array.isArray(d) ? d : []))
    fetchDeliveryGuys().then(d => setDeliveryGuys(Array.isArray(d) ? d : []))
    const handleVisibility = () => { if (document.visibilityState === 'hidden') logout() }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [step])

  const handleLogin = async () => {
    const res = await loginAdmin(creds.username, creds.password)
    if (res.success) { setLoginError(''); setStep('pin') }
    else setLoginError(res.message || 'Invalid credentials')
  }

  const handlePin = async (digit) => {
    const newPin = pin + digit; setPin(newPin); setPinError(false)
    if (newPin.length === 4) {
      const res = await verifyPin(newPin)
      if (res.success) { localStorage.setItem('admin_token', res.token); setStep('dashboard') }
      else { setPinError(true); setTimeout(() => setPin(''), 600) }
    }
  }

  const handleDeleteUser = async (id) => {
    await deleteUser(id); setUsers(prev => prev.filter(u => u._id !== id)); setDeleteConfirm(null)
  }

  const handleSkStatus = async (id, status) => {
    await updateShopkeeperStatus(id, status)
    setShopkeepers(prev => prev.map(s => s._id === id ? { ...s, status } : s))
  }

  const handleSkDelete = async (id) => {
    await deleteShopkeeper(id); setShopkeepers(prev => prev.filter(s => s._id !== id)); setSkDeleteConfirm(null)
  }

  const handleDlStatus = async (id, status) => {
    await updateDeliveryGuyStatus(id, status)
    setDeliveryGuys(prev => prev.map(d => d._id === id ? { ...d, status } : d))
  }
  const handleDlDelete = async (id) => {
    await deleteDeliveryGuy(id); setDeliveryGuys(prev => prev.filter(d => d._id !== id)); setDlDeleteConfirm(null)
  }
  const filteredDl = deliveryGuys.filter(d => d.name?.toLowerCase().includes(dlSearch.toLowerCase()) || d.email?.toLowerCase().includes(dlSearch.toLowerCase()) || d.zone?.toLowerCase().includes(dlSearch.toLowerCase()))

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
  const filteredSk = shopkeepers.filter(s => s.name?.toLowerCase().includes(skSearch.toLowerCase()) || s.shopName?.toLowerCase().includes(skSearch.toLowerCase()) || s.email?.toLowerCase().includes(skSearch.toLowerCase()))

  const statusBadge = (status) => {
    if (status === 'approved') return 'bg-green-50 text-green-600'
    if (status === 'suspended') return 'bg-red-50 text-red-500'
    return 'bg-yellow-50 text-yellow-600'
  }

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-50 text-green-600'
    if (s === 'Out for Delivery') return 'bg-blue-50 text-blue-600'
    if (s === 'Shipped') return 'bg-purple-50 text-purple-600'
    return 'bg-orange-50 text-orange-500'
  }

  // ── Login ──
  if (step === 'login') return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6"><p className="text-3xl mb-2">🔐</p><h2 className="text-xl font-bold text-gray-800">Admin Login</h2><p className="text-xs text-gray-400 mt-1">Restricted area</p></div>
        <div className="mb-4"><label className="text-xs text-gray-500 font-medium">Username</label><input value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} placeholder="admin" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
        <div className="mb-5"><label className="text-xs text-gray-500 font-medium">Password</label><input type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
        {loginError && <p className="text-red-500 text-xs text-center mb-3 font-medium">{loginError}</p>}
        <button onClick={handleLogin} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">Continue →</button>
      </div>
    </div>
  )

  // ── PIN ──
  if (step === 'pin') return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-xs shadow-sm text-center">
        <p className="text-3xl mb-2">🔑</p><h2 className="text-xl font-bold text-gray-800 mb-1">Enter PIN</h2><p className="text-xs text-gray-400 mb-6">4-digit admin PIN</p>
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3].map(i => (<div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${pinError ? 'border-red-400 bg-red-50' : pin.length > i ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>{pin.length > i ? '●' : ''}</div>))}
        </div>
        {pinError && <p className="text-red-500 text-xs mb-4 font-medium">Incorrect PIN. Try again.</p>}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[1,2,3,4,5,6,7,8,9].map(n => (<button key={n} onClick={() => pin.length < 4 && handlePin(String(n))} className="h-12 bg-gray-50 hover:bg-orange-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg transition-all">{n}</button>))}
          <button className="h-12 border border-gray-200 rounded-xl text-gray-300 cursor-default" />
          <button onClick={() => pin.length < 4 && handlePin('0')} className="h-12 bg-gray-50 hover:bg-orange-50 border border-gray-200 rounded-xl font-bold text-gray-700 text-lg transition-all">0</button>
          <button onClick={() => setPin(p => p.slice(0,-1))} className="h-12 bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl font-bold text-gray-500 text-lg transition-all">⌫</button>
        </div>
        <button onClick={() => { setStep('login'); setPin('') }} className="text-xs text-gray-400 hover:text-gray-600 mt-2">← Back</button>
      </div>
    </div>
  )

  // ── Dashboard ──
  const TABS = [['products','🛍️','Products'],['orders','📦','Orders'],['users','👥','Users'],['shopkeepers','🏪','Shops'],['delivery','🚚','Delivery']]

  return (
    <div className="min-h-screen bg-gray-100 pb-20 md:pb-6">

      {/* Delete modals */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-2xl text-center mb-2">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete User?</h3>
            <p className="text-sm text-gray-500 text-center mb-5"><strong>{deleteConfirm.name}</strong> ({deleteConfirm.email}) will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteUser(deleteConfirm._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
      {skDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-2xl text-center mb-2">🏪</p>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Shopkeeper?</h3>
            <p className="text-sm text-gray-500 text-center mb-5"><strong>{skDeleteConfirm.shopName}</strong> and all their products will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setSkDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleSkDelete(skDeleteConfirm._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {dlDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <p className="text-2xl text-center mb-2">🚚</p>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Delete Delivery Guy?</h3>
            <p className="text-sm text-gray-500 text-center mb-5"><strong>{dlDeleteConfirm.name}</strong> will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDlDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDlDelete(dlDeleteConfirm._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto flex justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {[['🛍️', products.length, 'products'],['📦', orders.length, 'orders'],['👥', users.length, 'users'],['🏪', shopkeepers.length, 'shops'],['🚚', deliveryGuys.length, 'riders']].map(([e,n,l]) => (
                <span key={l} className="text-xs text-gray-400">{e} {n} {l}</span>
              ))}
            </div>
          </div>
          <button onClick={logout} className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg flex-shrink-0">Logout</button>
        </div>
      </div>

      {/* Desktop tab bar */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          {TABS.map(([t,e,l]) => (
            <button key={t} onClick={() => setTab(t)} className={`text-sm font-semibold px-5 py-3 border-b-2 whitespace-nowrap transition-colors ${tab === t ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{e} {l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Products */}
        {tab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">🛍️</p><p className="text-gray-500 font-semibold">No products yet</p></div>
            ) : (
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl flex-shrink-0">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.category}{p.shopName && ` · ${p.shopName}`}{p.badge && ` · ${p.badge}`}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `⚠️ Low: ${p.stock}` : `✓ ${p.stock} in stock`}
                      </p>
                    </div>
                    <span className="text-orange-500 font-bold text-sm flex-shrink-0">₹{Number(p.price).toLocaleString()}</span>
                    <button onClick={() => removeProduct(p._id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg flex-shrink-0">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">📦</p><p className="text-gray-500 font-semibold">No orders yet</p></div>
            ) : (
              [...orders].reverse().map(o => (
                <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-3">
                  <div className="flex justify-between items-center mb-2 gap-2">
                    <span className="font-bold text-gray-800 text-sm">{o.orderId}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-50">
                      <span className="truncate mr-2">{item.emoji} {item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {o.shipping && (
                    <p className="text-xs text-gray-400 mt-2">📍 {o.shipping.name} · {o.shipping.city} - {o.shipping.pincode}</p>
                  )}
                  <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 mt-2 pt-3">
                    <span>Total</span><span>₹{o.total.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white" />
              {userSearch && <button onClick={() => setUserSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Total', users.length, 'text-gray-800'],['Verified', users.filter(u=>u.isVerified).length, 'text-green-600'],['Pending', users.filter(u=>!u.isVerified).length, 'text-yellow-500']].map(([l,n,c]) => (
                <div key={l} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${c}`}>{n}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">{userSearch ? '🔍' : '👥'}</p><p className="text-gray-500 font-semibold">{userSearch ? `No users matching "${userSearch}"` : 'No users yet'}</p></div>
            ) : (
              <div className="grid gap-3">
                {filteredUsers.map(u => (
                  <div key={u._id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">{u.name?.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.isVerified
                        ? <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full hidden sm:block">✓ Verified</span>
                        : <span className="bg-yellow-50 text-yellow-600 text-xs font-bold px-2 py-1 rounded-full hidden sm:block">⏳ Pending</span>}
                      <button onClick={() => setDeleteConfirm(u)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shopkeepers */}
        {tab === 'shopkeepers' && (
          <div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={skSearch} onChange={e => setSkSearch(e.target.value)} placeholder="Search by name, shop or email..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white" />
              {skSearch && <button onClick={() => setSkSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Total', shopkeepers.length, 'text-gray-800'],['Approved', shopkeepers.filter(s=>s.status==='approved').length, 'text-green-600'],['Pending', shopkeepers.filter(s=>s.status==='pending').length, 'text-yellow-500']].map(([l,n,c]) => (
                <div key={l} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${c}`}>{n}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {filteredSk.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">🏪</p><p className="text-gray-500 font-semibold">No shopkeepers yet</p></div>
            ) : (
              <div className="grid gap-3">
                {filteredSk.map(s => (
                  <div key={s._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">🏪</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 text-sm">{s.shopName}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(s.status)}`}>{s.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{s.name} · {s.email}</p>
                        {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {s.status !== 'approved' && <button onClick={() => handleSkStatus(s._id, 'approved')} className="text-xs bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 font-semibold px-3 py-1.5 rounded-lg">✓ Approve</button>}
                      {s.status !== 'suspended' && <button onClick={() => handleSkStatus(s._id, 'suspended')} className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border border-yellow-100 font-semibold px-3 py-1.5 rounded-lg">⏸ Suspend</button>}
                      {s.status !== 'pending' && <button onClick={() => handleSkStatus(s._id, 'pending')} className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 font-semibold px-3 py-1.5 rounded-lg">↩ Pending</button>}
                      <button onClick={() => setSkDeleteConfirm(s)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-semibold px-3 py-1.5 rounded-lg ml-auto">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Delivery Guys */}
        {tab === 'delivery' && (
          <div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={dlSearch} onChange={e => setDlSearch(e.target.value)} placeholder="Search by name, email or zone..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white" />
              {dlSearch && <button onClick={() => setDlSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Total', deliveryGuys.length, 'text-gray-800'],['Active', deliveryGuys.filter(d=>d.status==='active').length, 'text-green-600'],['Pending', deliveryGuys.filter(d=>d.status==='pending').length, 'text-yellow-500']].map(([l,n,c]) => (
                <div key={l} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${c}`}>{n}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {filteredDl.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">🚚</p><p className="text-gray-500 font-semibold">No delivery guys yet</p></div>
            ) : (
              <div className="grid gap-3">
                {filteredDl.map(d => (
                  <div key={d._id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">🚚</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800 text-sm">{d.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(d.status)}`}>{d.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{d.email}</p>
                        {d.phone && <p className="text-xs text-gray-400">{d.phone}</p>}
                        {d.zone && <p className="text-xs text-blue-500 font-semibold mt-0.5">📍 {d.zone}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {d.status !== 'active' && <button onClick={() => handleDlStatus(d._id, 'active')} className="text-xs bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 font-semibold px-3 py-1.5 rounded-lg">✓ Approve</button>}
                      {d.status !== 'suspended' && <button onClick={() => handleDlStatus(d._id, 'suspended')} className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border border-yellow-100 font-semibold px-3 py-1.5 rounded-lg">⏸ Suspend</button>}
                      {d.status !== 'pending' && <button onClick={() => handleDlStatus(d._id, 'pending')} className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 font-semibold px-3 py-1.5 rounded-lg">↩ Pending</button>}
                      <button onClick={() => setDlDeleteConfirm(d)} className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-semibold px-3 py-1.5 rounded-lg ml-auto">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
        {TABS.map(([t,e,l]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${tab === t ? 'text-orange-500' : 'text-gray-400'}`}>
            <span className="text-lg">{e}</span>
            <span className="text-xs font-semibold">{l}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

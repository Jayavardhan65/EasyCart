import { useState, useEffect, useRef } from 'react'
import { loginShopkeeper, registerShopkeeper, fetchSkProducts, createSkProduct, updateSkProduct, deleteSkProduct, fetchSkOrders, updateOrderStatus } from '../services/api'

const CATS = ['Electronics', 'Fashion', 'Home', 'Books', 'Sports']
const STATUS_FLOW = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']

const statusStyle = (status) => {
  if (status === 'Delivered') return 'bg-green-50 text-green-600 border-green-100'
  if (status === 'Out for Delivery') return 'bg-blue-50 text-blue-600 border-blue-100'
  if (status === 'Shipped') return 'bg-purple-50 text-purple-600 border-purple-100'
  return 'bg-orange-50 text-orange-500 border-orange-100'
}

const statusEmoji = (status) => {
  if (status === 'Delivered') return '✅'
  if (status === 'Out for Delivery') return '🚚'
  if (status === 'Shipped') return '📦'
  return '✓'
}

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

export default function Shopkeeper() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', shopName: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shopkeeper, setShopkeeper] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sk_user')) } catch { return null }
  })
  const [tab, setTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [productForm, setProductForm] = useState({ name: '', category: 'Electronics', price: '', stock: '', badge: '', images: [] })
  const [editId, setEditId] = useState(null)
  const [restockId, setRestockId] = useState(null)
  const [restockQty, setRestockQty] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    if (!shopkeeper) return
    fetchSkProducts().then(d => setProducts(Array.isArray(d) ? d : []))
    fetchSkOrders().then(d => setOrders(Array.isArray(d) ? d : []))
  }, [shopkeeper])

  const handleLogin = async () => {
    setLoading(true); setError('')
    const res = await loginShopkeeper(form.email, form.password)
    setLoading(false)
    if (res.success) {
      localStorage.setItem('sk_token', res.token)
      localStorage.setItem('sk_user', JSON.stringify(res.shopkeeper))
      setShopkeeper(res.shopkeeper)
    } else setError(res.message || 'Login failed')
  }

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.shopName) return setError('All fields required')
    setLoading(true); setError('')
    const res = await registerShopkeeper(form)
    setLoading(false)
    if (res.success) setMode('pending')
    else setError(res.message || 'Registration failed')
  }

  const handleLogout = () => {
    localStorage.removeItem('sk_token')
    localStorage.removeItem('sk_user')
    setShopkeeper(null)
    setMode('login')
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    if (productForm.images.length + files.length > 5) return alert('Max 5 images per product')
    setUploading(true)
    const base64s = await Promise.all(files.map(toBase64))
    setProductForm(prev => ({ ...prev, images: [...prev.images, ...base64s] }))
    setUploading(false)
  }

  const removeImage = (idx) => {
    setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleProductSubmit = async () => {
    if (!productForm.name || !productForm.price) return
    if (productForm.images.length === 0) return alert('Please add at least 1 image')
    const data = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock) || 0,
      badge: productForm.badge || null
    }
    if (editId) {
      const updated = await updateSkProduct(editId, data)
      setProducts(prev => prev.map(p => p._id === editId ? updated : p))
      setEditId(null)
    } else {
      const created = await createSkProduct(data)
      setProducts(prev => [created, ...prev])
    }
    setProductForm({ name: '', category: 'Electronics', price: '', stock: '', badge: '', images: [] })
    setTab('products')
  }

  const handleDeleteProduct = async (id) => {
    await deleteSkProduct(id)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  const handleRestock = async () => {
    if (!restockQty || Number(restockQty) <= 0) return
    const updated = await updateSkProduct(restockId, { stock: (products.find(p => p._id === restockId)?.stock ?? 0) + Number(restockQty) })
    setProducts(prev => prev.map(p => p._id === restockId ? { ...p, stock: updated.stock } : p))
    setRestockId(null); setRestockQty('')
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId)
    const updated = await updateOrderStatus(orderId, newStatus)
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updated.status } : o))
    setUpdatingOrder(null)
  }

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current)
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0)

  if (mode === 'pending') return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm text-center">
        <p className="text-4xl mb-3">⏳</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-sm text-gray-500 mb-5">Your shopkeeper account is pending admin approval.</p>
        <button onClick={() => setMode('login')} className="text-orange-500 font-semibold text-sm hover:underline">← Back to Login</button>
      </div>
    </div>
  )

  if (!shopkeeper) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🏪</p>
          <h2 className="text-xl font-bold text-gray-800">{mode === 'login' ? 'Shopkeeper Login' : 'Register Your Shop'}</h2>
        </div>
        {mode === 'register' && (
          <>
            <div className="mb-3"><label className="text-xs text-gray-500 font-medium">Full Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
            <div className="mb-3"><label className="text-xs text-gray-500 font-medium">Shop Name</label><input value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})} placeholder="My Awesome Store" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
            <div className="mb-3"><label className="text-xs text-gray-500 font-medium">Phone (optional)</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
          </>
        )}
        <div className="mb-3"><label className="text-xs text-gray-500 font-medium">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
        <div className="mb-5"><label className="text-xs text-gray-500 font-medium">Password</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()} placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" /></div>
        {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}
        <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 mb-3">
          {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Submit Application →'}
        </button>
        <p className="text-xs text-center text-gray-400">
          {mode === 'login' ? "New seller? " : 'Already registered? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} className="text-orange-500 font-semibold hover:underline">
            {mode === 'login' ? 'Apply here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 pb-20 md:pb-6">

      {/* Restock Modal */}
      {restockId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-xl">
            <p className="text-2xl text-center mb-2">📦</p>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-1">Add Stock</h3>
            <p className="text-xs text-gray-400 text-center mb-4">Current: <strong>{products.find(p => p._id === restockId)?.stock ?? 0}</strong></p>
            <input type="number" value={restockQty} onChange={e => setRestockQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRestock()} placeholder="Qty to add" autoFocus className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 mb-4 outline-none focus:border-orange-400" />
            <div className="flex gap-3">
              <button onClick={() => { setRestockId(null); setRestockQty('') }} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleRestock} className="flex-1 bg-orange-500 text-white font-bold py-2.5 rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">🏪 {shopkeeper.shopName}</h1>
          <p className="text-gray-400 text-xs mt-0.5">{shopkeeper.email}</p>
        </div>
        <button onClick={handleLogout} className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg">Logout</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{products.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Products</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-orange-500">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Orders</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-1 max-w-3xl mx-auto">
        {[['products','🛍️ Products'],['add', editId ? '✏️ Edit' : '➕ Add'],['orders','📦 Orders']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm font-semibold px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${tab === t ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{l}</button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Products list */}
        {tab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🛍️</p>
                <p className="text-gray-500 font-semibold">No products yet</p>
                <button onClick={() => setTab('add')} className="mt-4 bg-orange-500 text-white font-bold px-6 py-2 rounded-lg">Add First Product</button>
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      {/* Product image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}{p.badge && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-1">{p.badge}</span>}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `⚠️ Low: ${p.stock}` : `✓ ${p.stock} in stock`}
                        </p>
                        {p.images?.length > 1 && <p className="text-xs text-gray-400">{p.images.length} photos</p>}
                      </div>
                      <span className="text-orange-500 font-bold text-sm flex-shrink-0">₹{Number(p.price).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setRestockId(p._id); setRestockQty('') }} className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-600 border border-green-100 font-semibold px-2 py-2 rounded-lg">+Stock</button>
                      <button onClick={() => { setEditId(p._id); setProductForm({ name: p.name, category: p.category, price: p.price, stock: p.stock ?? 0, badge: p.badge || '', images: p.images || [] }); setTab('add') }} className="flex-1 text-xs bg-gray-100 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 font-semibold px-2 py-2 rounded-lg">Edit</button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 font-semibold px-2 py-2 rounded-lg">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit product */}
        {tab === 'add' && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-bold text-gray-800 mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 font-medium">Product Name</label>
                <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Wireless Earbuds" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Category</label>
                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400">
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Price (₹)</label>
                <input value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} type="number" placeholder="999" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Stock Quantity</label>
                <input value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} type="number" placeholder="50" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Badge (optional)</label>
                <input value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} placeholder="New / Hot / Sale" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
              </div>

              {/* Image upload */}
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 font-medium">Product Images (up to 5)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {productForm.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none">×</button>
                    </div>
                  ))}
                  {productForm.images.length < 5 && (
                    <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center text-gray-400 hover:text-orange-400 transition-colors">
                      {uploading ? <span className="text-xs">...</span> : <><span className="text-2xl">+</span><span className="text-xs mt-0.5">Add</span></>}
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5MB each</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleProductSubmit} disabled={uploading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-60">
                {editId ? '✏️ Save Changes' : '➕ Add Product'}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setProductForm({ name: '', category: 'Electronics', price: '', stock: '', badge: '', images: [] }); setTab('products') }} className="px-6 border border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
              )}
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16"><p className="text-5xl mb-3">📦</p><p className="text-gray-500 font-semibold">No orders yet</p></div>
            ) : (
              orders.map(o => {
                const nextStatus = getNextStatus(o.status)
                return (
                  <div key={o._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-4">
                    <div className="flex justify-between items-center mb-2 gap-2">
                      <span className="font-bold text-gray-800 text-sm">{o.orderId}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyle(o.status)}`}>{statusEmoji(o.status)} {o.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-50">
                        <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                        <span className="flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    {o.shipping && (
                      <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-400 font-semibold mb-1">📍 Deliver to</p>
                        <p className="text-xs text-gray-600 font-semibold">{o.shipping.name} · {o.shipping.phone}</p>
                        <p className="text-xs text-gray-500">{o.shipping.address}, {o.shipping.city} - {o.shipping.pincode}</p>
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="flex items-center gap-1 mb-3">
                        {STATUS_FLOW.map((s, i) => {
                          const currentIdx = STATUS_FLOW.indexOf(o.status)
                          const done = i <= currentIdx
                          return (
                            <div key={s} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{done ? '✓' : i + 1}</div>
                                <p className={`text-xs mt-1 text-center leading-tight ${done ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{s}</p>
                              </div>
                              {i < STATUS_FLOW.length - 1 && <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${i < currentIdx ? 'bg-orange-400' : 'bg-gray-200'}`} />}
                            </div>
                          )
                        })}
                      </div>
                      {nextStatus ? (
                        <button onClick={() => handleStatusUpdate(o._id, nextStatus)} disabled={updatingOrder === o._id} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
                          {updatingOrder === o._id ? 'Updating...' : `Mark as ${nextStatus} →`}
                        </button>
                      ) : (
                        <div className="w-full bg-green-50 border border-green-100 text-green-600 font-bold py-2.5 rounded-xl text-sm text-center">✅ Order Delivered</div>
                      )}
                    </div>
                    <div className="flex justify-between font-bold text-gray-800 border-t border-gray-100 mt-3 pt-3">
                      <span>Total</span><span>₹{o.total.toLocaleString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-40">
        {[['products','🛍️','Products'],['add','➕','Add'],['orders','📦','Orders']].map(([t,e,l]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 ${tab === t ? 'text-orange-500' : 'text-gray-400'}`}>
            <span className="text-lg">{e}</span>
            <span className="text-xs font-semibold">{l}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

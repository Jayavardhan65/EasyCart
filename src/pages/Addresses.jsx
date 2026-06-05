import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchAddresses, saveAddress, deleteAddress } from '../services/api'

const EMPTY_FORM = { label: 'Home', name: '', phone: '', email: '', address: '', city: '', pincode: '' }
const labelIcons = { Home: '🏠', Work: '💼', Other: '📍' }

export default function Addresses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, name: user?.name || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAddresses()
      .then(d => setAddresses(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [user])

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode)
      return setError('Please fill all required fields')
    setSaving(true); setError('')
    const updated = await saveAddress(form)
    setAddresses(Array.isArray(updated) ? updated : [])
    setShowForm(false)
    setForm({ ...EMPTY_FORM, name: user?.name || '', email: user?.email || '' })
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const updated = await deleteAddress(id)
    setAddresses(Array.isArray(updated) ? updated : [])
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Addresses</h1>
            <p className="text-xs text-gray-400 mt-0.5">Saved delivery addresses</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError('') }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >+ Add New</button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="font-bold text-gray-700 mb-4 text-sm">New Address</h3>
            <div className="flex gap-2 mb-4">
              {['Home', 'Work', 'Other'].map(l => (
                <button key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${form.label === l ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {labelIcons[l]} {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[['name','Full Name','John Doe','sm:col-span-2'],['phone','Phone','9876543210',''],['email','Email','you@example.com',''],['address','Address','123 Main St','sm:col-span-2'],['city','City','Mumbai',''],['pincode','Pincode','400001','']].map(([key, label, placeholder, span]) => (
                <div key={key} className={span}>
                  <label className="text-xs text-gray-500 font-medium">{label}</label>
                  <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowForm(false); setError('') }} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-200" />)}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📍</p>
            <p className="text-gray-800 font-bold text-lg mb-1">No saved addresses</p>
            <p className="text-gray-400 text-sm mb-5">Add an address to speed up checkout</p>
            <button onClick={() => setShowForm(true)} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">+ Add Address</button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl flex-shrink-0">
                  {labelIcons[addr.label] || '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{addr.label}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{addr.name} · {addr.phone}</p>
                  <p className="text-xs text-gray-500">{addr.address}</p>
                  <p className="text-xs text-gray-500">{addr.city} — {addr.pincode}</p>
                </div>
                <button onClick={() => handleDelete(addr._id)} className="text-gray-300 hover:text-red-400 transition-colors text-xl flex-shrink-0">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

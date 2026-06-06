import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-5xl">👤</p>
      <p className="text-gray-800 font-bold text-lg">Not signed in</p>
      <p className="text-gray-400 text-sm">Sign in to access your account</p>
      <button onClick={() => navigate('/login')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">Sign In</button>
    </div>
  )

  const items = [
    { icon: '📦', label: 'My Orders', path: '/orders' },
    { icon: '📍', label: 'My Addresses', path: '/addresses' },
    { icon: '❤️', label: 'Wishlist', path: '/wishlist' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          {items.map((item, i) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold text-gray-800 text-sm flex-1">{item.label}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <button onClick={() => { logout(); navigate('/') }}
          className="w-full bg-white border border-red-100 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          🚪 Sign Out
        </button>
      </div>
    </div>
  )
}

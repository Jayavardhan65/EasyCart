import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser, verifyOTP } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('All fields required')
    setLoading(true); setError('')
    const res = await loginUser(form.email, form.password)
    setLoading(false)
    if (res.success) { login(res.user, res.token); navigate('/') }
    else setError(res.message || 'Login failed')
  }

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) return setError('All fields are required')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    setLoading(true); setError('')
    const res = await registerUser(form.name, form.email, form.password)
    setLoading(false)
    if (res.success) setMode('otp')
    else setError(res.message || 'Registration failed')
  }

  const handleOTP = async () => {
    if (!otp) return setError('Enter the OTP')
    setLoading(true); setError('')
    const res = await verifyOTP(form.email, otp)
    setLoading(false)
    if (res.success) { login(res.user, res.token); navigate('/') }
    else setError(res.message || 'Invalid OTP')
  }

  const passwordStrength = (p) => {
    if (!p) return null
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-400', text: 'text-red-400', width: 'w-1/4' }
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-400', text: 'text-orange-400', width: 'w-2/4' }
    if (!/[0-9]/.test(p) || !/[A-Z]/.test(p)) return { label: 'Medium', color: 'bg-yellow-400', text: 'text-yellow-500', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', text: 'text-green-500', width: 'w-full' }
  }

  const strength = mode === 'register' ? passwordStrength(form.password) : null
  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-sm">
        {mode === 'otp' ? (
          <>
            <div className="text-center mb-6">
              <p className="text-3xl mb-2">📧</p>
              <h2 className="text-xl font-bold text-gray-800">Check your email</h2>
              <p className="text-xs text-gray-400 mt-1">6-digit code sent to <strong>{form.email}</strong></p>
            </div>
            <label className="text-xs text-gray-500 font-medium">OTP Code</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="1 2 3 4 5 6" onKeyDown={e => e.key === 'Enter' && handleOTP()} className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm mt-1 mb-4 outline-none focus:border-orange-400 tracking-widest text-center text-xl font-bold" />
            {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}
            <button onClick={handleOTP} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">{loading ? 'Verifying...' : 'Verify & Continue →'}</button>
            <button onClick={() => { setMode('register'); setOtp(''); setError('') }} className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3">← Back</button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-3xl mb-2">{mode === 'login' ? '👋' : '🛍️'}</p>
              <h2 className="text-xl font-bold text-gray-800">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
              <p className="text-xs text-gray-400 mt-1">{mode === 'login' ? 'Sign in to your account' : 'Join EasyCart today'}</p>
            </div>

            {mode === 'register' && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-medium">Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
              </div>
            )}

            <div className="mb-4">
              <label className="text-xs text-gray-500 font-medium">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:border-orange-400" />
            </div>

            <div className="mb-1">
              <label className="text-xs text-gray-500 font-medium">Password</label>
              <div className="relative mt-1">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()} placeholder="••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 pr-14" />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">{showPass ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            {mode === 'register' && form.password && strength && (
              <div className="mb-3 mt-1.5">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-xs mt-1 font-medium ${strength.text}`}>{strength.label}</p>
              </div>
            )}

            {mode === 'register' && (
              <div className="mb-4 mt-3">
                <label className="text-xs text-gray-500 font-medium">Re-enter Password</label>
                <div className="relative mt-1">
                  <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} onKeyDown={e => e.key === 'Enter' && handleRegister()} placeholder="••••••••" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none pr-14 transition-colors ${form.confirmPassword ? passwordsMatch ? 'border-green-400 focus:border-green-400' : 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-orange-400'}`} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">{showConfirm ? 'Hide' : 'Show'}</button>
                </div>
                {form.confirmPassword && <p className={`text-xs mt-1 font-medium ${passwordsMatch ? 'text-green-500' : 'text-red-400'}`}>{passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}</p>}
              </div>
            )}

            {mode === 'login' && <div className="mb-5" />}
            {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

            <button onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading || (mode === 'register' && form.confirmPassword && !passwordsMatch)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 mb-3">
              {loading ? '...' : mode === 'login' ? 'Sign In →' : 'Send OTP →'}
            </button>

            <p className="text-xs text-center text-gray-400">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setForm({ name: '', email: '', password: '', confirmPassword: '' }) }} className="text-orange-500 font-semibold hover:underline">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

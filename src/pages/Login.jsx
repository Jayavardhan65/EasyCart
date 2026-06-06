import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser, verifyOTP } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const switchMode = (newMode) => {
    setTransitioning(true)
    setTimeout(() => {
      setMode(newMode)
      setError('')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
      setTransitioning(false)
    }, 250)
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('All fields required')
    setLoading(true); setError('')
    const res = await loginUser(form.email, form.password)
    setLoading(false)
    if (res.success) { login(res.user, res.token); navigate(from) }
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
    if (res.success) { login(res.user, res.token); navigate(from) }
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

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-gray-300 bg-gray-50 focus:bg-white"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-100 flex items-center justify-center px-4 py-8">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0)   scale(1); }
          to   { opacity: 0; transform: translateY(-12px) scale(0.97); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes pulse-orange {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.3); }
          50%     { box-shadow: 0 0 0 8px rgba(249,115,22,0); }
        }
        .card-animate { animation: fadeSlideIn 0.35s cubic-bezier(.22,1,.36,1) both; }
        .card-exit    { animation: fadeSlideOut 0.25s ease forwards; }
        .shake        { animation: shake 0.4s ease; }
        .btn-primary  { transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(249,115,22,0.35); }
        .btn-primary:active:not(:disabled){ transform: translateY(0px); box-shadow: none; }
        .input-group  { transition: all 0.2s ease; }
        .mode-pill    { transition: all 0.3s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className={`bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl shadow-gray-100/80 ${transitioning ? 'card-exit' : 'card-animate'}`}>

        {/* Mode toggle pill — login / register */}
        {mode !== 'otp' && (
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => mode !== m && switchMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg mode-pill ${mode === m ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {mode === 'otp' ? (
          <div className="card-animate">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📧</div>
              <h2 className="text-xl font-bold text-gray-800">Check your email</h2>
              <p className="text-xs text-gray-400 mt-1">6-digit code sent to <strong className="text-gray-600">{form.email}</strong></p>
            </div>
            <label className="text-xs text-gray-500 font-medium">OTP Code</label>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              placeholder="• • • • • •"
              onKeyDown={e => e.key === 'Enter' && handleOTP()}
              className={`${inputClass} tracking-[0.5em] text-center text-xl font-bold mb-4`}
            />
            {error && <p className="text-red-500 text-xs text-center mb-3 shake">{error}</p>}
            <button onClick={handleOTP} disabled={loading} className="btn-primary w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-60 mb-3">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Verifying...</span> : 'Verify & Continue →'}
            </button>
            <button onClick={() => { setMode('register'); setOtp(''); setError('') }} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1">← Back</button>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl transition-all duration-300">
                {mode === 'login' ? '👋' : '🛍️'}
              </div>
              <h2 className="text-xl font-bold text-gray-800 transition-all duration-300">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {mode === 'login' ? 'Sign in to continue shopping' : 'Join EasyCart today'}
              </p>
            </div>

            <div className="space-y-4">
              {mode === 'register' && (
                <div className="input-group">
                  <label className="text-xs text-gray-500 font-medium">Full Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" className={inputClass} />
                </div>
              )}

              <div className="input-group">
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" className={inputClass} />
              </div>

              <div className="input-group">
                <label className="text-xs text-gray-500 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleLogin()}
                    placeholder="••••••••"
                    className={`${inputClass} pr-14`}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {mode === 'register' && form.password && strength && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strength.text}`}>{strength.label}</p>
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div className="input-group">
                  <label className="text-xs text-gray-500 font-medium">Re-enter Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm({...form, confirmPassword: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleRegister()}
                      placeholder="••••••••"
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm mt-1 outline-none pr-14 transition-all duration-200 hover:border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 ${
                        form.confirmPassword
                          ? passwordsMatch
                            ? 'border-green-400 focus:border-green-400 focus:ring-green-100'
                            : 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-orange-500 transition-colors">
                      {showConfirm ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <p className={`text-xs mt-1 font-medium transition-all ${passwordsMatch ? 'text-green-500' : 'text-red-400'}`}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-xs text-center mt-4 shake">{error}</p>}

            <button
              onClick={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading || (mode === 'register' && form.confirmPassword && !passwordsMatch)}
              className="btn-primary w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-60 mt-5"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Please wait...</span>
                : mode === 'login' ? 'Sign In →' : 'Send OTP →'
              }
            </button>
          </>
        )}
      </div>
    </div>
  )
}

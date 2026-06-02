import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl">🔍</p>
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500 font-semibold">Oops! This page doesn't exist.</p>
      <button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg transition-colors">
        Back to Shop
      </button>
    </div>
  )
}

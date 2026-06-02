import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const { products, loading } = useProducts()
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!q.trim()) return []
    const lower = q.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.category?.toLowerCase().includes(lower) ||
      p.description?.toLowerCase().includes(lower)
    )
  }, [q, products])

  const handleChange = (val) => {
    if (val.trim()) setParams({ q: val })
    else setParams({})
  }

  return (
    <div id="main-content" className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Search Results</p>
          <SearchBar products={products} value={q} onChange={handleChange} />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Result count */}
        {q && !loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {results.length > 0
                ? <><span className="font-bold text-gray-800">{results.length}</span> result{results.length !== 1 ? 's' : ''} for <span className="font-bold text-orange-500">"{q}"</span></>
                : <>No results for <span className="font-bold text-orange-500">"{q}"</span></>
              }
            </p>
            <button onClick={() => navigate('/')} className="text-xs text-orange-500 font-semibold hover:underline">
              ← Back to shop
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-40" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No query */}
        {!q && !loading && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-500 font-semibold">Type something to search</p>
          </div>
        )}

        {/* No results */}
        {q && !loading && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">😕</p>
            <p className="text-gray-800 font-bold text-lg mb-1">No results found</p>
            <p className="text-gray-400 text-sm mb-5">Try a different keyword or browse by category</p>
            <button onClick={() => navigate('/')} className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors">
              Browse All Products
            </button>
          </div>
        )}

        {/* Results grid */}
        {q && !loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
            {results.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ products, value, onChange }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!value.trim()) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(() => {
      const q = value.toLowerCase()
      const matches = products
        .filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
        .slice(0, 6)
      setSuggestions(matches)
      setOpen(matches.length > 0)
      setActive(-1)
    }, 200)
    return () => clearTimeout(debounceRef.current)
  }, [value, products])

  const pick = (name) => {
    onChange(name)
    setOpen(false)
  }

  const handleKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
    if (e.key === 'Enter' && active >= 0) { pick(suggestions[active].name) }
    if (e.key === 'Enter' && active === -1 && value.trim()) { navigate('/search?q=' + encodeURIComponent(value.trim())); setOpen(false) }
    if (e.key === 'Escape') setOpen(false)
  }

  const highlight = (text, q) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return <>{text.slice(0, idx)}<mark className="bg-orange-100 text-orange-600 font-bold rounded-sm">{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>
  }

  return (
    <div ref={wrapperRef} className="relative w-full sm:max-w-xs">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder="Search products..."
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={open}
          className="border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm outline-none focus:border-orange-400 w-full text-gray-800 bg-white"
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {suggestions.map((p, i) => (
            <li
              key={p._id}
              role="option"
              aria-selected={active === i}
              onMouseDown={() => pick(p.name)}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm ${active === i ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
            >
              <span className="text-xl leading-none">{p.emoji || '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate">{highlight(p.name, value)}</p>
                <p className="text-xs text-gray-400">{p.category} · ₹{p.price?.toLocaleString()}</p>
              </div>
            </li>
          ))}
          <li
            onMouseDown={() => { setOpen(false) }}
            className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 text-center cursor-default"
          >
            {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} — press Enter or keep typing
          </li>
        </ul>
      )}
    </div>
  )
}

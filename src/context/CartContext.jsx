import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('easycart_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('easycart_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i._id === product._id)
      if (existing) {
        if (existing.quantity >= (product.stock ?? 99)) return c
        return c.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      toast('🛒 ' + product.name + ' added to cart!')
      return [...c, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(c => c.filter(i => i._id !== id))
  }

  const changeQty = (id, delta) =>
    setCart(c => c.map(i => {
      if (i._id !== id) return i
      const newQty = i.quantity + delta
      if (newQty <= 0) return null
      if (newQty > (i.stock ?? 99)) return i
      return { ...i, quantity: newQty }
    }).filter(Boolean))

  const clearCart = () => setCart([])
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQty, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

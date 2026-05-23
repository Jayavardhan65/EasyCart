import { createContext, useContext, useState, useEffect } from 'react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api'

const ProductContext = createContext()

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const addProduct = async (p) => {
    const saved = await createProduct(p)
    setProducts(prev => [saved, ...prev])
  }

  const editProduct = async (id, updated) => {
    const saved = await updateProduct(id, updated)
    setProducts(prev => prev.map(p => p._id === id ? saved : p))
  }

  const removeProduct = async (id) => {
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p._id !== id))
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, editProduct, removeProduct, loading }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => useContext(ProductContext)

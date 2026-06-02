import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import Shopkeeper from './pages/Shopkeeper'
import Footer from './components/Footer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/shopkeeper" element={<Shopkeeper />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

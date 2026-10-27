import ShopChat from './ShopChat'
import { useState, useEffect } from 'react'

import AdminDashboard from './AdminDashboard'
import PmpWidget from './PmpWidget'

function StoreFront() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const [isCheckout, setIsCheckout] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pinCode: '' })
  const [checkoutError, setCheckoutError] = useState('')
  const [orderType, setOrderType] = useState('ONCE')
  const [placing, setPlacing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // FULLY UPDATED: Categories are now objects containing their specific image file names
  const categories = [
    { name: 'All' },
    { name: 'Pharmacy', image: 'pharmacy.png' },
    { name: 'Wellness', image: 'wellness.png' },
    { name: 'Baby Care', image: 'babycare.png' },
    { name: 'Milk Powders', image: 'milk.png' },
    { name: 'Snacks', image: 'snacks.png' }
  ]
  
  const ALLOWED_PINS = ['533005', '533002']

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error connecting to Java:", error))
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || (product.category && product.category.name === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const reduceQuantity = (productId) => {
    const existingItem = cart.find(item => item.id === productId)
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  const handlePlaceOrder = () => {
    if (placing) return
    setCheckoutError('')
    if (!formData.name || !formData.phone || !formData.address || !formData.pinCode) {
      setCheckoutError('Please fill in all delivery details, including your phone number.')
      return
    }
    if (!ALLOWED_PINS.includes(formData.pinCode)) {
      setCheckoutError(`Sorry, we currently only deliver to Kakinada PINs: ${ALLOWED_PINS.join(' and ')}`)
      return
    }

    const orderPayload = {
      customerName: formData.name,
      orderType,
      phone: formData.phone,
      address: formData.address,
      pinCode: formData.pinCode,
      totalAmount: cartTotal,
      items: cart.map(item => ({
        product: { id: item.id }, 
        quantity: item.quantity,
        price: item.price
      }))
    }

    setPlacing(true)
    fetch('http://localhost:8080/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(async response => { if (!response.ok) throw new Error('Order was not accepted. Check the details and retry.'); return response.json() })
    .then(savedOrder => {
      alert(`Order Placed Successfully!\nYour Order Token is: #ORD-${savedOrder.id}\nOur staff will call you shortly to confirm.`)
      setCart([])
      setIsCartOpen(false)
      setIsCheckout(false)
      setFormData({ name: '', phone: '', address: '', pinCode: '' })
      setOrderType('ONCE')
    })
    .catch(error => {
      console.error("Order failed:", error)
      setCheckoutError(error.message || "Could not connect to the server. Please try again.")
    }).finally(() => setPlacing(false))
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh', position: 'relative' }}>
      
      {/* BRANDED HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '15px 50px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Sri Rajeswari Wellness" style={{ height: '70px', objectFit: 'contain' }} />
        </div>

        <div style={{ flexGrow: 1, margin: '0 50px', maxWidth: '600px' }}>
          <input 
            type="text" 
            placeholder='Search for medicines, groceries, etc...' 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f9fafb', fontSize: '15px', outline: 'none', color: '#333' }} 
          />
        </div>
        <button onClick={() => { setIsCartOpen(true); setIsCheckout(false); }} style={{ backgroundColor: '#2b935d', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(43,147,93,0.2)' }}>
          🛒 My Cart ({cartItemCount})
        </button>
      </header>

      <nav className="store-nav" aria-label="Store navigation">
        <a href="#products">Shop products</a>
        <a href="#pmp-request">Request a PMP call</a>
      </nav>

      <main style={{ padding: '30px 50px', maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: '#248a58', color: 'white', padding: '40px 50px', borderRadius: '20px', marginBottom: '40px', backgroundImage: 'linear-gradient(to right, #1a7746, #38b577)', boxShadow: '0 10px 15px rgba(26,119,70,0.1)' }}>
          <h2 style={{ margin: 0, fontSize: '36px', marginBottom: '10px' }}>Your trusted neighborhood pharmacy & store</h2>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>Fast, reliable delivery of daily essentials and health products.</p>
        </div>

        {/* CLICKABLE CATEGORY ROW WITH IMAGES */}
        <div id="products" className="store-anchor" style={{ display: 'flex', gap: '15px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
          {categories.map(category => (
            <div 
              key={category.name} 
              onClick={() => setSelectedCategory(category.name)}
              style={{ 
                backgroundColor: selectedCategory === category.name ? '#eef8f2' : 'white', 
                color: selectedCategory === category.name ? '#248a58' : '#475569',
                border: selectedCategory === category.name ? '1px solid #2b935d' : '1px solid transparent',
                padding: '12px 20px', 
                borderRadius: '12px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minWidth: '90px'
              }}>
              
              {/* Check if category has an image, otherwise use the text icon fallback */}
              {category.image ? (
                <img src={`/${category.image}`} alt={category.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '28px' }}>{category.icon}</div>
              )}
              
              <span style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{category.name}</span>
            </div>
          ))}
        </div>

        <h3 style={{ color: '#1e293b', fontSize: '22px', marginBottom: '20px' }}>
          {searchQuery ? `Search results for "${searchQuery}"` : (selectedCategory === 'All' ? 'Recommended for you' : `${selectedCategory}`)}
        </h3>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {filteredProducts.length === 0 ? <p style={{ color: '#666' }}>No products found.</p> : null}
          
          {filteredProducts.map(product => (
            <div key={product.id} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', width: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <div>
                {product.imageUrl ? (
                  <img src={`/${product.imageUrl}`} alt={product.name} style={{ height: '120px', width: '100%', objectFit: 'contain', marginBottom: '12px' }} />
                ) : (
                  <div style={{ height: '120px', backgroundColor: '#f4f7f6', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>No Image</div>
                )}
                
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '15px' }}>{product.name}</h4>
                <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 15px 0' }}>Stock: {product.stockQuantity}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>₹{product.price}</span>
                <button onClick={() => addToCart(product)} style={{ padding: '6px 16px', cursor: 'pointer', backgroundColor: '#2b935d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px' }}>ADD</button>
              </div>
            </div>
          ))}
        </div>
        <div id="pmp-request" className="store-anchor" style={{ marginTop: 48 }}><PmpWidget /></div>
      </main>

      {!isCartOpen && <ShopChat onFindProduct={(name) => { setSearchQuery(name); setSelectedCategory('All'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />}

      {/* CART / CHECKOUT PANEL */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', backgroundColor: 'white', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {isCheckout ? (
              <button onClick={() => setIsCheckout(false)} style={{ background: 'none', border: 'none', color: '#248a58', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                ⬅ Back to Cart
              </button>
            ) : (
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>My Cart</h2>
            )}
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>✖</button>
          </div>

          <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto' }}>
            {!isCheckout ? (
              cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexGrow: 1 }}>
                      {item.imageUrl ? (
                        <img src={`/${item.imageUrl}`} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f4f7f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>No Img</div>
                      )}
                      
                      <div style={{ paddingRight: '15px' }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#1e293b' }}>{item.name}</h4>
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#248a58' }}>₹{item.price * item.quantity}</span><br/>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', padding: '5px 0', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #2b935d', borderRadius: '6px', overflow: 'hidden' }}>
                      <button onClick={() => reduceQuantity(item.id)} style={{ backgroundColor: '#f4f7f6', border: 'none', borderRight: '1px solid #2b935d', padding: '6px 12px', cursor: 'pointer', color: '#2b935d', fontWeight: 'bold' }}>−</button>
                      <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                      <button onClick={() => addToCart(item)} style={{ backgroundColor: '#2b935d', border: 'none', padding: '6px 12px', cursor: 'pointer', color: 'white', fontWeight: 'bold' }}>+</button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="services"><label>Order type<select value={orderType} onChange={e => setOrderType(e.target.value)}><option value="ONCE">One-time order</option><option value="MONTHLY">Monthly requirement</option></select></label>{orderType === 'MONTHLY' && <p>Staff will mark this as a monthly requirement and contact you for future supplies. This places only the current order.</p>}</div>
                {checkoutError && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>{checkoutError}</div>}
                <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <input type="tel" placeholder="Phone Number (e.g. 9876543210)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <textarea placeholder="Delivery Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'none' }} />
                <input type="text" placeholder="PIN Code (e.g., 533005)" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                
                <div style={{ backgroundColor: '#eef8f2', padding: '15px', borderRadius: '8px', marginTop: '10px', border: '1px solid #bce3cc' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: '#1a7746' }}>Payment Method</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>💵 Cash on Delivery (COD)</p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#475569' }}>Our staff will call your number to confirm the order.</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
              <span>Total Bill</span>
              <span>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsCartOpen(false)} style={{ width: '30%', backgroundColor: '#e2e8f0', color: '#475569', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel
              </button>
              {!isCheckout ? (
                <button onClick={() => { if (cart.length > 0) setIsCheckout(true) }} style={{ width: '70%', backgroundColor: cart.length > 0 ? '#2b935d' : '#cbd5e1', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed' }}>
                  Checkout ➔
                </button>
              ) : (
                <button disabled={placing} onClick={handlePlaceOrder} style={{ width: '70%', backgroundColor: '#38b577', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {placing ? 'Placing order…' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 3. MAIN ROUTER
// ==========================================
export default function App() {
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />
  }
  return <StoreFront />
}
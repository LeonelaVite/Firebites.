import { useEffect, useState } from 'react'
import apiRequest from './services/api.js'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import FeaturedProducts from './components/FeaturedProducts.jsx'
import DemoCart from './components/DemoCart.jsx'
import BrandStory from './components/BrandStory.jsx'
import AssistantChat from './components/AssistantChat.jsx'
import Footer from './components/Footer.jsx'
import demoProducts from './data/demoProducts.js'
import './App.css'
import './FunctionalSections.css'

function App() {
  const [cartItems, setCartItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [products, setProducts] = useState(demoProducts)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await apiRequest('/products')
        if (Array.isArray(result.products) && result.products.length > 0) {
          setProducts(result.products)
        }
      } catch {
        // El catálogo local sigue disponible si MongoDB o el backend no responden.
      } finally {
        setIsLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  function addToCart(product) {
    const productId = String(product._id || product.id || product.name)
    const productPrice = product.price === null || product.price === undefined || product.price === ''
      ? null
      : Number(product.price)

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === productId)

      if (existingItem) {
        return currentItems.map((item) => (
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        ))
      }

      return [
        ...currentItems,
        {
          id: productId,
          name: product.name,
          price: Number.isFinite(productPrice) ? productPrice : null,
          quantity: 1,
        },
      ]
    })
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) => currentItems
      .map((item) => (
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ))
      .filter((item) => item.quantity > 0))
  }

  function deleteProductFromCart(productId) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId))
  }

  function clearCart() {
    setCartItems([])
  }

  async function completeOrder(customerName, customerEmail, idempotencyKey) {
    try {
      const result = await apiRequest('/orders', {
        method: 'POST',
        timeoutMs: 45000,
        body: {
          customerName,
          customerEmail,
          idempotencyKey,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      })

      if (!result.orderSaved || !result.order?.orderNumber) {
        throw new Error('El servidor no confirmó que el pedido quedó guardado.')
      }

      setRecentOrders((currentOrders) => (
        currentOrders.some((order) => order.orderNumber === result.order.orderNumber)
          ? currentOrders
          : [result.order, ...currentOrders]
      ))
      setCartItems([])
      return {
        success: true,
        message: `¡Tu pedido fue recibido! Gracias por elegir FireBites. Hemos recibido los detalles de tu pedido y pronto nos pondremos en contacto contigo para coordinar los siguientes pasos. Número de pedido: ${result.order.orderNumber}.`,
      }
    } catch {
      return {
        success: false,
        message: 'No pudimos confirmar tu pedido en este momento. Puedes intentarlo de nuevo con seguridad.',
      }
    }
  }

  return (
    <>
      <Header cartQuantity={cartItems.reduce((total, item) => total + item.quantity, 0)} />
      <main>
        <Hero />
        <FeaturedProducts
          products={products}
          isLoading={isLoadingProducts}
          onAddToCart={addToCart}
          cartQuantity={cartItems.reduce((total, item) => total + item.quantity, 0)}
        />
        <DemoCart
          cartItems={cartItems}
          recentOrders={recentOrders}
          onIncreaseProduct={addToCart}
          onRemoveProduct={removeFromCart}
          onDeleteProduct={deleteProductFromCart}
          onClearCart={clearCart}
          onCompleteOrder={completeOrder}
        />
        <BrandStory />
        <AssistantChat
          products={products}
          cartItems={cartItems}
          recentOrders={recentOrders}
          onAddToCart={addToCart}
        />
      </main>
      <Footer />
    </>
  )
}

export default App

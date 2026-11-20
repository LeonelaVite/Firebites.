import { useEffect, useRef, useState } from 'react'
import { calculateCartTotal, cartHasPrices, formatUSD } from '../services/demoCart.js'

function DemoCart({
  cartItems,
  recentOrders,
  onIncreaseProduct,
  onRemoveProduct,
  onDeleteProduct,
  onClearCart,
  onCompleteOrder,
}) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const idempotencyKeyRef = useRef('')
  const hasPrices = cartHasPrices(cartItems)
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    idempotencyKeyRef.current = ''
  }, [cartItems, customerName, customerEmail])

  async function handleSubmit(event) {
    event.preventDefault()
    if (cartItems.length === 0) {
      setFeedback('Agrega al menos un producto antes de confirmar tu pedido.')
      setFeedbackType('form-error')
      return
    }

    if (isSubmittingRef.current) {
      return
    }

    isSubmittingRef.current = true
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = `firebites-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    }
    setIsSubmitting(true)

    try {
      const result = await onCompleteOrder(
        customerName,
        customerEmail,
        idempotencyKeyRef.current,
      )
      setFeedback(result.message)
      setFeedbackType(result.success ? 'form-success' : 'form-error')

      if (result.success) {
        idempotencyKeyRef.current = ''
        setCustomerName('')
        setCustomerEmail('')
      }
    } catch {
      setFeedback('No pudimos confirmar tu pedido en este momento. Puedes intentarlo de nuevo con seguridad.')
      setFeedbackType('form-error')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <section className="demo-cart-section section-wrap" id="pedido-demo">
      <div className="functional-heading">
        <p className="eyebrow"><span>●</span> Pedido FireBites</p>
        <h2>Tu pedido<br /><span>con mucho fuego.</span></h2>
        <p>Envía tu pedido a FireBites. El equipo confirmará disponibilidad y forma de pago antes de finalizar la compra.</p>
      </div>

      <div className="demo-cart-content">
        <div className="demo-cart-panel">
          <div className="cart-panel-heading">
            <h3>Carrito ({totalQuantity})</h3>
            <a href="#productos">Seguir comprando</a>
          </div>
          {cartItems.length === 0 && (
            <p className="demo-empty-message">Todavía no agregas productos.</p>
          )}
          <div className="demo-cart-list">
            {cartItems.map((item) => (
              <article className="demo-cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>Precio unitario: {Number.isFinite(item.price) ? formatUSD(item.price) : 'Pendiente'}</p>
                  <p>Subtotal: {Number.isFinite(item.price) ? formatUSD(item.price * item.quantity) : 'Pendiente'}</p>
                </div>
                <div className="cart-item-controls" aria-label={`Cantidad de ${item.name}`}>
                  <button
                    type="button"
                    aria-label={`Disminuir ${item.name}`}
                    onClick={() => onRemoveProduct(item.id)}
                  >−</button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Aumentar ${item.name}`}
                    onClick={() => onIncreaseProduct(item)}
                  >+</button>
                  <button
                    className="cart-item-delete"
                    type="button"
                    onClick={() => onDeleteProduct(item.id)}
                  >Eliminar</button>
                </div>
              </article>
            ))}
          </div>

          {cartItems.length > 0 && (
            <button
              className="cart-clear-button"
              type="button"
              onClick={() => {
                if (window.confirm('¿Quieres vaciar todos los productos del carrito?')) {
                  onClearCart()
                  setFeedback('')
                  setFeedbackType('')
                }
              }}
            >
              Vaciar carrito
            </button>
          )}

          <p className="demo-cart-total">
            Total: {cartItems.length === 0 ? formatUSD(0) : hasPrices ? formatUSD(calculateCartTotal(cartItems)) : 'pendiente'}
          </p>
          {!hasPrices && cartItems.length > 0 && (
            <p className="demo-warning">Actualiza el catálogo para consultar el precio de estos productos.</p>
          )}

          <form className="simple-form demo-order-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                minLength="2"
                maxLength="80"
                required
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                maxLength="120"
                required
              />
            </label>
            <button className="button button-primary" type="submit" disabled={!hasPrices || cartItems.length === 0 || isSubmitting}>
              {isSubmitting ? 'Procesando pedido…' : 'Confirmar pedido'}
            </button>
          </form>
          {feedback && <p className={feedbackType} role="status">{feedback}</p>}
          <p className="demo-notice">Nuestro equipo te contactará para coordinar los siguientes pasos de tu pedido.</p>
        </div>

        <div className="demo-orders-panel">
          <h3>Solicitudes registradas en esta sesión</h3>
          {recentOrders.length === 0 && (
            <p className="demo-empty-message">Aquí aparecerá el recibo cuando se confirme el pedido.</p>
          )}
          <div className="demo-orders-list">
            {recentOrders.map((order) => (
              <article className="demo-order-card" key={order.orderNumber}>
                <div className="demo-order-heading">
                  <strong>Pedido {order.orderNumber}</strong>
                  <span>{new Date(order.createdAt).toLocaleString('es-CO')}</span>
                </div>
                <p>Nombre: {order.customerName}</p>
                <p>Correo: {order.customerEmail}</p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.productId}-${index}`}>
                      {item.quantity} × {item.name} ({formatUSD(item.unitPrice)} c/u)
                    </li>
                  ))}
                </ul>
                <p className="demo-order-total">Total: {formatUSD(order.total)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DemoCart

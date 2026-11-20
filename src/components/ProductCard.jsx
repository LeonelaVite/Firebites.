function ProductCard({ product, onAddToCart }) {
  const priceIsAvailable = product.price !== null && product.price !== undefined && product.price !== ''
  const formattedPrice = priceIsAvailable
    ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
    }).format(Number(product.price))
    : 'Precio pendiente'
  const spiceLevel = product.spiceLevel || product.level || ''

  return (
    <article className={`product-card ${product.colorClass || ''}`}>
      <div className="product-art">
        <span className="product-tag">FIREBITES</span>
        <span className="product-emoji" aria-hidden="true">{product.emoji || '🍬'}</span>
        <span className="product-flame" aria-hidden="true">🔥</span>
      </div>
      <div className="product-info">
        <div className="product-name-row">
          <h3>{product.name}</h3>
        </div>
        <p>{product.description}</p>
        <div className="product-details">
          {product.flavor && <span>{product.flavor}</span>}
          {spiceLevel && <span className="heat-level">{spiceLevel}</span>}
        </div>
        <p className="product-price">Precio: {formattedPrice}</p>
        {onAddToCart && (
          <button className="product-add-button" type="button" onClick={() => onAddToCart(product)}>
            Agregar al carrito
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard

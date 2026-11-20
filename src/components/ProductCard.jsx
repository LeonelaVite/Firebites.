function ProductCard({ product }) {
  const formattedPrice = Number(product.price).toLocaleString('es-CO')

  return (
    <article className="product-card">
      <div className="product-art">
        <span className="product-tag">FIREBITES</span>
        <span className="product-emoji" aria-hidden="true">🍬</span>
        <span className="product-flame" aria-hidden="true">🔥</span>
      </div>
      <div className="product-info">
        <div className="product-name-row">
          <h3>{product.name}</h3>
        </div>
        <p>{product.description}</p>
        <div className="product-details">
          <span>{product.flavor}</span>
          <span className="heat-level">{product.spiceLevel}</span>
        </div>
        <p className="product-price">Precio: {formattedPrice}</p>
      </div>
    </article>
  )
}

export default ProductCard

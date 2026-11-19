function ProductCard({ product }) {
  return (
    <article className={`product-card ${product.colorClass}`}>
      <div className="product-art">
        <span className="product-tag">FIREBITES</span>
        <span className="product-emoji" aria-hidden="true">{product.emoji}</span>
        <span className="product-flame" aria-hidden="true">🔥</span>
      </div>
      <div className="product-info">
        <div className="product-name-row">
          <h3>{product.name}</h3>
          <span className="product-arrow" aria-hidden="true">↗</span>
        </div>
        <p>{product.description}</p>
        <div className="product-details">
          <span>{product.flavor}</span>
          <span className="heat-level">{product.level}</span>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

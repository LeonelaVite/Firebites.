import ProductCard from './ProductCard.jsx'

function FeaturedProducts({ products, isLoading, onAddToCart, cartQuantity }) {
  return (
    <section className="products-section section-wrap" id="productos">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span>●</span> Catálogo FireBites</p>
          <h2>Pequeños bocados,<br /><span>grandes emociones.</span></h2>
        </div>
        <div className="products-actions">
          <p className="section-intro">
            Explora los sabores y niveles de picante disponibles.
          </p>
          <a className="button button-primary" href="#pedido-demo">
            Ver carrito ({cartQuantity})
          </a>
        </div>
      </div>

      {isLoading && <p className="products-message">Cargando productos…</p>}
      {!isLoading && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id || product.name}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedProducts

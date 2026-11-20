import { useEffect, useState } from 'react'
import apiRequest from '../services/api.js'
import ProductCard from './ProductCard.jsx'

function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        const result = await apiRequest('/products')
        setProducts(result.products)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <section className="products-section section-wrap" id="productos">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span>●</span> Catálogo FireBites</p>
          <h2>Pequeños bocados,<br /><span>grandes emociones.</span></h2>
        </div>
        <p className="section-intro">
          Explora los sabores y niveles de picante disponibles.
        </p>
      </div>

      {isLoading && <p className="products-message">Cargando productos…</p>}
      {!isLoading && errorMessage && (
        <p className="products-message error-message" role="status">{errorMessage}</p>
      )}
      {!isLoading && !errorMessage && products.length === 0 && (
        <p className="products-message">
          Aún no hay productos publicados. Vuelve pronto para descubrir el catálogo.
        </p>
      )}

      {!isLoading && !errorMessage && products.length > 0 && (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedProducts

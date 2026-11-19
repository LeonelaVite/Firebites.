import ProductCard from './ProductCard.jsx'

function FeaturedProducts() {
  const products = [
    {
      name: 'Mango en llamas',
      description: 'Gomitas suaves con un giro tropical y picantito.',
      flavor: 'Mango · Chile',
      level: 'Picor alegre',
      emoji: '🥭',
      colorClass: 'mango-card',
    },
    {
      name: 'Fresa explosiva',
      description: 'Un clásico frutal que llega con mucha personalidad.',
      flavor: 'Fresa · Limón',
      level: 'Picor medio',
      emoji: '🍓',
      colorClass: 'strawberry-card',
    },
    {
      name: 'Mix sin miedo',
      description: 'Una mezcla atrevida para quienes buscan más fuego.',
      flavor: 'Frutas · Chile',
      level: 'Picor intenso',
      emoji: '🍬',
      colorClass: 'mix-card',
    },
  ]

  return (
    <section className="products-section section-wrap" id="productos">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><span>●</span> Nuestros favoritos</p>
          <h2>Pequeños bocados,<br /><span>grandes emociones.</span></h2>
        </div>
        <p className="section-intro">
          Sabores frutales y un toque picante para hacer cada antojo más divertido.
        </p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
      <p className="products-note">Una probadita de lo que hace especial a FireBites <span aria-hidden="true">↗</span></p>
    </section>
  )
}

export default FeaturedProducts

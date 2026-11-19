function Hero() {
  return (
    <section className="hero-section" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow"><span>●</span> Dulces con actitud</p>
        <h1>Un toque dulce.<br /><span>Un fuego inolvidable.</span></h1>
        <p className="hero-description">
          Gomitas y dulces picantes para quienes disfrutan cada sabor al máximo.
          Atrévete a probar algo diferente.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#productos">Descubre los sabores <span aria-hidden="true">↗</span></a>
          <a className="text-link" href="#historia">Conoce FireBites</a>
        </div>
      </div>

      <div className="hero-visual" aria-label="Ilustración de gomitas y chile">
        <div className="hero-glow"></div>
        <span className="hero-spark spark-one" aria-hidden="true">✦</span>
        <span className="hero-spark spark-two" aria-hidden="true">✦</span>
        <div className="candy-orbit orbit-one"></div>
        <div className="candy-orbit orbit-two"></div>
        <div className="hero-candy" aria-hidden="true">🍬</div>
        <div className="hero-chili" aria-hidden="true">🌶️</div>
        <div className="hero-sticker"><span>ANTOJO</span><strong>con fuego</strong></div>
        <p className="hero-visual-caption">Dulce por fuera.<br />Picante por dentro.</p>
      </div>

      <div className="hero-bottom-note"><span>01</span> SABOR QUE DESPIERTA</div>
    </section>
  )
}

export default Hero

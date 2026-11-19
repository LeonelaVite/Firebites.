function BrandStory() {
  return (
    <section className="story-section" id="historia">
      <div className="story-mark" aria-hidden="true">
        <span className="story-sun"></span>
        <span className="story-pepper">🌶️</span>
        <span className="story-candy">🍬</span>
      </div>
      <div className="story-copy">
        <p className="eyebrow"><span>●</span> Conoce la marca</p>
        <h2>Nacimos para quienes<br /><span>no le temen al sabor.</span></h2>
        <p>
          En FireBites creemos que un dulce puede sorprender. Mezclamos el encanto
          de las gomitas con un toque picante para crear antojos llenos de energía,
          color y carácter.
        </p>
        <a className="text-link story-link" href="#inicio">El fuego apenas comienza <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  )
}

export default BrandStory

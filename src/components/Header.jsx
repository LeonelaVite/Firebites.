function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="FireBites, inicio">
        <span className="brand-icon" aria-hidden="true">🔥</span>
        <span>Fire<span className="brand-highlight">Bites</span></span>
      </a>

      <nav className="main-nav" aria-label="Navegación principal">
        <a href="#inicio">Inicio</a>
        <a href="#productos">Productos</a>
        <a href="#historia">Nosotros</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <a className="header-button" href="#asistente">Asistente</a>
    </header>
  )
}

export default Header

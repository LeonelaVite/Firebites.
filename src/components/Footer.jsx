function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#inicio">
        <span className="brand-icon" aria-hidden="true">🔥</span>
        <span>Fire<span className="brand-highlight">Bites</span></span>
      </a>
      <p>Un antojo con carácter.</p>
      <nav className="footer-links" aria-label="Enlaces del pie de página">
        <a href="#contacto">Contacto</a>
        <a href="#asistente">Asistente</a>
        <a href="#administracion">Administración</a>
      </nav>
      <a className="back-to-top" href="#inicio">Volver arriba ↑</a>
      <small>© 2026 FireBites</small>
    </footer>
  )
}

export default Footer

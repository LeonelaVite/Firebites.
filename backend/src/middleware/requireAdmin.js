function requireAdmin(request, response, next) {
  if (!request.session) {
    return response.status(503).json({
      message: 'Las sesiones administrativas no están configuradas.',
    })
  }

  if (!request.session.adminId) {
    return response.status(401).json({
      message: 'Inicia sesión como administrador para continuar.',
    })
  }

  next()
}

export default requireAdmin

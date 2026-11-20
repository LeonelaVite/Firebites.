import mongoose from 'mongoose'

function requireDatabase(request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      message: 'MongoDB no está conectado. Configura Atlas para usar esta función.',
    })
  }

  next()
}

export default requireDatabase

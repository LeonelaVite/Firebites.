import mongoose from 'mongoose'

function requireDatabase(request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({
      message: 'No fue posible consultar los productos en este momento.',
    })
  }

  next()
}

export default requireDatabase

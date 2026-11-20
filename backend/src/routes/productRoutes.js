import { Router } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import requireAdmin from '../middleware/requireAdmin.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()

function productDataIsValid(product) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return false
  }

  const priceIsPresent = product.price !== '' && product.price !== null

  return (
    typeof product.name === 'string' &&
    product.name.trim().length > 0 && product.name.length <= 100 &&
    typeof product.description === 'string' &&
    product.description.trim().length > 0 && product.description.length <= 1000 &&
    typeof product.flavor === 'string' &&
    product.flavor.trim().length > 0 && product.flavor.length <= 100 &&
    ['Suave', 'Medio', 'Intenso'].includes(product.spiceLevel) &&
    priceIsPresent &&
    Number.isFinite(Number(product.price)) &&
    Number(product.price) >= 0
  )
}

router.get('/', requireDatabase, async (request, response) => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 })
    response.json({ products })
  } catch {
    response.status(500).json({ message: 'No se pudieron consultar los productos.' })
  }
})

router.get('/admin/all', requireDatabase, requireAdmin, async (request, response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    response.json({ products })
  } catch {
    response.status(500).json({ message: 'No se pudieron consultar los productos.' })
  }
})

router.post('/', requireDatabase, requireAdmin, async (request, response) => {
  if (!productDataIsValid(request.body)) {
    return response.status(400).json({
      message: 'Completa correctamente todos los datos del producto.',
    })
  }

  try {
    const product = await Product.create({
      name: request.body.name,
      description: request.body.description,
      flavor: request.body.flavor,
      spiceLevel: request.body.spiceLevel,
      price: Number(request.body.price),
    })

    response.status(201).json({ product })
  } catch {
    response.status(500).json({ message: 'No se pudo guardar el producto.' })
  }
})

router.put('/:id', requireDatabase, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({
      message: 'El identificador del producto no es válido.',
    })
  }

  if (!productDataIsValid(request.body)) {
    return response.status(400).json({
      message: 'Completa correctamente todos los datos del producto.',
    })
  }

  try {
    const product = await Product.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        description: request.body.description,
        flavor: request.body.flavor,
        spiceLevel: request.body.spiceLevel,
        price: Number(request.body.price),
        active: request.body.active !== false,
      },
      { new: true, runValidators: true },
    )

    if (!product) {
      return response.status(404).json({ message: 'No se encontró ese producto.' })
    }

    response.json({ product })
  } catch {
    response.status(500).json({ message: 'No se pudo actualizar el producto.' })
  }
})

router.delete('/:id', requireDatabase, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({
      message: 'El identificador del producto no es válido.',
    })
  }

  try {
    const product = await Product.findByIdAndDelete(request.params.id)

    if (!product) {
      return response.status(404).json({ message: 'No se encontró ese producto.' })
    }

    response.json({ message: 'Producto eliminado.' })
  } catch {
    response.status(500).json({ message: 'No se pudo eliminar el producto.' })
  }
})

export default router

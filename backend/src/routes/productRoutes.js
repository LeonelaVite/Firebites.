import { Router } from 'express'
import Product from '../models/Product.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()

router.get('/', requireDatabase, async (request, response) => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: -1 })
    response.json({ products })
  } catch {
    response.status(500).json({ message: 'No se pudieron consultar los productos.' })
  }
})

export default router

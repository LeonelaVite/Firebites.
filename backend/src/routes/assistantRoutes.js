import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'
import Product from '../models/Product.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()

router.post('/', requireDatabase, async (request, response) => {
  const message = typeof request.body.message === 'string'
    ? request.body.message.trim()
    : ''

  if (!message || message.length > 500) {
    return response.status(400).json({
      message: 'Escribe una pregunta de hasta 500 caracteres.',
    })
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(503).json({
      message: 'El asistente todavía no está configurado.',
    })
  }

  try {
    const products = await Product.find({ active: true }).select(
      'name description flavor spiceLevel price',
    )

    if (products.length === 0) {
      return response.json({
        reply: 'Todavía no hay productos publicados para recomendar.',
        products: [],
      })
    }

    const catalog = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      flavor: product.flavor,
      spiceLevel: product.spiceLevel,
      price: product.price,
    }))

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: `Catálogo disponible: ${JSON.stringify(catalog)}\n\nPregunta del cliente: ${message}`,
      config: {
        systemInstruction:
          'Eres FireBites Assistant. Elige productos del catálogo que coincidan con lo que pide el cliente. No inventes productos, sabores, niveles de picante ni precios. Devuelve únicamente los identificadores del catálogo, separados por comas. Si ninguno coincide, devuelve NONE.',
      },
    })

    const validIds = new Set(catalog.map((product) => product.id))
    const selectedIds = (result.text || '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => validIds.has(id))

    const recommendations = catalog.filter((product) => selectedIds.includes(product.id))

    response.json({
      reply: recommendations.length
        ? 'Estas opciones de nuestro catálogo podrían gustarte:'
        : 'No encontré una opción clara. Prueba indicando un sabor o nivel de picante.',
      products: recommendations,
    })
  } catch {
    response.status(502).json({
      message: 'El asistente no está disponible en este momento.',
    })
  }
})

export default router

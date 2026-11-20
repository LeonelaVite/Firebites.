import { Router } from 'express'
import mongoose from 'mongoose'
import { GoogleGenAI } from '@google/genai'
import demoProducts from '../../../src/data/demoProducts.js'
import getDemoAssistantReply, { getConfirmedProductInfo } from '../../../src/services/demoAssistant.js'
import Product from '../models/Product.js'

const router = Router()

router.post('/', async (request, response) => {
  const message = typeof request.body.message === 'string'
    ? request.body.message.trim()
    : ''

  if (!message || message.length > 500) {
    return response.status(400).json({
      message: 'Escribe una pregunta de hasta 500 caracteres.',
    })
  }

  let products = demoProducts
  if (mongoose.connection.readyState === 1) {
    try {
      const databaseProducts = await Product.find({ active: true }).select(
        'name price',
      )
      if (databaseProducts.length > 0) {
        products = databaseProducts
      }
    } catch {
      products = demoProducts
    }
  }

  const catalog = products.map((product) => ({
    id: String(product._id || product.id),
    name: product.name,
    price: Number(product.price),
    currency: 'USD',
  }))
  const localReply = getDemoAssistantReply(
    message,
    catalog,
    request.body.cartItems,
    request.body.recentOrders,
  )

  if (localReply.handled || !process.env.GEMINI_API_KEY) {
    return response.json({
      reply: localReply.reply,
      products: localReply.products,
      source: 'local',
    })
  }

  const confirmedCatalog = catalog.map((product) => ({
    ...product,
    confirmedProductDetails: getConfirmedProductInfo(product)?.description || null,
  }))

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: `Catálogo actual de FireBites: ${JSON.stringify(confirmedCatalog)}\nPregunta del cliente: ${message}`,
      config: {
        systemInstruction:
          'Responde en español con tono amable y natural. Solo puedes usar los datos confirmados del catálogo. No inventes ingredientes, marcas, alérgenos, niveles de picante, productos ni precios. Si preguntan por ingredientes, alérgenos o intensidad exacta del picante, explica que esa información no está confirmada. No afirmes que se realizó un pago.',
      },
    })
    const reply = (result.text || '').trim()

    if (reply) {
      return response.json({ reply, products: [], source: 'gemini' })
    }
  } catch {
    // Si Gemini no responde, se conserva una respuesta útil desde el catálogo local.
  }

  return response.json({
    reply: localReply.reply,
    products: localReply.products,
    source: 'local',
  })
})

export default router

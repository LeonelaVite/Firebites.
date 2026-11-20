import { Router } from 'express'
import mongoose from 'mongoose'
import demoProducts from '../../../src/data/demoProducts.js'
import Product from '../models/Product.js'
import { sendOrderNotification } from '../services/emailService.js'
import { saveOrder, updateOrderEmailStatus } from '../services/orderStorage.js'

const router = Router()

function emailIsValid(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function orderDetailsAreValid(body) {
  if (
    !body ||
    typeof body.customerName !== 'string' ||
    body.customerName.trim().length < 2 ||
    body.customerName.trim().length > 80 ||
    !emailIsValid(body.customerEmail) ||
    body.customerEmail.length > 120 ||
    typeof body.idempotencyKey !== 'string' ||
    body.idempotencyKey.trim().length < 8 ||
    body.idempotencyKey.length > 120 ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 20
  ) {
    return false
  }

  return body.items.every((item) => (
    item &&
    typeof item.productId === 'string' &&
    item.productId.length > 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= 99
  ))
}

async function getProductsForOrder(items) {
  if (mongoose.connection.readyState !== 1) {
    return demoProducts
  }

  const productIds = items.map((item) => item.productId)
  if (!productIds.every((productId) => mongoose.isValidObjectId(productId))) {
    return null
  }

  return Product.find({ _id: { $in: productIds }, active: true })
}

function orderForCustomer(order) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    total: order.total,
    currency: order.currency,
    createdAt: order.createdAt,
  }
}

router.post('/', async (request, response) => {
  const body = request.body && typeof request.body === 'object' ? request.body : {}

  if (!orderDetailsAreValid(body)) {
    return response.status(400).json({
      message: 'Escribe un nombre, un correo válido y al menos un producto con una cantidad válida.',
    })
  }

  try {
    const products = await getProductsForOrder(body.items)
    if (!products) {
      return response.status(400).json({
        message: 'El catálogo cambió. Actualiza la página y vuelve a agregar los productos.',
      })
    }

    const orderItems = []
    for (const requestedItem of body.items) {
      const product = products.find((currentProduct) => (
        String(currentProduct._id || currentProduct.id) === requestedItem.productId
      ))

      if (!product) {
        return response.status(400).json({
          message: 'Uno de los productos ya no está disponible. Actualiza el catálogo.',
        })
      }

      const unitPrice = Number(product.price)
      const lineTotal = Math.round(unitPrice * 100) * requestedItem.quantity / 100
      orderItems.push({
        productId: requestedItem.productId,
        name: product.name,
        quantity: requestedItem.quantity,
        unitPrice,
        lineTotal,
      })
    }

    const totalInCents = orderItems.reduce((total, item) => (
      total + Math.round(item.lineTotal * 100)
    ), 0)
    const order = {
      orderNumber: `FB-${Date.now()}`,
      idempotencyKey: body.idempotencyKey,
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim().toLowerCase(),
      items: orderItems,
      total: totalInCents / 100,
      currency: 'USD',
      status: 'received',
      paymentStatus: 'not_processed',
      emailStatus: 'pending',
      emailMessage: '',
      emailMessageId: '',
      createdAt: new Date(),
    }

    const savedResult = await saveOrder(order)
    let emailResult

    if (savedResult.created) {
      emailResult = await sendOrderNotification(savedResult.order)
      try {
        await updateOrderEmailStatus(
          savedResult.order.orderNumber,
          emailResult,
          savedResult.storage,
        )
      } catch {
        // El pedido ya está guardado; un fallo al actualizar el estado del correo no lo elimina.
      }
    } else {
      emailResult = {
        status: savedResult.order.emailStatus || 'pending',
        message: savedResult.order.emailMessage || 'El pedido ya estaba registrado; no se creó otro pedido ni se repitió el correo.',
      }
    }

    console.info(
      `Pedido ${savedResult.order.orderNumber}: almacenamiento=${savedResult.storage}; correo=${emailResult.status}; repetido=${!savedResult.created}.`,
    )

    response.status(201).json({
      order: orderForCustomer(savedResult.order),
      orderSaved: true,
    })
  } catch {
    response.status(500).json({
      message: 'No se pudo guardar el pedido. No se confirmó la solicitud.',
    })
  }
})

export default router

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import Order from '../models/Order.js'

const ordersFilePath = fileURLToPath(new URL('../../data/orders.json', import.meta.url))

async function readLocalOrders() {
  try {
    const fileContents = await readFile(ordersFilePath, 'utf8')
    const orders = JSON.parse(fileContents)
    return Array.isArray(orders) ? orders : []
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

async function saveOrder(order) {
  if (mongoose.connection.readyState === 1) {
    const existingOrder = await Order.findOne({ idempotencyKey: order.idempotencyKey })
    if (existingOrder) {
      return { order: existingOrder.toObject(), storage: 'mongodb', created: false }
    }

    try {
      const savedOrder = await Order.create(order)
      return { order: savedOrder.toObject(), storage: 'mongodb', created: true }
    } catch (error) {
      if (error.code === 11000) {
        const savedOrder = await Order.findOne({ idempotencyKey: order.idempotencyKey })
        if (savedOrder) {
          return { order: savedOrder.toObject(), storage: 'mongodb', created: false }
        }
      }
      throw error
    }
  }

  const currentOrders = await readLocalOrders()
  const existingOrder = currentOrders.find((currentOrder) => (
    currentOrder.idempotencyKey === order.idempotencyKey
  ))
  if (existingOrder) {
    return { order: existingOrder, storage: 'local-file', created: false }
  }

  const savedOrder = { ...order }
  currentOrders.unshift(savedOrder)

  await mkdir(dirname(ordersFilePath), { recursive: true })
  await writeFile(ordersFilePath, JSON.stringify(currentOrders, null, 2), 'utf8')

  return { order: savedOrder, storage: 'local-file', created: true }
}

async function updateOrderEmailStatus(orderNumber, emailResult, storage) {
  if (storage === 'mongodb') {
    await Order.findOneAndUpdate(
      { orderNumber },
      {
        emailStatus: emailResult.status,
        emailMessage: emailResult.message,
        emailMessageId: emailResult.messageId || '',
      },
      { new: true },
    )
    return
  }

  const currentOrders = await readLocalOrders()
  const savedOrder = currentOrders.find((order) => order.orderNumber === orderNumber)
  if (!savedOrder) {
    throw new Error('No se encontró el pedido local para actualizar su estado.')
  }

  savedOrder.emailStatus = emailResult.status
  savedOrder.emailMessage = emailResult.message
  savedOrder.emailMessageId = emailResult.messageId || ''
  await writeFile(ordersFilePath, JSON.stringify(currentOrders, null, 2), 'utf8')
}

export { saveOrder, updateOrderEmailStatus }

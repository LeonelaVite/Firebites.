import { Router } from 'express'
import mongoose from 'mongoose'
import ContactRequest from '../models/ContactRequest.js'
import requireAdmin from '../middleware/requireAdmin.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()

function emailIsValid(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

router.post('/', requireDatabase, async (request, response) => {
  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const { name, email, subject, message } = body

  if (
    typeof name !== 'string' || name.trim().length < 2 || name.length > 80 ||
    !emailIsValid(typeof email === 'string' ? email.trim() : email) ||
    typeof email !== 'string' || email.length > 120 ||
    typeof subject !== 'string' || subject.trim().length < 2 || subject.length > 120 ||
    typeof message !== 'string' || message.trim().length < 5 || message.length > 1500
  ) {
    return response.status(400).json({
      message: 'Revisa los datos del formulario e inténtalo de nuevo.',
    })
  }

  try {
    const contactRequest = await ContactRequest.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    })

    response.status(201).json({
      message: 'Tu mensaje fue registrado correctamente.',
      requestId: contactRequest._id.toString(),
    })
  } catch {
    response.status(500).json({ message: 'No se pudo registrar tu mensaje.' })
  }
})

router.get('/admin/all', requireDatabase, requireAdmin, async (request, response) => {
  try {
    const requests = await ContactRequest.find().sort({ createdAt: -1 })
    response.json({ requests })
  } catch {
    response.status(500).json({ message: 'No se pudieron consultar las solicitudes.' })
  }
})

router.patch('/admin/:id', requireDatabase, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({
      message: 'El identificador de la solicitud no es válido.',
    })
  }

  const statuses = ['Nueva', 'Revisada', 'Resuelta']
  if (!statuses.includes(request.body.status)) {
    return response.status(400).json({ message: 'El estado indicado no es válido.' })
  }

  try {
    const contactRequest = await ContactRequest.findByIdAndUpdate(
      request.params.id,
      { status: request.body.status },
      { new: true, runValidators: true },
    )

    if (!contactRequest) {
      return response.status(404).json({ message: 'No se encontró esa solicitud.' })
    }

    response.json({ request: contactRequest })
  } catch {
    response.status(500).json({ message: 'No se pudo actualizar la solicitud.' })
  }
})

router.delete('/admin/:id', requireDatabase, requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({
      message: 'El identificador de la solicitud no es válido.',
    })
  }

  try {
    const contactRequest = await ContactRequest.findByIdAndDelete(request.params.id)

    if (!contactRequest) {
      return response.status(404).json({ message: 'No se encontró esa solicitud.' })
    }

    response.json({ message: 'Solicitud eliminada.' })
  } catch {
    response.status(500).json({ message: 'No se pudo eliminar la solicitud.' })
  }
})

export default router

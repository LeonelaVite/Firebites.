import { Router } from 'express'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()

router.post('/login', requireDatabase, async (request, response) => {
  if (!request.session) {
    return response.status(503).json({
      message: 'Las sesiones administrativas no están configuradas.',
    })
  }

  const body = request.body && typeof request.body === 'object' ? request.body : {}
  const email = typeof body.email === 'string'
    ? body.email.trim().toLowerCase()
    : ''
  const password = typeof body.password === 'string'
    ? body.password
    : ''

  if (!email || !password) {
    return response.status(400).json({ message: 'Escribe tu correo y contraseña.' })
  }

  try {
    const admin = await Admin.findOne({ email })
    const passwordIsCorrect = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false

    if (!passwordIsCorrect) {
      return response.status(401).json({
        message: 'El correo o la contraseña no son correctos.',
      })
    }

    request.session.regenerate((error) => {
      if (error) {
        return response.status(500).json({ message: 'No se pudo iniciar sesión.' })
      }

      request.session.adminId = admin._id.toString()
      request.session.adminEmail = admin.email

      request.session.save((saveError) => {
        if (saveError) {
          return response.status(500).json({ message: 'No se pudo iniciar sesión.' })
        }

        response.json({ authenticated: true, email: admin.email })
      })
    })
  } catch {
    response.status(500).json({ message: 'No se pudo iniciar sesión.' })
  }
})

router.get('/me', (request, response) => {
  if (!request.session || !request.session.adminId) {
    return response.json({ authenticated: false })
  }

  response.json({
    authenticated: true,
    email: request.session.adminEmail,
  })
})

router.post('/logout', (request, response) => {
  if (!request.session) {
    return response.json({ message: 'La sesión ya está cerrada.' })
  }

  request.session.destroy((error) => {
    if (error) {
      return response.status(500).json({ message: 'No se pudo cerrar la sesión.' })
    }

    response.clearCookie('firebites.sid', {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    })
    response.json({ message: 'Sesión cerrada.' })
  })
})

export default router

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

async function createAdmin() {
  const databaseUrl = process.env.MONGODB_URI
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD

  if (!databaseUrl || !email || !password) {
    console.error('Configura MONGODB_URI, ADMIN_EMAIL y ADMIN_PASSWORD en backend/.env.')
    process.exitCode = 1
    return
  }

  if (password.length < 12) {
    console.error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')
    process.exitCode = 1
    return
  }

  try {
    await mongoose.connect(databaseUrl)

    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
      console.log('Ya existe una cuenta administradora con ese correo.')
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await Admin.create({ email, passwordHash })
    console.log('Cuenta administradora creada. La contraseña no se guardó en texto legible.')
  } catch {
    console.error('No se pudo crear la cuenta administradora. Revisa la configuración local.')
    process.exitCode = 1
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  }
}

createAdmin()

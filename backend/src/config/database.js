import mongoose from 'mongoose'

async function connectToDatabase() {
  const databaseUrl = process.env.MONGODB_URI

  if (!databaseUrl) {
    console.log('MONGODB_URI no está configurada; no se intentó conectar a la base de datos.')
    return false
  }

  try {
    await mongoose.connect(databaseUrl)
    console.log('Conexión con MongoDB verificada.')
    return true
  } catch {
    console.error('No se pudo verificar la conexión con MongoDB. Revisa MONGODB_URI y el acceso de red de Atlas.')
    return false
  }
}

export default connectToDatabase

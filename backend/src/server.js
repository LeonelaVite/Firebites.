import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import connectToDatabase from './config/database.js'
import assistantRoutes from './routes/assistantRoutes.js'
import authRoutes from './routes/authRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import productRoutes from './routes/productRoutes.js'

const app = express()
const port = process.env.PORT || 3000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const databaseUrl = process.env.MONGODB_URI
const sessionSecret = process.env.SESSION_SECRET
const isProduction = process.env.NODE_ENV === 'production'
const sessionSecretIsStrong = typeof sessionSecret === 'string' && sessionSecret.length >= 32

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}))
app.use(express.json({ limit: '20kb' }))

if (databaseUrl && sessionSecretIsStrong) {
  if (isProduction) {
    app.set('trust proxy', 1)
  }

  app.use(session({
    name: 'firebites.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: databaseUrl,
      collectionName: 'sessions',
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }))
} else {
  console.log('Sesiones desactivadas: configura MONGODB_URI y un SESSION_SECRET de al menos 32 caracteres en backend/.env.')
}

app.use('/api/health', healthRoutes)
app.use('/api/products', productRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/assistant', assistantRoutes)

connectToDatabase()

app.listen(port, () => {
  console.log(`Servidor FireBites activo en http://localhost:${port}`)
})

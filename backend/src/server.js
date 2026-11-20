import './config/environment.js'
import cors from 'cors'
import express from 'express'
import connectToDatabase from './config/database.js'
import assistantRoutes from './routes/assistantRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import productRoutes from './routes/productRoutes.js'

const app = express()
const port = process.env.PORT || 3000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const isProduction = process.env.NODE_ENV === 'production'
const allowedFrontendUrls = isProduction
  ? frontendUrl
  : [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173']

app.use(cors({
  origin: allowedFrontendUrls,
  credentials: true,
}))
app.use(express.json({ limit: '20kb' }))

app.use('/api/health', healthRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/assistant', assistantRoutes)

connectToDatabase()

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor FireBites activo en http://localhost:${port}`)
})

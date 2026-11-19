import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import connectToDatabase from './config/database.js'
import healthRoutes from './routes/healthRoutes.js'

const app = express()
const port = process.env.PORT || 3000
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: frontendUrl }))
app.use(express.json())
app.use('/api/health', healthRoutes)

connectToDatabase()

app.listen(port, () => {
  console.log(`Servidor FireBites activo en http://localhost:${port}`)
})

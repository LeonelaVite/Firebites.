import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

router.get('/', (request, response) => {
  const databaseIsConnected = mongoose.connection.readyState === 1

  response.json({
    server: 'funcionando',
    database: databaseIsConnected ? 'conectada' : 'no conectada',
  })
})

export default router

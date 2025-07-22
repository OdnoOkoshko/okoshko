// routes.ts - минимальный backend endpoint

import { Router } from 'express'

const router = Router()

// Минимальный эндпоинт для проверки работы сервера
router.get('/api/ping', (req, res) => {
  res.send('pong')
})

export default router
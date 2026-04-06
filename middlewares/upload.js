// 📁 middlewares/upload.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true }) // crea la carpeta si no existe

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // evita colisiones con timestamp
    const fileName = `${Date.now()}-${file.originalname}`
    cb(null, fileName)
  }
})

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
})

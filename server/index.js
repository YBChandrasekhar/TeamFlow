const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

const app = express()

app.use(helmet())
app.use(cors({
  origin: ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean),
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/tickets', require('./routes/tickets'))
app.use('/api/comments', require('./routes/comments'))

app.get('/', (req, res) => res.json({ status: 'API is running' }))

const PORT = process.env.PORT || 5000

// Start server first so Render detects the port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  // Then connect MongoDB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB error:', err))
})

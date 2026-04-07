const router = require('express').Router()
const Ticket = require('../models/Ticket')
const auth = require('../middleware/auth')

router.get('/:id', auth, async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('assignee', 'name email').populate('createdBy', 'name email')
  if (!ticket) return res.status(404).json({ message: 'Not found' })
  res.json(ticket)
})

router.get('/', auth, async (req, res) => {
  const { projectId, status, priority, assignee, search } = req.query
  const filter = { projectId }
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (assignee) filter.assignee = assignee
  if (search) filter.title = { $regex: search, $options: 'i' }
  const tickets = await Ticket.find(filter).populate('assignee', 'name email')
  console.log('Tickets fetched with filter:', filter)
  res.json(tickets)
})

router.post('/', auth, async (req, res) => {
  try {
    const { assignee, ...rest } = req.body
    const ticket = await Ticket.create({ ...rest, createdBy: req.user.id, ...(assignee ? { assignee } : {}) })
    res.status(201).json(ticket)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  const { assignee, ...rest } = req.body
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { ...rest, ...(assignee ? { assignee } : { $unset: { assignee: 1 } }) },
    { new: true }
  )
  if (!ticket) return res.status(404).json({ message: 'Not found' })
  res.json(ticket)
})

router.delete('/:id', auth, async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router

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
  try {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) return res.status(404).json({ message: 'Not found' })
    // Only creator can edit title/description, anyone can update status/priority/assignee
    const { title, description, assignee, ...rest } = req.body
    const isCreator = ticket.createdBy.toString() === req.user.id
    const update = { ...rest, ...(assignee ? { assignee } : { $unset: { assignee: 1 } }) }
    if (isCreator) {
      if (title) update.title = title
      if (description !== undefined) update.description = description
    }
    const updated = await Ticket.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) return res.status(404).json({ message: 'Not found' })
  if (ticket.createdBy.toString() !== req.user.id)
    return res.status(403).json({ message: 'Only the creator can delete this ticket' })
  await Ticket.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router

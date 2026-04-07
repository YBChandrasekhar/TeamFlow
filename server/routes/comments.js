const router = require('express').Router()
const Comment = require('../models/Comment')
const auth = require('../middleware/auth')

router.get('/:ticketId', auth, async (req, res) => {
  const comments = await Comment.find({ ticketId: req.params.ticketId })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 })
  res.json(comments)
})

router.post('/:ticketId', auth, async (req, res) => {
  try {
    const comment = await Comment.create({
      ticketId: req.params.ticketId,
      userId: req.user.id,
      text: req.body.text,
    })
    const populated = await comment.populate('userId', 'name email')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  await Comment.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
  res.json({ message: 'Deleted' })
})

module.exports = router

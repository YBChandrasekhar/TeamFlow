const router = require('express').Router()
const Project = require('../models/Project')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  const projects = await Project.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).populate('members', 'name email')
  res.json(projects)
})

router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user.id })
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', auth, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    req.body,
    { new: true }
  )
  if (!project) return res.status(404).json({ message: 'Not found' })
  res.json(project)
})

router.delete('/:id', auth, async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id })
  if (!project) return res.status(404).json({ message: 'Not found' })
  res.json({ message: 'Deleted' })
})

module.exports = router

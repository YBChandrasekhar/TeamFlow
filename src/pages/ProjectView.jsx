import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getTickets, createTicket, updateTicket, deleteTicket } from '../api/tickets'
import { getProjects } from '../api/projects'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import TicketCard from '../components/TicketCard'
import TicketForm from '../components/TicketForm'

export default function ProjectView() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const token = user?.token

  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editTicket, setEditTicket] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' })

  const project = projects.find((p) => p._id === id)

  useEffect(() => {
    getProjects(token).then((data) => { if (Array.isArray(data)) setProjects(data) })
  }, [token])

  useEffect(() => {
    if (!id) return
    const query = { projectId: id }
    if (filters.status) query.status = filters.status
    if (filters.priority) query.priority = filters.priority
    if (filters.search) query.search = filters.search
    const params = new URLSearchParams(query).toString()
    getTickets(params, token).then((data) => { if (Array.isArray(data)) setTickets(data) })
  }, [id, filters, token])

  const handleCreate = async (form) => {
    const data = await createTicket({ ...form, projectId: id }, token)
    if (data._id) {
      setTickets([data, ...tickets])
      setShowForm(false)
      toast.success('Ticket created!')
    } else toast.error(data.message || 'Failed')
  }

  const handleEdit = async (form) => {
    if (!editTicket) return
    const data = await updateTicket(editTicket._id, form, token)
    if (data._id) {
      setTickets(tickets.map((t) => (t._id === data._id ? data : t)))
      setEditTicket(null)
      toast.success('Ticket updated!')
    } else toast.error(data.message || 'Failed')
  }

  const handleDelete = async (ticketId) => {
    if (!confirm('Delete this ticket?')) return
    await deleteTicket(ticketId, token)
    setTickets(tickets.filter((t) => t._id !== ticketId))
    toast.success('Ticket deleted')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar projects={projects} />
        <main className="flex-1 p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{project?.title || 'Project'}</h1>
              {project?.description && (
                <p className="text-gray-500 text-sm mt-1">{project.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/projects/${id}/kanban`)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Kanban View
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                + New Ticket
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500 w-52"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {(filters.status || filters.priority || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Ticket Grid */}
          {tickets.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg">No tickets found</p>
              <p className="text-sm mt-1">Create your first ticket for this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((t) => (
                <TicketCard
                  key={t._id}
                  ticket={t}
                  onEdit={(ticket) => setEditTicket(ticket)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <TicketForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          members={project?.members || []}
        />
      )}

      {editTicket && (
        <TicketForm
          initial={editTicket}
          onSubmit={handleEdit}
          onClose={() => setEditTicket(null)}
          members={project?.members || []}
        />
      )}
    </div>
  )
}

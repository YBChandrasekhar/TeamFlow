import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useAuth } from '../context/AuthContext'
import { getTickets, updateTicket } from '../api/tickets'
import { getProjects } from '../api/projects'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-gray-500' },
  { id: 'inprogress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'done', label: 'Done', color: 'border-green-500' },
]

const PRIORITY_COLORS = {
  high: 'text-red-400 bg-red-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-green-400 bg-green-500/10',
}

function DraggableTicket({ ticket }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: ticket._id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-gray-800 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-30 border-violet-500' : 'border-gray-700 hover:border-gray-500'
      }`}
    >
      <p className="text-white text-sm font-medium leading-snug">{ticket.title}</p>
      {ticket.description && (
        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ticket.description}</p>
      )}
      <div className="flex items-center justify-between mt-2.5">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className="text-gray-600 text-xs">
          {ticket.assignee ? `👤 ${ticket.assignee.name}` : 'Unassigned'}
        </span>
      </div>
    </div>
  )
}

function DroppableColumn({ column, tickets, isOver }) {
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div className={`flex flex-col rounded-xl border-t-2 transition-colors ${column.color} ${
      isOver ? 'bg-gray-800' : 'bg-gray-900'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-semibold text-sm">{column.label}</h3>
        <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-2 p-3 flex-1 min-h-64">
        {tickets.map((ticket) => (
          <DraggableTicket key={ticket._id} ticket={ticket} />
        ))}
        {tickets.length === 0 && (
          <div className={`flex-1 flex items-center justify-center rounded-lg border-2 border-dashed transition-colors min-h-32 ${
            isOver ? 'border-violet-500 bg-violet-500/5' : 'border-gray-800'
          }`}>
            <p className="text-gray-700 text-xs">Drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const token = user?.token

  const [projects, setProjects] = useState([])
  const [tickets, setTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [overId, setOverId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    getProjects(token).then((data) => { if (Array.isArray(data)) setProjects(data) })
  }, [token])

  useEffect(() => {
    if (!id) return
    getTickets(`projectId=${id}`, token).then((data) => {
      if (Array.isArray(data)) setTickets(data)
    })
  }, [id, token])

  const handleDragStart = ({ active }) => {
    setActiveTicket(tickets.find((t) => t._id === active.id) || null)
  }

  const handleDragOver = ({ over }) => {
    setOverId(over?.id || null)
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTicket(null)
    setOverId(null)
    if (!over) return

    const newStatus = COLUMNS.find((c) => c.id === over.id)?.id
    if (!newStatus) return

    const currentStatus = tickets.find((t) => t._id === active.id)?.status
    if (currentStatus === newStatus) return

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t._id === active.id ? { ...t, status: newStatus } : t))
    )

    const data = await updateTicket(active.id, { status: newStatus }, token)
    if (!data._id) {
      toast.error('Failed to update ticket')
      setTickets((prev) =>
        prev.map((t) => (t._id === active.id ? { ...t, status: currentStatus } : t))
      )
    } else {
      toast.success('Ticket moved!')
    }
  }

  const project = projects.find((p) => p._id === id)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar projects={projects} />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{project?.title || 'Kanban Board'}</h1>
              <p className="text-gray-500 text-sm mt-1">Drag tickets to update their status</p>
            </div>
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              ← List View
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLUMNS.map((col) => (
                <DroppableColumn
                  key={col.id}
                  column={col}
                  tickets={tickets.filter((t) => t.status === col.id)}
                  isOver={overId === col.id}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTicket && (
                <div className="bg-gray-800 border border-violet-500 rounded-lg p-3 shadow-2xl rotate-2 w-64">
                  <p className="text-white text-sm font-medium">{activeTicket.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${PRIORITY_COLORS[activeTicket.priority]}`}>
                    {activeTicket.priority}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  )
}

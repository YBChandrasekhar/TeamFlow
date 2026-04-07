import { useNavigate, useParams } from 'react-router-dom'

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const STATUS_STYLES = {
  todo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  inprogress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  done: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }

export default function TicketCard({ ticket, onEdit, onDelete }) {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div
      onClick={() => navigate(`/projects/${id}/tickets/${ticket._id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white text-sm font-medium leading-snug">{ticket.title}</h3>
        <div className="flex gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(ticket) }} className="text-gray-600 hover:text-violet-400 text-xs transition-colors">✎</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(ticket._id) }} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
        </div>
      </div>

      {ticket.description && (
        <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{ticket.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[ticket.status]}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-600 text-xs">
          {ticket.assignee ? `👤 ${ticket.assignee.name}` : 'Unassigned'}
        </span>
        <span className="text-gray-700 text-xs">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getTicketById, updateTicket } from '../api/tickets'
import { getComments, addComment, deleteComment } from '../api/comments'
import { getProjects } from '../api/projects'
import Navbar from '../components/Navbar'

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

const STATUS_LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }

export default function TicketDetail() {
  const { id, ticketId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const token = user?.token

  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [members, setMembers] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getTicketById(ticketId, token).then((data) => { if (data._id) setTicket(data) })
    getComments(ticketId, token).then((data) => { if (Array.isArray(data)) setComments(data) })
    getProjects(token).then((data) => {
      if (Array.isArray(data)) {
        const project = data.find((p) => p._id === id)
        if (project?.members) setMembers(project.members)
      }
    })
  }, [ticketId, id, token])

  const handleAssign = async (assigneeId) => {
    const data = await updateTicket(ticketId, { assignee: assigneeId }, token)
    if (data._id) {
      setTicket(data)
      toast.success('Assignee updated!')
    }
  }

  const handleStatusChange = async (status) => {
    const data = await updateTicket(ticketId, { status }, token)
    if (data._id) { setTicket(data); toast.success('Status updated!') }
  }

  const handlePriorityChange = async (priority) => {
    const data = await updateTicket(ticketId, { priority }, token)
    if (data._id) { setTicket(data); toast.success('Priority updated!') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    const data = await addComment(ticketId, commentText, token)
    setSubmitting(false)
    if (data._id) {
      setComments([...comments, data])
      setCommentText('')
    } else toast.error('Failed to add comment')
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId, token)
    setComments(comments.filter((c) => c._id !== commentId))
    toast.success('Comment deleted')
  }

  if (!ticket) return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-500">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">

        {/* Back button */}
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="text-gray-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to project
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h1 className="text-white text-xl font-bold">{ticket.title}</h1>
              {ticket.description && (
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{ticket.description}</p>
              )}
              <div className="flex gap-2 mt-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-gray-600 text-xs mt-4">
                Created by {ticket.createdBy?.name} · {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Comments */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Comments ({comments.length})</h2>

              <div className="space-y-4 mb-4">
                {comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.userId?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium">{c.userId?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.userId?._id === user?.user?.id && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                            >✕</button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-600 text-sm">No comments yet</p>
                )}
              </div>

              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Post
                </button>
              </form>
            </div>
          </div>

          {/* Right — Sidebar details */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Priority</label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Assignee</label>
                <select
                  value={ticket.assignee?._id || ticket.assignee || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

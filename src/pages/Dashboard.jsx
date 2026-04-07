import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProjects, createProject, deleteProject } from '../api/projects'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const token = user?.token
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getProjects(token).then((data) => {
      if (Array.isArray(data)) setProjects(data)
    })
  }, [token])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const data = await createProject(form, token)
    setLoading(false)
    if (data._id) {
      setProjects([...projects, data])
      setForm({ title: '', description: '' })
      setShowModal(false)
      toast.success('Project created!')
    } else {
      toast.error(data.message || 'Failed to create project')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    await deleteProject(id, token)
    setProjects(projects.filter((p) => p._id !== id))
    toast.success('Project deleted')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar projects={projects} />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Your Projects</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <p className="text-lg">No projects yet</p>
              <p className="text-sm mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div onClick={() => navigate(`/projects/${p._id}`)} className="flex-1">
                      <h2 className="text-white font-semibold text-base group-hover:text-violet-400 transition-colors">
                        {p.title}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {p.description || 'No description'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-gray-600 hover:text-red-400 text-xs ml-3 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-gray-600 text-xs mt-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Project Name</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bug Tracker v2"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

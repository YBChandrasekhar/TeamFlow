import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Sidebar({ projects }) {
  const { id } = useParams()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-violet-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        {open ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-40 top-14 left-0 h-full
        w-60 bg-gray-900 border-r border-gray-800 p-4
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:min-h-screen
      `}>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Projects</p>
        <ul className="space-y-1">
          {projects.map((p) => (
            <li key={p._id}>
              <Link
                to={`/projects/${p._id}`}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  id === p._id
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {p.title}
              </Link>
            </li>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-600 text-sm px-3">No projects yet</p>
          )}
        </ul>
      </aside>
    </>
  )
}

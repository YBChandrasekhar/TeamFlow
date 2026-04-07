import { Link, useParams } from 'react-router-dom'

export default function Sidebar({ projects }) {
  const { id } = useParams()

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 min-h-screen p-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Projects</p>
      <ul className="space-y-1">
        {projects.map((p) => (
          <li key={p._id}>
            <Link
              to={`/projects/${p._id}`}
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
  )
}

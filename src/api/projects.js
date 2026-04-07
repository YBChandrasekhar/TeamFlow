const BASE = 'http://localhost:5000/api/projects'

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const getProjects = (token) =>
  fetch(BASE, { headers: headers(token) }).then((r) => r.json())

export const createProject = (data, token) =>
  fetch(BASE, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then((r) => r.json())

export const deleteProject = (id, token) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: headers(token) }).then((r) => r.json())

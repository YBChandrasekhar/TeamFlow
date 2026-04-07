const BASE = 'http://localhost:5000/api/comments'

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const getComments = (ticketId, token) =>
  fetch(`${BASE}/${ticketId}`, { headers: headers(token) }).then((r) => r.json())

export const addComment = (ticketId, text, token) =>
  fetch(`${BASE}/${ticketId}`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ text }),
  }).then((r) => r.json())

export const deleteComment = (id, token) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: headers(token) }).then((r) => r.json())

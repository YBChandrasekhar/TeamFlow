const BASE = 'http://localhost:5000/api/tickets'

const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const getTicketById = (id, token) =>
  fetch(`${BASE}/${id}`, { headers: headers(token) }).then((r) => r.json())

export const getTickets = (queryString, token) =>
  fetch(`${BASE}?${queryString}`, { headers: headers(token) }).then((r) => r.json())

export const createTicket = (data, token) =>
  fetch(BASE, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then((r) => r.json())

export const updateTicket = (id, data, token) =>
  fetch(`${BASE}/${id}`, { method: 'PUT', headers: headers(token), body: JSON.stringify(data) }).then((r) => r.json())

export const deleteTicket = (id, token) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE', headers: headers(token) }).then((r) => r.json())

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string {
  return localStorage.getItem('musema_admin_token') || '';
}

async function req(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const adminApi = {
  login:           (email: string, password: string) =>
    fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      .then(r => r.json()),

  me:              () => req('/me'),
  stats:           () => req('/stats'),

  // Bookings
  getBookings:     (params?: Record<string, string>) =>
    req('/bookings?' + new URLSearchParams(params || {}).toString()),
  updateBooking:   (id: string, body: object) =>
    req(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Users
  getUsers:        (params?: Record<string, string>) =>
    req('/users?' + new URLSearchParams(params || {}).toString()),
  toggleUser:      (id: string) =>
    req(`/users/${id}/toggle`, { method: 'PATCH' }),

  // Museums
  getMuseums:      (params?: Record<string, string>) =>
    req('/museums?' + new URLSearchParams(params || {}).toString()),
  updateMuseum:    (id: string, body: object) =>
    req(`/museums/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMuseum:    (id: string) =>
    req(`/museums/${id}`, { method: 'DELETE' }),
};
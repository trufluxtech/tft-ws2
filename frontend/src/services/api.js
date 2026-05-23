const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function parseResponse(res, fallback) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || fallback);
  return data;
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/api/config`);
  return parseResponse(res, 'Unable to load website configuration');
}

export function getAdminToken() {
  return localStorage.getItem('truflux_admin_token') || '';
}

export function clearAdminToken() {
  localStorage.removeItem('truflux_admin_token');
}

export async function adminLogin(username, password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseResponse(res, 'Unable to login');
  localStorage.setItem('truflux_admin_token', data.token);
  return data;
}

export async function fetchAdminConfig() {
  const res = await fetch(`${API_BASE}/api/admin/config`, {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  return parseResponse(res, 'Admin login required');
}

export async function saveConfig(config) {
  const res = await fetch(`${API_BASE}/api/admin/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` },
    body: JSON.stringify({ config }),
  });
  return parseResponse(res, 'Unable to save configuration');
}

export async function fetchAdminLeads() {
  const res = await fetch(`${API_BASE}/api/admin/leads`, {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  });
  return parseResponse(res, 'Unable to load captured lead report');
}

export async function uploadLogo(file) {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${API_BASE}/api/admin/logo`, { method: 'POST', headers: { Authorization: `Bearer ${getAdminToken()}` }, body });
  return parseResponse(res, 'Unable to upload logo');
}

export async function submitLead(payload) {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, 'Unable to submit lead');
}

export async function submitContact(payload) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, 'Unable to submit contact request');
}

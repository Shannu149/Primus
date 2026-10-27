export const API = 'http://localhost:8080/api'
export async function api(path, options = {}) {
  const response = await fetch(API + path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, signal: options.signal || AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(response.status === 404 ? 'Request token not found. Please check it and try again.' : `Request failed (${response.status}). Check the details and try again.`)
  return response.json()
}

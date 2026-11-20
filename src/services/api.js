const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? 'http://localhost:3000/api' : ''
)

async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('El backend no está configurado para esta publicación.')
  }

  const requestOptions = {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {},
  }

  if (options.body !== undefined) {
    requestOptions.headers['Content-Type'] = 'application/json'
    requestOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions)
  let responseData = {}

  try {
    responseData = await response.json()
  } catch {
    responseData = {}
  }

  if (!response.ok) {
    throw new Error(responseData.message || 'No se pudo completar la solicitud.')
  }

  return responseData
}

export default apiRequest

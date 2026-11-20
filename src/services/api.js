const localApiBaseUrl = import.meta.env.DEV
  ? `http://${window.location.hostname || 'localhost'}:3000/api`
  : ''
const API_BASE_URL = import.meta.env.VITE_API_URL || localApiBaseUrl

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

  const timeoutController = options.timeoutMs ? new AbortController() : null
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), options.timeoutMs)
    : null

  if (timeoutController) {
    requestOptions.signal = timeoutController.signal
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestOptions)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La respuesta tardó demasiado. Puedes reintentar; se conservará el identificador del pedido para evitar duplicados.')
    }
    throw error
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
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

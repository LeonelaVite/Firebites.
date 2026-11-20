import { useEffect, useState } from 'react'
import apiRequest from '../services/api.js'

const emptyProduct = {
  name: '',
  description: '',
  flavor: '',
  spiceLevel: 'Suave',
  price: '',
}

function AdminPanel() {
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState([])
  const [requests, setRequests] = useState([])
  const [productForm, setProductForm] = useState(emptyProduct)
  const [editingProductId, setEditingProductId] = useState('')
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [notice, setNotice] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function checkSession() {
      try {
        const result = await apiRequest('/auth/me')
        if (result.authenticated) {
          setIsLoggedIn(true)
          setAdminEmail(result.email)
          await loadAdminData()
        }
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  async function loadAdminData() {
    try {
      const [productResult, requestResult] = await Promise.all([
        apiRequest('/products/admin/all'),
        apiRequest('/contact/admin/all'),
      ])
      setProducts(productResult.products)
      setRequests(requestResult.requests)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')

    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      setIsLoggedIn(true)
      setAdminEmail(result.email)
      setPassword('')
      await loadAdminData()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleLogout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      setIsLoggedIn(false)
      setAdminEmail('')
      setProducts([])
      setRequests([])
      setNotice('Sesión cerrada.')
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  function handleProductChange(event) {
    setProductForm({
      ...productForm,
      [event.target.name]: event.target.value,
    })
  }

  function startEditingProduct(product) {
    setEditingProductId(product._id)
    setProductForm({
      name: product.name,
      description: product.description,
      flavor: product.flavor,
      spiceLevel: product.spiceLevel,
      price: String(product.price),
    })
    setNotice('')
    setErrorMessage('')
  }

  function cancelEditingProduct() {
    setEditingProductId('')
    setProductForm(emptyProduct)
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    setIsSavingProduct(true)
    setNotice('')
    setErrorMessage('')

    const isEditing = Boolean(editingProductId)
    const path = isEditing ? `/products/${editingProductId}` : '/products'
    const method = isEditing ? 'PUT' : 'POST'

    try {
      await apiRequest(path, { method, body: productForm })
      setNotice(isEditing ? 'Producto actualizado.' : 'Producto creado.')
      cancelEditingProduct()
      await loadAdminData()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSavingProduct(false)
    }
  }

  async function deleteProduct(productId) {
    if (!window.confirm('¿Quieres eliminar este producto?')) {
      return
    }

    try {
      await apiRequest(`/products/${productId}`, { method: 'DELETE' })
      setNotice('Producto eliminado.')
      await loadAdminData()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function updateRequestStatus(requestId, status) {
    try {
      await apiRequest(`/contact/admin/${requestId}`, {
        method: 'PATCH',
        body: { status },
      })
      setNotice('Estado de la solicitud actualizado.')
      await loadAdminData()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function deleteRequest(requestId) {
    if (!window.confirm('¿Quieres eliminar esta solicitud?')) {
      return
    }

    try {
      await apiRequest(`/contact/admin/${requestId}`, { method: 'DELETE' })
      setNotice('Solicitud eliminada.')
      await loadAdminData()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <section className="admin-section" id="administracion">
      <div className="section-wrap">
        <div className="functional-heading">
          <p className="eyebrow"><span>●</span> Administración</p>
          <h2>Panel <span>FireBites.</span></h2>
          <p>Acceso para administrar los productos y las solicitudes recibidas.</p>
        </div>

        {isCheckingSession && <p className="admin-message">Comprobando la sesión…</p>}

        {!isCheckingSession && !isLoggedIn && (
          <form className="simple-form admin-login" onSubmit={handleLogin}>
            <h3>Iniciar sesión</h3>
            <label>
              Correo del administrador
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button button-primary" type="submit">Ingresar</button>
          </form>
        )}

        {!isCheckingSession && isLoggedIn && (
          <div className="admin-dashboard">
            <div className="admin-toolbar">
              <p>Sesión activa: <strong>{adminEmail}</strong></p>
              <button className="button admin-secondary-button" type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>

            <div className="admin-columns">
              <div className="admin-block">
                <h3>{editingProductId ? 'Editar producto' : 'Agregar producto'}</h3>
                <form className="simple-form admin-product-form" onSubmit={handleProductSubmit}>
                  <label>
                    Nombre
                    <input name="name" value={productForm.name} onChange={handleProductChange} required />
                  </label>
                  <label>
                    Descripción
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductChange}
                      rows="3"
                      required
                    />
                  </label>
                  <label>
                    Sabor
                    <input name="flavor" value={productForm.flavor} onChange={handleProductChange} required />
                  </label>
                  <label>
                    Nivel de picante
                    <select name="spiceLevel" value={productForm.spiceLevel} onChange={handleProductChange}>
                      <option>Suave</option>
                      <option>Medio</option>
                      <option>Intenso</option>
                    </select>
                  </label>
                  <label>
                    Precio
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="any"
                      value={productForm.price}
                      onChange={handleProductChange}
                      required
                    />
                  </label>
                  <div className="admin-form-actions">
                    <button className="button button-primary" type="submit" disabled={isSavingProduct}>
                      {isSavingProduct ? 'Guardando…' : editingProductId ? 'Guardar cambios' : 'Crear producto'}
                    </button>
                    {editingProductId && (
                      <button className="button admin-secondary-button" type="button" onClick={cancelEditingProduct}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                <h3 className="admin-subheading">Productos registrados</h3>
                {products.length === 0 && <p className="admin-message">No hay productos registrados.</p>}
                <div className="admin-record-list">
                  {products.map((product) => (
                    <article className="admin-record" key={product._id}>
                      <div>
                        <strong>{product.name}</strong>
                        <p>{product.flavor} · {product.spiceLevel}</p>
                      </div>
                      <div className="admin-record-actions">
                        <button type="button" onClick={() => startEditingProduct(product)}>Editar</button>
                        <button type="button" onClick={() => deleteProduct(product._id)}>Eliminar</button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="admin-block">
                <h3>Solicitudes de contacto</h3>
                {requests.length === 0 && <p className="admin-message">No hay solicitudes registradas.</p>}
                <div className="admin-record-list">
                  {requests.map((request) => (
                    <article className="admin-request" key={request._id}>
                      <div className="admin-request-heading">
                        <strong>{request.subject}</strong>
                        <span>{request.name} · {request.email}</span>
                      </div>
                      <p>{request.message}</p>
                      <div className="admin-form-actions">
                        <label className="request-status-label">
                          Estado
                          <select
                            value={request.status}
                            onChange={(event) => updateRequestStatus(request._id, event.target.value)}
                          >
                            <option>Nueva</option>
                            <option>Revisada</option>
                            <option>Resuelta</option>
                          </select>
                        </label>
                        <button
                          className="admin-danger-button"
                          type="button"
                          onClick={() => deleteRequest(request._id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {notice && <p className="form-success admin-feedback" role="status">{notice}</p>}
        {errorMessage && <p className="form-error admin-feedback" role="alert">{errorMessage}</p>}
      </div>
    </section>
  )
}

export default AdminPanel

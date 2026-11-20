import { useState } from 'react'
import apiRequest from '../services/api.js'

const emptyForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

function ContactSection() {
  const [form, setForm] = useState(emptyForm)
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
    setSuccessMessage('')
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSending(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const result = await apiRequest('/contact', {
        method: 'POST',
        body: form,
      })
      setSuccessMessage(result.message)
      setForm(emptyForm)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="functional-section section-wrap" id="contacto">
      <div className="functional-heading">
        <p className="eyebrow"><span>●</span> Hablemos</p>
        <h2>¿Tienes una pregunta<br /><span>con mucho sabor?</span></h2>
        <p>Déjanos tu mensaje y quedará registrado para que el equipo FireBites lo revise.</p>
      </div>

      <form className="simple-form contact-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            minLength="2"
            maxLength="80"
            required
          />
        </label>
        <label>
          Correo electrónico
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            maxLength="120"
            required
          />
        </label>
        <label>
          Asunto
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            minLength="2"
            maxLength="120"
            required
          />
        </label>
        <label>
          Mensaje
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            minLength="5"
            maxLength="1500"
            rows="4"
            required
          />
        </label>
        <button className="button button-primary" type="submit" disabled={isSending}>
          {isSending ? 'Enviando…' : 'Enviar mensaje'}
        </button>
        {successMessage && <p className="form-success" role="status">{successMessage}</p>}
        {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
      </form>
    </section>
  )
}

export default ContactSection

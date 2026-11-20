import { useState } from 'react'
import apiRequest from '../services/api.js'
import ProductCard from './ProductCard.jsx'

function AssistantChat() {
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '¡Hola! Cuéntame qué sabores o nivel de picante prefieres y buscaré opciones del catálogo.',
      products: [],
    },
  ])

  async function handleSubmit(event) {
    event.preventDefault()
    const customerQuestion = question.trim()

    if (!customerQuestion || isSending) {
      return
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'customer', text: customerQuestion, products: [] },
    ])
    setQuestion('')
    setIsSending(true)

    try {
      const result = await apiRequest('/assistant', {
        method: 'POST',
        body: { message: customerQuestion },
      })

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          text: result.reply,
          products: result.products,
        },
      ])
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: error.message, products: [] },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="assistant-section" id="asistente">
      <div className="section-wrap assistant-layout">
        <div className="functional-heading">
          <p className="eyebrow"><span>●</span> FireBites Assistant</p>
          <h2>Encuentra tu<br /><span>próximo antojo.</span></h2>
          <p>El asistente usa el catálogo disponible para recomendar productos según tus gustos.</p>
        </div>

        <div className="chat-panel">
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.text}</p>
                {message.products.map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))}
              </div>
            ))}
            {isSending && <p className="chat-status">Buscando en el catálogo…</p>}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="assistant-question">Tu pregunta</label>
            <input
              id="assistant-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength="500"
              placeholder="¿Qué sabor me recomiendas?"
              required
            />
            <button className="button button-primary" type="submit" disabled={isSending}>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AssistantChat

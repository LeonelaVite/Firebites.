import nodemailer from 'nodemailer'

const requiredEmailVariables = [
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'ORDER_NOTIFICATION_EMAIL',
]

function readEmailConfiguration() {
  const values = {
    GMAIL_USER: process.env.GMAIL_USER?.trim(),
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD?.trim(),
    ORDER_NOTIFICATION_EMAIL: process.env.ORDER_NOTIFICATION_EMAIL?.trim(),
  }

  const missingVariables = requiredEmailVariables.filter((name) => !values[name])
  return { values, missingVariables }
}

function createGmailTransporter(values) {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: values.GMAIL_USER,
      pass: values.GMAIL_APP_PASSWORD.replace(/\s/g, ''),
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

function safeGmailError(error) {
  if (['EDNS', 'EAI_AGAIN', 'ENOTFOUND'].includes(error.code)) {
    return 'No se pudo resolver smtp.gmail.com por DNS. Revisa el DNS activo o la conexión de red del equipo.'
  }

  if (error.code === 'EAUTH' || error.responseCode === 535 || error.command === 'AUTH') {
    return 'Gmail rechazó la autenticación. Comprueba que GMAIL_USER sea la cuenta que generó la contraseña de aplicación y que GMAIL_APP_PASSWORD siga vigente.'
  }

  if (['ETIMEDOUT', 'ECONNECTION', 'ECONNREFUSED', 'EHOSTUNREACH'].includes(error.code)) {
    return 'No se pudo conectar con Gmail SMTP por la red. Revisa Internet o si el firewall bloquea el puerto 465.'
  }

  if (error.code === 'ESOCKET' || error.code === 'ETLS') {
    return 'Falló la conexión segura TLS con Gmail SMTP. Revisa la fecha del equipo y el acceso seguro al puerto 465.'
  }

  if (error.code === 'EENVELOPE' || [550, 553, 554].includes(error.responseCode)) {
    return 'Gmail rechazó el remitente o destinatario. Comprueba GMAIL_USER y ORDER_NOTIFICATION_EMAIL.'
  }

  const diagnosticCode = /^[A-Z0-9_-]{1,20}$/.test(error.code || '')
    ? error.code
    : 'NO_DISPONIBLE'
  return `Gmail no aceptó el envío (código técnico ${diagnosticCode}). Revisa la configuración SMTP y vuelve a intentarlo.`
}

function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function escapeHtml(value) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return String(value).replace(/[&<>"']/g, (character) => replacements[character])
}

async function verifyGmailConnection() {
  const { values, missingVariables } = readEmailConfiguration()
  if (missingVariables.length > 0) {
    return {
      status: 'not-configured',
      message: `Faltan estas variables de entorno: ${missingVariables.join(', ')}.`,
    }
  }

  try {
    await createGmailTransporter(values).verify()
    return {
      status: 'connected',
      message: 'Gmail SMTP aceptó la conexión y la autenticación. No se envió ningún correo.',
    }
  } catch (error) {
    return {
      status: 'failed',
      message: safeGmailError(error),
      diagnosticCode: /^[A-Z0-9_-]{1,20}$/.test(error.code || '') ? error.code : 'NO_DISPONIBLE',
    }
  }
}

async function sendOrderNotification(order) {
  const { values, missingVariables } = readEmailConfiguration()
  if (missingVariables.length > 0) {
    return {
      status: 'not-configured',
      message: `Faltan estas variables de entorno: ${missingVariables.join(', ')}.`,
    }
  }

  const orderDate = new Date(order.createdAt).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
  })
  const itemLines = order.items.map((item) => (
    `${item.quantity} × ${item.name} | ${formatUSD(item.unitPrice)} cada uno | ${formatUSD(item.lineTotal)}`
  ))
  const text = [
    `Pedido FireBites: ${order.orderNumber}`,
    `Fecha y hora: ${orderDate}`,
    `Cliente: ${order.customerName}`,
    `Correo del cliente: ${order.customerEmail}`,
    '',
    'Productos:',
    ...itemLines,
    '',
    `Total del pedido: ${formatUSD(order.total)}`,
    'Estado: solicitud recibida; no se procesó ningún pago.',
  ].join('\n')

  const htmlItems = order.items.map((item) => (
    `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td><td>${formatUSD(item.unitPrice)}</td><td>${formatUSD(item.lineTotal)}</td></tr>`
  )).join('')
  const html = `
    <h1>Pedido FireBites ${escapeHtml(order.orderNumber)}</h1>
    <p><strong>Fecha y hora:</strong> ${escapeHtml(orderDate)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(order.customerName)}</p>
    <p><strong>Correo:</strong> ${escapeHtml(order.customerEmail)}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
      <tbody>${htmlItems}</tbody>
    </table>
    <p><strong>Total del pedido:</strong> ${formatUSD(order.total)}</p>
    <p>Solicitud recibida; no se procesó ningún pago.</p>
  `

  try {
    const result = await createGmailTransporter(values).sendMail({
      from: values.GMAIL_USER,
      to: values.ORDER_NOTIFICATION_EMAIL,
      replyTo: order.customerEmail,
      subject: `Nuevo pedido FireBites ${order.orderNumber}`,
      text,
      html,
    })
    const recipientWasAccepted = result.accepted.some((recipient) => {
      const address = typeof recipient === 'string' ? recipient : recipient.address
      return address?.toLowerCase() === values.ORDER_NOTIFICATION_EMAIL.toLowerCase()
    })

    if (!recipientWasAccepted) {
      return {
        status: 'rejected',
        message: 'Gmail no aceptó el destinatario configurado. Revisa ORDER_NOTIFICATION_EMAIL.',
      }
    }

    return {
      status: 'accepted',
      message: 'Gmail SMTP aceptó la notificación para entrega. Revisa Recibidos y Spam para confirmar su llegada.',
      messageId: result.messageId,
    }
  } catch (error) {
    return {
      status: 'failed',
      message: safeGmailError(error),
    }
  }
}

export { sendOrderNotification, verifyGmailConnection }

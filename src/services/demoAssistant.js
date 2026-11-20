import { calculateCartTotal, formatUSD } from './demoCart.js'

const productKnowledge = [
  {
    name: 'Mango en llamas',
    aliases: ['mango en llamas', 'mango', 'tropical'],
    description: 'Gomitas con sabor a mango y un perfil tropical, dulce y con un toque de chile.',
    flavorProfile: 'Mango: tropical, dulce y con un toque de chile.',
    recommendation: 'Ideal si te atrae un sabor frutal tropical de mango.',
  },
  {
    name: 'Fresa explosiva',
    aliases: ['fresa explosiva', 'fresa', 'frutilla', 'strawberry'],
    description: 'Gomitas con sabor a fresa, con dulzor frutal y un toque picante.',
    flavorProfile: 'Fresa: frutal, dulce y con un toque de chile.',
    recommendation: 'Una opción para quien prefiere el perfil dulce y frutal de la fresa.',
  },
  {
    name: 'Mix sin miedo',
    aliases: ['mix sin miedo', 'mix', 'mezcla', 'variado', 'variedad'],
    description: 'Mezcla de gomitas de sabores frutales, incluyendo fresa y mango, con un toque de chile.',
    flavorProfile: 'Mezcla frutal variada, con sabores de fresa y mango, dulce y con un toque de chile.',
    recommendation: 'Buena elección si prefieres probar varios sabores frutales en una sola mezcla.',
  },
]

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getProductKnowledge(product) {
  const productName = normalizeText(product.name)
  return productKnowledge.find((knowledge) => (
    normalizeText(knowledge.name) === productName
  ))
}

function getProductCards(products) {
  return products.map((product) => {
    const knowledge = getProductKnowledge(product)
    if (!knowledge) return null

    return {
      ...product,
      description: knowledge.description,
      flavor: knowledge.flavorProfile,
      spiceLevel: '',
    }
  }).filter(Boolean)
}

function findProductsInQuestion(question, products) {
  const normalizedQuestion = normalizeText(question)

  return products.filter((product) => {
    const knowledge = getProductKnowledge(product)
    if (!knowledge) return false

    return knowledge.aliases.some((alias) => (
      normalizedQuestion.includes(normalizeText(alias))
    ))
  })
}

function productPriceText(product) {
  const price = Number(product.price)
  return Number.isFinite(price)
    ? formatUSD(price)
    : 'precio no disponible en este momento'
}

function describeProduct(product) {
  const knowledge = getProductKnowledge(product)
  if (!knowledge) {
    return `${product.name}: consulta el catálogo para ver su descripción y precio actuales.`
  }

  return `${product.name}: ${knowledge.description} Precio actual: ${productPriceText(product)}.`
}

function getDemoAssistantReply(question, products = [], cartItems = [], recentOrders = []) {
  const normalizedQuestion = normalizeText(question)
  const safeProducts = Array.isArray(products) ? products : []
  const safeCart = Array.isArray(cartItems) ? cartItems : []
  const safeOrders = Array.isArray(recentOrders) ? recentOrders : []
  const matchedProducts = findProductsInQuestion(normalizedQuestion, safeProducts)
  const asksForPrice = /\b(precio|precios|cuesta|cuestan|vale|valen|valor|cuanto|cuantos|coste|costo)\b/.test(normalizedQuestion)
  const asksAboutSpice = /\b(picante|pica|picoso|picosa|chile|aji|ardor|nivel de picante)\b/.test(normalizedQuestion)
  const asksForIngredients = /\b(ingrediente|ingredientes|alergia|alergeno|alergenos|contiene|composicion|hecho|lleva)\b/.test(normalizedQuestion)
  const asksForRecommendation = /\b(recomienda|recomiendas|recomiendame|recomendacion|sugiere|sugiereme|sugerencia|elegir|escojo|antojo|prefiero|me gusta|me gustan|quiero algo)\b/.test(normalizedQuestion)
  const asksForCatalog = /\b(productos|catalogo|opciones|sabores|que venden|que ofrecen|que tienen)\b/.test(normalizedQuestion)
  const asksAboutCombinations = /\b(combinacion|combinaciones|frutas|frutales|mezcla)\b/.test(normalizedQuestion)

  if (/\b(pedido|pedidos|orden|ordenes)\b/.test(normalizedQuestion)) {
    if (safeOrders.length === 0) {
      return {
        handled: true,
        reply: 'Todavía no veo pedidos registrados en esta sesión. Puedes elegir productos del catálogo, agregarlos al carrito y enviarnos tu nombre y correo para recibir tu solicitud.',
        products: [],
      }
    }

    const latestOrder = safeOrders[0]
    return {
      handled: true,
      reply: `En esta sesión tienes ${safeOrders.length} solicitud(es). La más reciente es ${latestOrder.orderNumber}, por ${formatUSD(Number(latestOrder.total) || 0)}.`,
      products: [],
    }
  }

  if (/\b(carrito|total|subtotal)\b/.test(normalizedQuestion)) {
    const resolvedItems = safeCart.map((item) => {
      const product = safeProducts.find((currentProduct) => (
        String(currentProduct._id || currentProduct.id) === String(item.id || item.productId)
      ))
      return product ? { ...item, price: Number(product.price) } : null
    }).filter((item) => item && Number.isFinite(item.price))

    if (resolvedItems.length === 0) {
      return {
        handled: true,
        reply: 'Tu carrito está vacío. Agrega un producto del catálogo para consultar el total.',
        products: [],
      }
    }

    return {
      handled: true,
      reply: `Tu carrito tiene ${resolvedItems.reduce((total, item) => total + Number(item.quantity || 0), 0)} producto(s). El total actual es ${formatUSD(calculateCartTotal(resolvedItems))}.`,
      products: [],
    }
  }

  if (asksForIngredients) {
    const productName = matchedProducts[0]?.name
    return {
      handled: true,
      reply: `${productName ? `Sobre ${productName}, ` : ''}la información confirmada describe perfiles de sabor, pero no incluye una lista de ingredientes ni datos de alérgenos. No quiero adivinar esos datos; podemos consultarlos con el equipo de FireBites.`,
      products: [],
    }
  }

  if (asksAboutSpice) {
    const names = matchedProducts.map((product) => product.name)
    const subject = names.length > 0 ? `${names.join(' y ')} ` : 'Los productos del catálogo '
    return {
      handled: true,
      reply: `${subject}${names.length === 1 ? 'combina' : 'combinan'} sabores frutales dulces con un toque de chile. No tenemos un nivel de picante confirmado para compararlos o clasificarlos; si me dices qué sabor frutal prefieres, te recomiendo una opción por su perfil de sabor.`,
      products: getProductCards(matchedProducts),
    }
  }

  if (asksForRecommendation) {
    const mentionsMangoAndStrawberry = normalizedQuestion.includes('mango') && (
      normalizedQuestion.includes('fresa') || normalizedQuestion.includes('frutilla')
    )
    const wantsMix = mentionsMangoAndStrawberry || /\b(juntos|ambos|mezcla|mezclar|combinacion|combinaciones|variad|variedad|diferentes|mix|varios|varias)\b/.test(normalizedQuestion)
    let recommendations = matchedProducts

    if (wantsMix) {
      recommendations = safeProducts.filter((product) => normalizeText(product.name) === 'mix sin miedo')
    } else if (recommendations.length === 0) {
      recommendations = safeProducts.filter((product) => getProductKnowledge(product))
    }

    if (recommendations.length === 0) {
      return {
        handled: true,
        reply: 'Ahora mismo no puedo encontrar una opción disponible en el catálogo. Vuelve a intentarlo en un momento.',
        products: [],
      }
    }

    const recommendationText = recommendations.map((product) => {
      const knowledge = getProductKnowledge(product)
      return `${product.name}: ${knowledge.recommendation} ${productPriceText(product)}.`
    }).join(' ')

    return {
      handled: true,
      reply: recommendations.length === 1
        ? `Por lo que buscas, te recomiendo ${recommendationText}`
        : `Si aún estás decidiendo, estas son las opciones disponibles: ${recommendationText}`,
      products: getProductCards(recommendations),
    }
  }

  if (asksForPrice) {
    const productsToDescribe = matchedProducts.length > 0 ? matchedProducts : safeProducts
    return {
      handled: true,
      reply: productsToDescribe.length > 0
        ? productsToDescribe.map((product) => `${product.name}: ${productPriceText(product)}.`).join(' ')
        : 'No encuentro productos disponibles en el catálogo en este momento.',
      products: getProductCards(matchedProducts),
    }
  }

  if (matchedProducts.length > 0) {
    return {
      handled: true,
      reply: matchedProducts.map(describeProduct).join(' '),
      products: getProductCards(matchedProducts),
    }
  }

  if (asksForCatalog || asksAboutCombinations) {
    return {
      handled: true,
      reply: safeProducts.length > 0
        ? `En el catálogo actual tenemos: ${safeProducts.map(describeProduct).join(' ')}`
        : 'No encuentro productos disponibles en el catálogo en este momento.',
      products: [],
    }
  }

  if (/\b(hola|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(normalizedQuestion)) {
    return {
      handled: true,
      reply: '¡Hola! Te ayudo a elegir. ¿Te atrae más el perfil tropical del mango, el dulce frutal de la fresa o una mezcla de ambos?',
      products: [],
    }
  }

  return {
    handled: false,
    reply: 'Puedo ayudarte a elegir por sabor, conocer los precios del catálogo o revisar tu carrito. ¿Qué tipo de sabor frutal te gusta?',
    products: [],
  }
}

function getConfirmedProductInfo(product) {
  const knowledge = getProductKnowledge(product)
  if (!knowledge) return null

  return {
    name: product.name,
    description: knowledge.description,
    flavorProfile: knowledge.flavorProfile,
    price: Number(product.price),
    currency: product.currency || 'USD',
  }
}

export { getConfirmedProductInfo }
export default getDemoAssistantReply

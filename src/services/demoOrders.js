const storageKey = 'firebites-demo-orders'

function loadDemoOrders() {
  try {
    const savedOrders = localStorage.getItem(storageKey)
    const orders = savedOrders ? JSON.parse(savedOrders) : []
    return Array.isArray(orders) ? orders : []
  } catch {
    return []
  }
}

function saveDemoOrder(order) {
  const orders = loadDemoOrders()
  const updatedOrders = [order, ...orders]
  localStorage.setItem(storageKey, JSON.stringify(updatedOrders))
  return updatedOrders
}

export { loadDemoOrders, saveDemoOrder }

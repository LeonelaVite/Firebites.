function cartHasPrices(cartItems) {
  return cartItems.length > 0 && cartItems.every((item) => (
    Number.isFinite(item.price) && item.price >= 0
  ))
}

function calculateCartTotal(cartItems) {
  const totalInCents = cartItems.reduce((total, item) => {
    return total + Math.round(item.price * 100) * item.quantity
  }, 0)

  return totalInCents / 100
}

function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export { calculateCartTotal, cartHasPrices, formatUSD }

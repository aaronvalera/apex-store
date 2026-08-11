export const updateNavbarCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subtotalAmount = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

    const badge = document.getElementById("cart-badge");
    const itemsCount = document.getElementById("cart-total-items");
    const subtotal = document.getElementById("cart-subtotal");

    if (badge) badge.textContent = totalCount;
    if (itemsCount) itemsCount.textContent = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;
    if (subtotal) subtotal.textContent = `Subtotal: $${subtotalAmount.toFixed(2)}`;
};
document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('orders-container');
    
    const loadOrders = async () => {
        try {
            const response = await fetch('/api/orders');
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const renderOrders = (orders) => {
        ordersContainer.innerHTML = orders.length ? '' : '<div class="empty-message">No pending orders</div>';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <h3>Order #${order._id}</h3>
                    <p>${new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.itemId.name} × ${item.quantity}</span>
                    </div>
                `).join('')}
                <button class="complete-btn" data-order="${order._id}">Complete Order</button>
            `;

            orderCard.querySelector('.complete-btn').addEventListener('click', async () => {
                try {
                    await fetch(`/api/orders/${order._id}/complete`, { method: 'PATCH' });
                    orderCard.remove();
                    if (!ordersContainer.querySelector('.order-card')) {
                        ordersContainer.innerHTML = '<div class="empty-message">No pending orders</div>';
                    }
                } catch (error) {
                    console.error('Error completing order:', error);
                }
            });

            ordersContainer.appendChild(orderCard);
        });
    };

    // Refresh orders every 5 seconds
    loadOrders();
    setInterval(loadOrders, 5000);
});

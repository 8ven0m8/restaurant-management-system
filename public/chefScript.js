document.addEventListener('DOMContentLoaded', () => {
    const pendingContainer = document.getElementById('pending-orders');
    const completedContainer = document.getElementById('completed-orders');
    
    const loadOrders = async () => {
      try {
        const [pending, completed] = await Promise.all([
          fetch('/api/orders').then(res => res.json()),
          fetch('/api/orders/completed').then(res => res.json())
        ]);
        
        pendingContainer.innerHTML = '';
        completedContainer.innerHTML = '';
        
        renderOrders(pending, pendingContainer);
        renderOrders(completed, completedContainer, true);
        
      } catch (error) {
        console.error('Error:', error);
        pendingContainer.innerHTML = '<div class="error-message">Failed to load orders</div>';
      }
    };
  
    const renderOrders = (orders, container, isCompleted = false) => {
      if (orders.length === 0) {
        container.innerHTML = '<div class="empty-message">No orders found</div>';
        return;
      }
  
      orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = `order-card ${isCompleted ? 'completed' : ''}`;
        orderCard.innerHTML = `
          <div class="order-header">
            <h3>Table ${order.tableNumber}</h3>
            <div class="order-meta">
              <span>#${order._id.slice(-4)}</span>
              <span>${new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <span>${item.itemId.name}</span>
                <span>× ${item.quantity}</span>
              </div>
            `).join('')}
          </div>
          ${!isCompleted ? `
            <button class="complete-btn" data-order="${order._id}">
              Mark as Completed
            </button>
          ` : ''}
        `;
  
        if (!isCompleted) {
          orderCard.querySelector('.complete-btn').addEventListener('click', async () => {
            try {
              await fetch(`/api/orders/${order._id}/complete`, { method: 'PATCH' });
              loadOrders();
            } catch (error) {
              console.error('Error:', error);
            }
          });
        }
  
        container.appendChild(orderCard);
      });
    };
  
    // Initial load and refresh every 10 seconds
    loadOrders();
    setInterval(loadOrders, 10000);
  });
  
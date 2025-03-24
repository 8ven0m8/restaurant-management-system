document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.getElementById('container');
    const selectedContainer = document.getElementById('selected-items');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const tableNumberSelect = document.getElementById('table-number');
    const completedOrdersContainer = document.getElementById('completed-orders');
    let selectedItems = new Map();
  
    // Load menu items
    const loadMenu = async () => {
        try {
            const [menuResponse, completedResponse] = await Promise.all([
                fetch('/api/menu'),
                fetch('/api/orders/completed')
            ]);
            
            const items = await menuResponse.json();
            const completedOrders = await completedResponse.json();
            
            renderMenu(items);
            renderCompletedOrders(completedOrders);
        } catch (error) {
            menuContainer.innerHTML = '<div class="error-message">Failed to load data</div>';
        }
    };

    const loadCompletedOrders = async () => {
        try {
            const response = await fetch('/api/orders/completed');
            const orders = await response.json();
            renderCompletedOrders(orders);
        } catch (error) {
            console.error('Error loading completed orders:', error);
        }
    };

    const renderCompletedOrders = (orders) => {
        completedOrdersContainer.innerHTML = orders.length ? '' : '<div class="empty-message">No completed orders yet</div>';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'completed-order-card';
            orderCard.innerHTML = `
                <div class="completed-order-header">
                    <span class="completed-order-table">Table ${order.tableNumber}</span>
                    <div class="payment-status">
                        ${order.paid ? 
                            '<span class="paid-badge">Paid</span>' : 
                            `<button class="pay-btn" data-amount="${calculateTotal(order)}">Pay Now</button>`
                        }
                        <span class="completed-order-time">
                            ${new Date(order.completedAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.itemId.name}</span>
                        <span>× ${item.quantity}</span>
                        <span>₹${(item.itemId.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="order-total">
                    Total: ₹${calculateTotal(order).toFixed(2)}
                </div>
            `;
            completedOrdersContainer.prepend(orderCard); // Newest first
        });
    };
  
    // Render menu items
    const renderMenu = (items) => {
      menuContainer.innerHTML = items.length ? '' : '<div class="empty-message">No items in menu</div>';
      
      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}" 
               class="item-image" 
               alt="${item.name}">
          <div class="item-info">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description || 'No description provided'}</p>
            <p class="item-price">₹${item.price.toFixed(2)}</p>
          </div>
        `;
  
        card.addEventListener('click', () => {
          if (!selectedItems.has(item._id)) {
            selectedItems.set(item._id, {
              itemId: item._id,
              quantity: 1,
              details: item
            });
            updateSelectedItems();
          }
        });
  
        menuContainer.appendChild(card);
      });
    };
  
    // Update selected items display
    const updateSelectedItems = () => {
      selectedContainer.innerHTML = '';
      selectedItems.forEach((value, key) => {
        const div = document.createElement('div');
        div.className = 'selected-item';
        div.innerHTML = `
          <span>${value.details.name}</span>
          <input type="number" 
                 class="quantity-input" 
                 value="${value.quantity}" 
                 min="1" 
                 data-item="${key}"
                 onchange="updateQuantity(event)">
          <button onclick="removeItem('${key}')">×</button>
        `;
        selectedContainer.appendChild(div);
      });
    };
  
    // Place order handler
    placeOrderBtn.addEventListener('click', async () => {
      if (selectedItems.size === 0) {
        alert('Please select items to place order');
        return;
      }
  
      const tableNumber = parseInt(tableNumberSelect.value);
      if (!tableNumber || tableNumber < 1 || tableNumber > 20) {
        alert('Please select a valid table number (1-20)');
        return;
      }
  
      try {
        const orderItems = Array.from(selectedItems.values()).map(item => ({
          itemId: item.itemId,
          quantity: item.quantity
        }));
  
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber,
            items: orderItems
          })
        });
  
        if (response.ok) {
          selectedItems.clear();
          updateSelectedItems();
          tableNumberSelect.value = '1';
          alert('Order placed for Table ' + tableNumber);
        }
      } catch (error) {
        alert('Failed to place order');
      }
    });

    document.querySelectorAll('.pay-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
          const orderId = btn.closest('.completed-order-card').dataset.order;
          const amount = btn.dataset.amount;
          
          try {
              await fetch(`/api/orders/${orderId}/pay`, { method: 'PATCH' });
              await initiateUPIPayment(amount);
              loadCompletedOrders(); // Refresh
          } catch (error) {
              alert('Payment failed. Please try again.');
          }
      });
    });
    const calculateTotal = (order) => {
      return order.items.reduce((sum, item) => sum + (item.itemId.price * item.quantity), 0);
    };
  
    const initiateUPIPayment = (amount) => {
        const upiId = 'sapkotapranjal25@oksbi'; // Replace with your UPI ID
        const paymentLink = `upi://pay?pa=${upiId}&pn=Restaurant&am=${amount}&cu=INR`;
        window.location.href = paymentLink;
    };

  
    // Global functions for template
    window.updateQuantity = (event) => {
      const itemId = event.target.dataset.item;
      const quantity = parseInt(event.target.value);
      if (quantity > 0) selectedItems.get(itemId).quantity = quantity;
    };
  
    window.removeItem = (itemId) => {
      selectedItems.delete(itemId);
      updateSelectedItems();
    };
  
    loadMenu();
  });

  setInterval(() => {
    loadCompletedOrders();
    }, 5000);

  loadCompletedOrders();
  
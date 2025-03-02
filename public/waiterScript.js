document.addEventListener('DOMContentLoaded', async () => {
    const menuContainer = document.getElementById('container');
    const selectedContainer = document.getElementById('selected-items');
    const placeOrderBtn = document.getElementById('place-order-btn');
    let selectedItems = new Map();

    // Load menu items
    const loadMenu = async () => {
        try {
            const response = await fetch('/api/menu');
            const items = await response.json();
            renderMenu(items);
        } catch (error) {
            console.error('Error loading menu:', error);
        }
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
                    <p class="item-price">Rs.${item.price.toFixed(2)}</p>
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

        try {
            const orderItems = Array.from(selectedItems.values()).map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
            }));

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: orderItems })
            });

            if (response.ok) {
                selectedItems.clear();
                updateSelectedItems();
                alert('Order placed successfully!');
            }
        } catch (error) {
            console.error('Order placement failed:', error);
            alert('Failed to place order');
        }
    });

    // Quantity update handler
    window.updateQuantity = (event) => {
        const itemId = event.target.dataset.item;
        const quantity = parseInt(event.target.value);
        if (quantity > 0) {
            selectedItems.get(itemId).quantity = quantity;
        }
    };

    // Item removal handler
    window.removeItem = (itemId) => {
        selectedItems.delete(itemId);
        updateSelectedItems();
    };

    // Initial load
    loadMenu();
});

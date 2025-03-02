document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-button');
    const container = document.getElementById('container');
    
    const loadMenuItems = async () => {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Failed to fetch menu items');
            const items = await response.json();
            renderItems(items);
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div class="error-message">Failed to load menu items</div>';
        }
    };

    const renderItems = (items) => {
        container.innerHTML = items.length === 0 
            ? '<div class="empty-message">Add items for menu +</div>' 
            : '';
        
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <button class="delete-btn" aria-label="Delete item">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2">
                        <path d="M6 6L18 18M6 18L18 6" stroke-linecap="round"/>
                    </svg>
                </button>
                <img src="${item.imageUrl || 'https://via.placeholder.com/400x200'}" 
                     class="item-image" 
                     alt="${item.name}">
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description || 'No description provided'}</p>
                    <p class="item-price">Rs.${item.price.toFixed(2)}</p>
                </div>
            `;

            // Add delete functionality
            const deleteBtn = card.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', async () => {
                try {
                    await fetch(`/api/menu/${item._id}`, { method: 'DELETE' });
                    card.remove();
                    if (container.children.length === 0) {
                        container.innerHTML = '<div class="empty-message">Add items for menu +</div>';
                    }
                } catch (error) {
                    console.error('Delete failed:', error);
                }
            });

            container.appendChild(card);
        });
    };

    // Add new item
    addButton.addEventListener('click', async () => {
        const newItem = {
            name: document.getElementById('item-name').value.trim(),
            description: document.getElementById('item-desc').value.trim(),
            price: parseFloat(document.getElementById('item-price').value),
            imageUrl: document.getElementById('image-url').value.trim()
        };

        if (!newItem.name || isNaN(newItem.price)) {
            alert('Please provide valid item name and price');
            return;
        }

        try {
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            if (response.ok) {
                const savedItem = await response.json();
                const cards = container.querySelectorAll('.item-card');
                container.innerHTML = ''; // Clear existing items
                renderItems([savedItem, ...cards.map(card => {
                    return {
                        _id: card.dataset.id,
                        ...JSON.parse(card.dataset.item)
                    }
                })]);
            }
        } catch (error) {
            console.error('Submission failed:', error);
        }
    });

    // Initial load
    loadMenuItems();
});

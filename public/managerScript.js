document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-button');
    const container = document.getElementById('container');

    // Load initial menu items from database
    const loadMenuItems = async () => {
        try {
            const response = await fetch('/api/menu');
            if (!response.ok) throw new Error('Failed to fetch menu');
            const items = await response.json();
            renderItems(items);
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div class="error-message">Failed to load menu. Please refresh.</div>';
        }
    };

    // Render menu items
    const renderItems = (items) => {
        container.innerHTML = items.length === 0 
            ? '<div class="empty-message">Add items for menu +</div>'
            : '';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <button class="delete-btn" aria-label="Delete item" data-id="${item._id}">
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
            card.querySelector('.delete-btn').addEventListener('click', async () => {
                try {
                    const response = await fetch(`/api/menu/${item._id}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) throw new Error('Delete failed');
                    
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.remove();
                        if (!container.querySelector('.item-card')) {
                            container.innerHTML = '<div class="empty-message">Add items for menu +</div>';
                        }
                    }, 300);
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('Failed to delete item. Please try again.');
                }
            });

            container.appendChild(card);
        });
    };

    // Handle new item submission
    addButton.addEventListener('click', async (e) => {
        e.preventDefault();

        const newItem = {
            name: document.getElementById('item-name').value.trim(),
            description: document.getElementById('item-desc').value.trim(),
            price: parseFloat(document.getElementById('item-price').value),
            imageUrl: document.getElementById('image-url').value.trim()
        };

        // Validation
        if (!newItem.name || isNaN(newItem.price)) {
            alert('Please provide at least a valid name and price');
            return;
        }

        try {
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem)
            });

            if (!response.ok) throw new Error('Failed to save item');
            
            const savedItem = await response.json();
            
            // Add new item to display
            if (container.querySelector('.empty-message')) {
                container.innerHTML = '';
            }
            
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <!-- Same card structure as above -->
            `;
            container.appendChild(card);

            // Clear form
            document.getElementById('image-url').value = '';
            document.getElementById('item-name').value = '';
            document.getElementById('item-desc').value = '';
            document.getElementById('item-price').value = '';

        } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to save item. Please try again.');
        }
    });

    // Initial load
    loadMenuItems();
});

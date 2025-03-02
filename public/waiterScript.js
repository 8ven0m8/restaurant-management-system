document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('container');
    
    try {
        const response = await fetch('/api/menu');
        const items = await response.json();
        
        container.innerHTML = items.length ? '' : '<div class="empty-message">No items in menu</div>';
        
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
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Failed to load menu:', error);
        container.innerHTML = '<div class="error-message">Failed to load menu. Please refresh.</div>';
    }
});

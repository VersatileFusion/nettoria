// Services Management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    loadServices();
    
    // Initialize cart icon
    initializeCartIcon();
});

// Load services from the backend
async function loadServices(page = 1, limit = 12) {
    try {
        showLoading();
        
        const response = await fetch(`/api/services?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load services');
        
        const data = await response.json();
        renderServices(data.services);
        renderPagination(data.pagination);
        
        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('error', 'Failed to load services');
    }
}

// Render services in the grid
function renderServices(services) {
    const servicesGrid = document.querySelector('.services-grid');
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesGrid.appendChild(serviceCard);
    });
}

// Create a service card element
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    card.innerHTML = `
        <div class="service-header">
            <h3>${service.name}</h3>
            <span class="service-type">${service.type}</span>
        </div>
        <div class="service-specs">
            <div class="spec-item">
                <i class='bx bx-chip'></i>
                <span>${service.resources.cpu} CPU</span>
            </div>
            <div class="spec-item">
                <i class='bx bx-memory-card'></i>
                <span>${service.resources.memoryGB} GB RAM</span>
            </div>
            <div class="spec-item">
                <i class='bx bx-hdd'></i>
                <span>${service.resources.storageGB} GB Storage</span>
            </div>
            <div class="spec-item">
                <i class='bx bx-transfer'></i>
                <span>${service.resources.bandwidth} GB Bandwidth</span>
            </div>
        </div>
        <div class="service-price">
            <div class="price-amount">
                ${service.price.amount} ${service.price.currency}
            </div>
            <div class="price-period">
                / ${service.price.billingCycle}
            </div>
        </div>
        <div class="service-actions">
            <button class="btn btn-primary add-to-cart" data-service-id="${service.id}">
                <i class='bx bx-cart-add'></i>
                Add to Cart
            </button>
            <button class="btn btn-secondary view-details" data-service-id="${service.id}">
                <i class='bx bx-info-circle'></i>
                Details
            </button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(service));
    card.querySelector('.view-details').addEventListener('click', () => viewServiceDetails(service));
    
    return card;
}

// Render pagination
function renderPagination(pagination) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
    
    const { currentPage, totalPages } = pagination;
    
    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.innerHTML = '<i class="bx bx-chevron-right"></i>';
        prevButton.addEventListener('click', () => loadServices(currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => loadServices(i));
        paginationContainer.appendChild(pageButton);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn';
        nextButton.innerHTML = '<i class="bx bx-chevron-left"></i>';
        nextButton.addEventListener('click', () => loadServices(currentPage + 1));
        paginationContainer.appendChild(nextButton);
    }
}

// Add service to cart
async function addToCart(service) {
    try {
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                serviceId: service.id,
                quantity: 1
            })
        });
        
        if (!response.ok) throw new Error('Failed to add service to cart');
        
        showToast('success', 'Service added to cart');
        updateCartCount();
    } catch (error) {
        showToast('error', 'Failed to add service to cart');
    }
}

// View service details
function viewServiceDetails(service) {
    // Redirect to service details page
    window.location.href = `/service-details.html?id=${service.id}`;
}

// Initialize cart icon
function initializeCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            window.location.href = '/cart.html';
        });
    }
    updateCartCount();
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to get cart count');
        
        const data = await response.json();
        const cartIcon = document.getElementById('cart-icon');
        
        if (cartIcon && data.count > 0) {
            cartIcon.setAttribute('data-count', data.count);
        }
    } catch (error) {
        console.error('Failed to update cart count:', error);
    }
}

// Show loading spinner
function showLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

// Hide loading spinner
function hideLoading() {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Show toast notification
function showToast(type, message) {
    const toast = document.querySelector('.toast');
    if (toast) {
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Services Management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize services
    loadServices();

    // Initialize cart icon
    initializeCartIcon();

    // Add search functionality
    initializeSearch();

    // Add filter functionality
    initializeFilters();
});

// Load services from the backend
async function loadServices(page = 1, limit = 12, filters = {}) {
    try {
        showLoading();

        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            limit: limit,
            ...filters
        });

        const response = await fetch(`/api/services?${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load services');
        }

        const data = await response.json();
        renderServices(data.services);
        renderPagination(data.pagination);

        hideLoading();
    } catch (error) {
        hideLoading();
        showToast('error', `خطا در بارگذاری خدمات: ${error.message}`);
        console.error('Error loading services:', error);
    }
}

// Render services in the grid
function renderServices(services) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;

    servicesGrid.innerHTML = '';

    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="no-services">
                <i class='bx bx-package'></i>
                <h3>هیچ خدمتی یافت نشد</h3>
                <p>لطفا فیلترهای خود را تغییر دهید یا بعداً مراجعه کنید.</p>
            </div>
        `;
        return;
    }

    services.forEach(service => {
        const serviceCard = createServiceCard(service);
        servicesGrid.appendChild(serviceCard);
    });
}

// Create a service card element
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card';

    // Calculate discount if applicable
    const hasDiscount = service.originalPrice && service.originalPrice > service.price.amount;
    const discountPercentage = hasDiscount ? Math.round(((service.originalPrice - service.price.amount) / service.originalPrice) * 100) : 0;

    card.innerHTML = `
        <div class="service-header">
            <h3>${service.name}</h3>
            <span class="service-type">${service.type}</span>
            ${hasDiscount ? `<span class="discount-badge">${discountPercentage}% تخفیف</span>` : ''}
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
            ${hasDiscount ? `<div class="original-price">${service.originalPrice.toLocaleString()} ${service.price.currency}</div>` : ''}
            <div class="price-amount">
                ${service.price.amount.toLocaleString()} ${service.price.currency}
            </div>
            <div class="price-period">
                / ${service.price.billingCycle}
            </div>
        </div>
        <div class="service-actions">
            <button class="btn btn-primary add-to-cart" data-service-id="${service.id}">
                <i class='bx bx-cart-add'></i>
                افزودن به سبد خرید
            </button>
            <button class="btn btn-secondary view-details" data-service-id="${service.id}">
                <i class='bx bx-info-circle'></i>
                جزئیات
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
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.innerHTML = '<i class="bx bx-chevron-right"></i>';
        prevButton.addEventListener('click', () => loadServices(currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
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
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('error', 'لطفا ابتدا وارد حساب کاربری خود شوید');
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                serviceId: service.id,
                quantity: 1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add service to cart');
        }

        const data = await response.json();
        showToast('success', 'خدمت با موفقیت به سبد خرید اضافه شد');
        updateCartCount();

        // Update cart icon with animation
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('cart-added');
            setTimeout(() => cartIcon.classList.remove('cart-added'), 1000);
        }
    } catch (error) {
        showToast('error', `خطا در افزودن به سبد خرید: ${error.message}`);
        console.error('Error adding to cart:', error);
    }
}

// View service details
function viewServiceDetails(service) {
    // Store service data in session storage for the details page
    sessionStorage.setItem('selectedService', JSON.stringify(service));

    // Redirect to service details page
    window.location.href = `/service-details.html?id=${service.id}`;
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length >= 2 || searchTerm.length === 0) {
                loadServices(1, 12, { search: searchTerm });
            }
        }, 500);
    });
}

// Initialize filters
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.filter;
            const filterValue = btn.dataset.value;

            // Toggle active state
            btn.classList.toggle('active');

            // Get all active filters
            const activeFilters = {};
            document.querySelectorAll('.filter-btn.active').forEach(activeBtn => {
                const type = activeBtn.dataset.filter;
                const value = activeBtn.dataset.value;

                if (!activeFilters[type]) {
                    activeFilters[type] = [];
                }
                activeFilters[type].push(value);
            });

            // Apply filters
            loadServices(1, 12, activeFilters);
        });
    });
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
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/cart/count', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to get cart count');

        const data = await response.json();
        const cartIcon = document.getElementById('cart-icon');

        if (cartIcon && data.count > 0) {
            cartIcon.setAttribute('data-count', data.count);
            cartIcon.classList.add('has-items');
        } else if (cartIcon) {
            cartIcon.removeAttribute('data-count');
            cartIcon.classList.remove('has-items');
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
    const toastContainer = document.querySelector('.toast');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-x-circle' : 'bx-info-circle'}'></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);

    // Remove on click
    toast.addEventListener('click', () => {
        toast.remove();
    });
}

// Export functions for use in other modules
window.ServicesModule = {
    loadServices,
    addToCart,
    viewServiceDetails,
    updateCartCount
};

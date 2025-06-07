document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page loaded');
    
    const cart = window.getCart ? window.getCart() : { items: [] };
    
    // استفاده از آیتم‌های استاتیک HTML برای نمایش در حالت دمو
    if (document.querySelector('.order-item')) {
        console.log('Using static HTML orders');
        return;
    }
    
    function formatPrice(price) {
        return price.toLocaleString('fa-IR') + ' ریال';
    }

    function updateOrdersList() {
        const ordersList = document.querySelector('.orders-list');
        if (!ordersList) return;
        
        // پاک کردن آیتم‌های موجود
        ordersList.innerHTML = '';
        
        // اگر سبد خرید خالی است
        if (!cart || !cart.items || cart.items.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-cart">
                    <h3>سبد خرید شما خالی است</h3>
                    <p>برای افزودن سرویس به سبد خرید، به صفحه اصلی بروید.</p>
                </div>
            `;
            return;
        }
        
        // افزودن آیتم‌ها به لیست
        cart.items.forEach(item => {
            const discount = item.duration >= 12 ? 20 : 
                             item.duration >= 6 ? 15 : 
                             item.duration >= 3 ? 10 : 0;
            
            const hasDiscount = discount > 0;
            const originalPrice = item.price;
            const discountedPrice = Math.round(originalPrice * (1 - discount/100));
            
            const orderHTML = `
                <div class="order-item" data-code="${item.code}">
                    <div class="order-info">
                        <h3>${item.name}</h3>
                        <span class="order-code">${item.code}</span>
                        <div class="order-term">
                            مدت: ${item.duration || 1} ماه
                            ${hasDiscount ? `<span class="discount-tag">${discount}% تخفیف</span>` : ''}
                        </div>
                    </div>
                    <div class="order-price">
                        ${hasDiscount ? 
                            `<span class="original-price">${formatPrice(originalPrice)} ماهانه</span>` : ''}
                        <span>${formatPrice(discountedPrice)} ماهانه</span>
                    </div>
                </div>
            `;
            
            ordersList.innerHTML += orderHTML;
        });
    }
    
    function updateSummary() {
        if (!cart || !cart.items) return;
        
        // محاسبه مجموع
        let subtotal = 0;
        
        cart.items.forEach(item => {
            const discount = item.duration >= 12 ? 20 : 
                             item.duration >= 6 ? 15 : 
                             item.duration >= 3 ? 10 : 0;
            
            const price = item.price * (1 - discount/100) * (item.duration || 1);
            subtotal += price;
        });
        
        const tax = subtotal * 0.09; // 9% مالیات
        const total = subtotal + tax;
        
        // به‌روزرسانی مقادیر در HTML
        const summaryRows = document.querySelectorAll('.summary-row');
        if (summaryRows.length >= 3) {
            summaryRows[0].querySelector('span:last-child').textContent = formatPrice(subtotal);
            summaryRows[1].querySelector('span:last-child').textContent = formatPrice(tax);
            summaryRows[2].querySelector('span:last-child').textContent = formatPrice(total);
        }
    }
    
    // اضافه کردن لیسنرها برای دکمه‌ها
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!cart || !cart.items || cart.items.length === 0) {
                alert('سبد خرید شما خالی است');
                return;
            }
            alert('در حال انتقال به درگاه پرداخت...');
        });
    }
    
    const addServiceBtn = document.querySelector('.add-service-btn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            window.location.href = './index.html';
        });
    }
    
    // آپدیت کردن UI هنگام لود صفحه
    updateOrdersList();
    updateSummary();

    // Initialize edit and delete buttons
    initCartItemButtons();
    
    // Display cart items if they exist
    displayCartItems();
    
    // Update total price
    updateCartSummary();
    
    // Setup discount code
    setupDiscountCode();

    // Check if URL has test parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test')) {
        addSampleItems();
    }
});

// Initialize cart item edit and delete buttons
function initCartItemButtons() {
    console.log('Initializing cart buttons');
    
    // Setup edit buttons
    document.querySelectorAll('.edit-item').forEach(button => {
        console.log('Adding edit listener to button');
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productCode = cartItem.querySelector('.product-code').textContent;
            console.log('Edit clicked for product code:', productCode);
            
            // Get cart items from storage
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Find the item to edit
            const itemToEdit = cartItems.find(item => item.code === productCode);
            
            if (itemToEdit) {
                console.log('Found item to edit:', itemToEdit);
                // Save the item for editing on the select-service page
                localStorage.setItem('editingService', JSON.stringify({
                    serviceName: itemToEdit.name,
                    duration: itemToEdit.duration || 1,
                    datacenter: itemToEdit.extras?.datacenter,
                    os: itemToEdit.extras?.os,
                    extras: itemToEdit.extras
                }));
                
                // Remove the item from cart while editing
                const updatedCart = cartItems.filter(item => item.code !== productCode);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                
                // Save original product for selecting service page
                localStorage.setItem('selectedService', JSON.stringify({
                    name: itemToEdit.name,
                    code: itemToEdit.code,
                    price: itemToEdit.price,
                    type: itemToEdit.type
                }));
                
                // Redirect to selection page
                window.location.href = 'select-service.html';
            } else {
                console.error('Item not found in cart for editing');
            }
        });
    });
    
    // Setup delete buttons
    document.querySelectorAll('.delete-item').forEach(button => {
        console.log('Adding delete listener to button');
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const productCode = cartItem.querySelector('.product-code').textContent;
            console.log('Delete clicked for product code:', productCode);
            
            // Confirm before deleting
            if (confirm('آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟')) {
                // Get cart items
                const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
                console.log('Current cart items:', cartItems);
                
                // Filter out the item to delete
                const updatedCart = cartItems.filter(item => item.code !== productCode);
                console.log('Updated cart items after delete:', updatedCart);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                
                // Remove item from DOM
                cartItem.remove();
                
                // Update cart summary
                updateCartSummary();
                
                // Update cart icon count
                updateCartCount();
                
                // If cart is empty, show message
                if (updatedCart.length === 0) {
                    displayEmptyCartMessage();
                }
            }
        });
    });
}

// Display cart items from localStorage
function displayCartItems() {
    console.log('Displaying cart items');
    const cartItemsSection = document.querySelector('.cart-items-section');
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log('Cart items from storage:', cartItems);
    
    // Clear existing items (except title and subtitle)
    const title = cartItemsSection.querySelector('.cart-title');
    const subtitle = cartItemsSection.querySelector('.cart-subtitle');
    cartItemsSection.innerHTML = '';
    
    // Re-add title and subtitle
    if (title && subtitle) {
        cartItemsSection.appendChild(title);
        cartItemsSection.appendChild(subtitle);
    }
    
    if (cartItems.length === 0) {
        console.log('Cart is empty, showing empty message');
        displayEmptyCartMessage();
        return;
    }
    
    // Add each cart item
    cartItems.forEach(item => {
        console.log('Creating element for item:', item);
        const discountPercent = calculateDiscount(item.duration || 1);
        const originalPrice = item.price;
        const finalPrice = Math.round(originalPrice * (1 - discountPercent));
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        let durationHTML = `مدت: ${item.duration || 1} ماه`;
        if (discountPercent > 0) {
            durationHTML += `<span class="discount-badge">${discountPercent * 100}% تخفیف</span>`;
        }
        
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <div class="product-info">
                    <h3 class="product-name">${item.name}</h3>
                    <div class="product-code">${item.code}</div>
                    <div class="product-duration">
                        ${durationHTML}
                    </div>
                    <div class="product-datacenter">دیتاسنتر: تهران</div>
                </div>
                <div class="price-section">
                    ${discountPercent > 0 ? 
                        `<span class="original-price">${originalPrice.toLocaleString()} ریال ماهانه</span>` : ''}
                    <span class="final-price">${finalPrice.toLocaleString()} ریال ماهانه</span>
                </div>
            </div>
            <div class="cart-actions">
                <i class="bx bx-pencil edit-item"></i>
                <i class="bx bx-trash delete-item"></i>
            </div>
        `;
        
        cartItemsSection.appendChild(itemElement);
    });
    
    // Reinitialize buttons after adding new items
    console.log('Reinitializing buttons after adding items');
    initCartItemButtons();
}

// Display empty cart message
function displayEmptyCartMessage() {
    const cartItemsSection = document.querySelector('.cart-items-section');
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-cart-message';
    emptyMessage.innerHTML = `
        <div class="empty-cart-content">
            <h2>سبد خرید شما خالی است</h2>
            <a href="./index.html" class="home-btn">
                <i class="bx bx-shopping-bag"></i>
                مشاهده سرویس‌ها
            </a>
        </div>
    `;
    cartItemsSection.appendChild(emptyMessage);
    
    // Hide the cart summary if cart is empty
    const cartSummary = document.querySelector('.cart-summary');
    if (cartSummary) {
        cartSummary.style.display = 'none';
    }
}

// Calculate discount based on duration
function calculateDiscount(duration) {
    if (duration >= 12) {
        return 0.2; // 20% discount for 12 months
    } else if (duration >= 6) {
        return 0.15; // 15% discount for 6 months
    } else if (duration >= 3) {
        return 0.1; // 10% discount for 3 months
    }
    return 0;
}

// Update cart summary prices
function updateCartSummary() {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length === 0) {
        return;
    }
    
    // Calculate total price
    let totalOriginalPrice = 0;
    let totalFinalPrice = 0;
    
    cartItems.forEach(item => {
        const discount = calculateDiscount(item.duration || 1);
        const duration = item.duration || 1;
        
        // Calculate per item
        const originalPrice = item.price * duration;
        const finalPrice = Math.round(originalPrice * (1 - discount));
        
        totalOriginalPrice += originalPrice;
        totalFinalPrice += finalPrice;
    });
    
    // Calculate tax
    const taxRate = 0.09; // 9% VAT
    const taxAmount = Math.round(totalFinalPrice * taxRate);
    const totalPayable = totalFinalPrice + taxAmount;
    
    // Update DOM
    const priceRows = document.querySelectorAll('.price-row');
    if (priceRows.length >= 3) {
        // Total price
        priceRows[0].querySelector('span:last-child').textContent = 
            `${totalOriginalPrice.toLocaleString()} ریال`;
        
        // Tax
        priceRows[1].querySelector('span:last-child').textContent = 
            `${taxAmount.toLocaleString()} ریال`;
        
        // Final price
        priceRows[2].querySelector('span:last-child').textContent = 
            `${totalPayable.toLocaleString()} ریال`;
    }
}

// Update cart count in the header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        cartCount.textContent = cartItems.length;
    }
}

// Setup discount code functionality
function setupDiscountCode() {
    const discountInput = document.querySelector('.discount-code input');
    if (discountInput) {
        discountInput.addEventListener('input', function() {
            // Convert to uppercase and limit to 8 characters
            this.value = this.value.toUpperCase().substring(0, 8);
        });
        
        discountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyDiscountCode();
            }
        });
        
        // Add button if doesn't exist
        if (!document.querySelector('.apply-discount-btn')) {
            const applyBtn = document.createElement('button');
            applyBtn.className = 'apply-discount-btn';
            applyBtn.textContent = 'اعمال';
            applyBtn.onclick = applyDiscountCode;
            
            discountInput.parentNode.appendChild(applyBtn);
            
            // Add style for the button
            const style = document.createElement('style');
            style.textContent = `
                .discount-code {
                    position: relative;
                }
                .apply-discount-btn {
                    position: absolute;
                    right: 5px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(30, 58, 138, 0.8);
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                .apply-discount-btn:hover {
                    background: rgba(30, 58, 138, 1);
                }
                .discount-code input {
                    padding-right: 70px;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Apply discount code
function applyDiscountCode() {
    const discountInput = document.querySelector('.discount-code input');
    if (!discountInput || !discountInput.value) return;
    
    const discountCode = discountInput.value.toUpperCase();
    
    // Mock discount codes for demonstration
    const validDiscounts = {
        'WELCOME': 0.1,  // 10% off
        'NETTORIA': 0.15, // 15% off
        'VIP2024': 0.2   // 20% off
    };
    
    if (validDiscounts[discountCode]) {
        alert(`کد تخفیف ${discountCode} با موفقیت اعمال شد (${validDiscounts[discountCode] * 100}% تخفیف)`);
        // Here you would apply the discount to the total
        // For a real implementation, this would be connected to a backend
    } else {
        alert('کد تخفیف نامعتبر است');
    }
}

// Set up checkout button
document.querySelector('.checkout-btn')?.addEventListener('click', function() {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length === 0) {
        alert('سبد خرید شما خالی است');
        return;
    }
    
    alert('در حال انتقال به درگاه پرداخت...');
    // Here you would redirect to payment gateway
});

// Set up add service button
document.querySelector('.add-service-btn')?.addEventListener('click', function() {
    window.location.href = './index.html';
});

// Add test function to add sample items
function addSampleItems() {
    console.log('Adding sample items to cart');
    const sampleItems = [
        {
            name: 'سرور ققنوس',
            code: `SRV-IR-${Date.now()}1`,
            quantity: 1,
            price: 599000,
            type: 'server',
            duration: 6,
            extras: {
                datacenter: 'tehran',
                os: 'ubuntu'
            }
        },
        {
            name: 'سرور سیمرغ',
            code: `SRV-IR-${Date.now()}2`,
            quantity: 1,
            price: 899000,
            type: 'server',
            duration: 1,
            extras: {
                datacenter: 'shiraz',
                os: 'centos'
            }
        }
    ];
    
    localStorage.setItem('cart', JSON.stringify(sampleItems));
    console.log('Sample items added, reloading page');
    window.location.reload();
} 
// Simple Cart Implementation
class CartItem {
    constructor(name, code, quantity, price, type, extras = {}) {
        this.name = name;
        this.code = code;
        this.quantity = parseInt(quantity) || 1;
        // Convert price to number if it's a string
        this.price = typeof price === "number" ? price : parseInt(price.toString().replace(/[^0-9]/g, ""));
        this.type = type;
        this.duration = extras?.duration || 1;
        this.extras = extras || {};
    }

    calculateDiscount() {
        // محاسبه تخفیف بر اساس مدت زمان
        if (this.duration >= 12) {
            return 0.2; // 20% تخفیف برای خرید سالانه
        } else if (this.duration >= 6) {
            return 0.15; // 15% تخفیف برای خرید 6 ماهه
        } else if (this.duration >= 3) {
            return 0.1; // 10% تخفیف برای خرید 3 ماهه
        }
        return 0;
    }

    getFinalPrice() {
        const discount = this.calculateDiscount();
        const discountedPrice = Math.round(this.price * (1 - discount));
        return {
            original: this.price,
            discounted: discountedPrice,
            discountPercent: discount * 100,
        };
    }

    getTotalPrice() {
        const { original, discounted } = this.getFinalPrice();
        return {
            original: original * this.duration,
            discounted: discounted * this.duration
        };
    }
}

class Cart {
    constructor() {
        console.log('Cart constructor called');
        this.items = [];
        this.loadFromLocalStorage();
        this.bindEvents();
        this.updateCartIcon();
    }

    loadFromLocalStorage() {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const items = JSON.parse(savedCart);
                this.items = items.map(item => {
                    const cartItem = new CartItem(
                        item.name,
                        item.code,
                        item.quantity,
                        item.price,
                        item.type,
                        item.extras
                    );
                    cartItem.duration = item.duration || 1;
                    return cartItem;
                });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
    }

    bindEvents() {
        console.log('Binding events');
        // Using event delegation for order buttons
        document.body.addEventListener('click', (e) => {
            const orderBtn = e.target.closest('.order-btn');
            if (!orderBtn) return;

            e.preventDefault();
            console.log('Order button clicked');

            const card = orderBtn.closest('.server-card, .host-card');
            if (!card) {
                console.log('No card found');
                return;
            }

            try {
                const name = card.querySelector('h3').textContent;
                const price = card.querySelector('.price').textContent;
                const type = card.classList.contains('server-card') ? 'server' : 'host';
                
                console.log('Found item details:', { name, price, type });
                
                this.addItem(name, type.toUpperCase() + '-' + Date.now(), 1, price, type);
            } catch (error) {
                console.error('Error processing order button click:', error);
            }
        });
    }

    addItem(name, code, quantity, price, type, extras = {}) {
        try {
            console.log('Adding item to cart:', { name, code, quantity, price, type, extras });
            
            // Convert price to number if it's a string
            const numericPrice = typeof price === "number" ? price : parseInt(price.toString().replace(/[^0-9]/g, ""));
            
            // Check if item already exists
            const existingItemIndex = this.items.findIndex(item => item.code === code);
            
            if (existingItemIndex !== -1) {
                // Update existing item
                this.items[existingItemIndex] = new CartItem(name, code, quantity, numericPrice, type, extras);
            } else {
                // Add new item
                const newItem = new CartItem(name, code, quantity, numericPrice, type, extras);
                // Set duration from extras if available
                if (extras && extras.duration) {
                    newItem.duration = parseInt(extras.duration);
                }
                this.items.push(newItem);
            }
            
            this.saveToLocalStorage();
            this.updateCartIcon();
            console.log('Item added to cart:', name);
            return true;
        } catch (error) {
            console.error('Error adding item to cart:', error);
            return false;
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
            console.log('Cart saved to localStorage:', this.items);
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    updateCartIcon() {
        const cartIcon = document.getElementById('cart-icon');
        const cartCount = document.querySelector('.cart-count');
        
        if (!cartIcon || !cartCount) {
            console.log('Cart elements not found in DOM');
            return;
        }

        if (this.items.length > 0) {
            cartIcon.style.display = 'inline-block';
            cartCount.textContent = this.getItemCount();
            console.log('Cart icon updated:', this.items.length);
        } else {
            cartIcon.style.display = 'none';
            console.log('Cart icon hidden');
        }
    }

    removeItem(code) {
        console.log('Removing item with code:', code);
        this.items = this.items.filter(item => item.code !== code);
        this.saveToLocalStorage();
        this.updateCartIcon();
    }

    clearCart() {
        console.log('Clearing cart');
        this.items = [];
        this.saveToLocalStorage();
        this.updateCartIcon();
    }

    getItemCount() {
        return this.items.length;
    }

    getTotalPrice() {
        let originalTotal = 0;
        let discountedTotal = 0;
        
        this.items.forEach(item => {
            const prices = item.getTotalPrice();
            originalTotal += prices.original;
            discountedTotal += prices.discounted;
        });
        
        return {
            original: originalTotal,
            discounted: discountedTotal,
            saved: originalTotal - discountedTotal
        };
    }
}

// Global cart instance
let globalCart = null;

// Get cart function for compatibility
window.getCart = function() {
    if (!globalCart) {
        globalCart = new Cart();
    }
    return globalCart;
}

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

function initCart() {
    console.log('Initializing cart');
    if (!window.cart) {
        window.cart = new Cart();
        globalCart = window.cart;
    }
}

// Reset cart storage function
window.resetCartStorage = function() {
    console.log('Resetting cart storage');
    localStorage.removeItem('cart');
    localStorage.removeItem('selectedService');
    if (window.cart) {
        window.cart.clearCart();
    }
    if (globalCart) {
        globalCart.clearCart();
    }
    console.log('Cart storage has been reset');
}; 
document.addEventListener("DOMContentLoaded", () => {
  const menuIcon = document.querySelector(".bx-menu");
  const navbar = document.querySelector(".navbar");

  // ریست کردن وضعیت منو هنگام لود صفحه
  function resetMenu() {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    menuIcon.style.visibility = "visible";
    document.body.style.overflow = "auto";
  }

  resetMenu(); // اجرا هنگام لود شدن صفحه

  // باز کردن و بستن منو
  menuIcon.addEventListener("click", () => {
    const isActive = navbar.classList.toggle("active");
    menuIcon.classList.toggle("menu-fixed", isActive);

    // مدیریت visibility به درستی
    menuIcon.style.visibility = isActive ? "hidden" : "visible";

    // جلوگیری از اسکرول هنگام باز بودن منو
    document.body.style.overflow = isActive ? "hidden" : "auto";
  });

  // بستن منو با کلیک بیرون از آن
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
      resetMenu();
    }
  });

  // بستن منو هنگام کلیک روی لینک‌های داخل منو
  document.querySelectorAll(".navbar a").forEach((link) => {
    link.addEventListener("click", () => {
      resetMenu();
    });
  });

  // Load and display service details
  const serviceDetails = JSON.parse(
    localStorage.getItem("serviceDetails") || "{}"
  );

  if (serviceDetails.serviceName) {
    document.getElementById("service-name-display").textContent =
      serviceDetails.serviceName;
    document.getElementById("datacenter-display").textContent =
      serviceDetails.datacenter;
    document.getElementById("os-display").textContent = serviceDetails.os;
    document.getElementById("ip-count-display").textContent =
      serviceDetails.ipCount;
    document.getElementById("default-ip-display").textContent =
      serviceDetails.defaultIp;
    document.getElementById("description-display").textContent =
      serviceDetails.serviceDescription || "No description provided";
  }

  // Initialize variables
  let cartItems = [];
  let discountCode = '';
  const TAX_RATE = 0.09; // 9% VAT

  // Load cart items
  loadCartItems();

  // Event Listeners
  document.querySelector('.checkout-btn').addEventListener('click', handleCheckout);
  document.querySelector('.add-service-btn').addEventListener('click', () => {
    window.location.href = '/services.html';
  });

  document.querySelector('.discount-code input').addEventListener('input', (e) => {
    discountCode = e.target.value.trim();
    updateCartSummary();
  });

  // Helper Functions
  async function loadCartItems() {
    try {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        cartItems = data.data.items;
        renderCartItems();
        updateCartSummary();
      } else {
        showToast(data.message || 'Failed to load cart items', 'error');
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      showToast('Failed to load cart items', 'error');
    }
  }

  function renderCartItems() {
    const container = document.querySelector('.cart-items-section');
    if (cartItems.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Add some services to your cart to get started</p>
          <button class="btn btn-primary" onclick="window.location.href='/services.html'">
            Browse Services
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <h2 class="cart-title">Review and Checkout</h2>
      <p class="cart-subtitle">Please review your order before proceeding.</p>
      <div class="cart-items">
        ${cartItems.map(item => createCartItemElement(item)).join('')}
      </div>
    `;

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.closest('.cart-item').dataset.id;
        removeCartItem(itemId);
      });
    });
  }

  function createCartItemElement(item) {
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-details">
          <h3>${item.name}</h3>
          <div class="item-specs">
            <span>Plan: ${item.plan}</span>
            <span>OS: ${item.os}</span>
            <span>Duration: ${item.duration} months</span>
          </div>
          <div class="item-resources">
            <span>CPU: ${item.specs.cpu} cores</span>
            <span>RAM: ${item.specs.ram} GB</span>
            <span>Storage: ${item.specs.storage} GB</span>
            <span>Traffic: ${item.specs.traffic} GB</span>
          </div>
        </div>
        <div class="item-price">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="remove-item">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  async function removeCartItem(itemId) {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        cartItems = cartItems.filter(item => item.id !== itemId);
        renderCartItems();
        updateCartSummary();
        showToast('Item removed from cart', 'success');
      } else {
        showToast(data.message || 'Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      showToast('Failed to remove item', 'error');
    }
  }

  function updateCartSummary() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * TAX_RATE;
    let total = subtotal + tax;

    // Apply discount if code is valid
    if (discountCode) {
      const discount = calculateDiscount(subtotal, discountCode);
      total -= discount;
    }

    document.querySelector('.price-row:nth-child(1) span:last-child').textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector('.price-row:nth-child(2) span:last-child').textContent = `$${tax.toFixed(2)}`;
    document.querySelector('.total-price span:last-child').textContent = `$${total.toFixed(2)}`;
  }

  function calculateDiscount(subtotal, code) {
    // This would need to be implemented based on your discount logic
    return 0;
  }

  async function handleCheckout() {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cartItems,
          discountCode
        })
      });
      const data = await response.json();
      
      if (data.success) {
        showToast('Order placed successfully!', 'success');
        setTimeout(() => {
          window.location.href = `/orders/${data.data.orderId}`;
        }, 2000);
      } else {
        showToast(data.message || 'Failed to place order', 'error');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order', 'error');
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Cart Item Class
  class CartItem {
    constructor(name, code, quantity, price, type) {
      this.name = name;
      this.code = code;
      this.quantity = parseInt(quantity) || 1;
      this.price = typeof price === "number" ? price : parseInt(price.toString().replace(/[^0-9]/g, ""));
      this.type = type;
      this.duration = 1;
    }

    calculateDiscount() {
      if (this.duration >= 12) {
        return 0.2;
      } else if (this.duration >= 6) {
        return 0.15;
      } else if (this.duration >= 3) {
        return 0.1;
      }
      return 0;
    }

    getFinalPrice() {
      const discount = this.calculateDiscount();
      return this.price * (1 - discount);
    }
  }

  // Cart Class
  class Cart {
    constructor() {
      this.items = [];
      this.loadCart();
    }

    loadCart() {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      }
    }

    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addItem(name, code, quantity, price, type, extras = {}) {
      const existingItem = this.items.find(item => item.code === code);
      if (existingItem) {
        existingItem.quantity += parseInt(quantity) || 1;
      } else {
        this.items.push(new CartItem(name, code, quantity, price, type));
      }
      this.saveCart();
      this.updateTotal();
    }

    removeItem(code) {
      this.items = this.items.filter(item => item.code !== code);
      this.saveCart();
      this.updateTotal();
    }

    updateQuantity(code, quantity) {
      const item = this.items.find(item => item.code === code);
      if (item) {
        item.quantity = parseInt(quantity) || 1;
        this.saveCart();
        this.updateTotal();
      }
    }

    updateExtras(code, extras) {
      const item = this.items.find(item => item.code === code);
      if (item) {
        Object.assign(item, extras);
        this.saveCart();
        this.updateTotal();
      }
    }

    updateTotal() {
      const total = this.items.reduce((sum, item) => sum + item.getFinalPrice(), 0);
      document.querySelector('.total-price span:last-child').textContent = `$${total.toFixed(2)}`;
    }

    clear() {
      this.items = [];
      this.saveCart();
      this.updateTotal();
    }

    getItems() {
      return this.items;
    }

    getTotal() {
      return this.items.reduce((sum, item) => sum + item.getFinalPrice(), 0);
    }

    isEmpty() {
      return this.items.length === 0;
    }
  }

  // Initialize cart
  const cart = new Cart();

  // Cart UI handlers
  document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const emptyCartMessage = document.getElementById("empty-cart-message");

    // Update cart display
    function updateCartDisplay() {
      if (!cartContainer) return;

      if (cart.isEmpty()) {
        cartContainer.innerHTML = "";
        if (emptyCartMessage) {
          emptyCartMessage.style.display = "block";
        }
        if (checkoutBtn) {
          checkoutBtn.disabled = true;
        }
        return;
      }

      if (emptyCartMessage) {
        emptyCartMessage.style.display = "none";
      }
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
      }

      cartContainer.innerHTML = cart
        .getItems()
        .map(
          (item) => `
        <div class="cart-item" data-code="${item.code}">
          <div class="item-info">
            <h3>${item.name}</h3>
            <p class="item-code">کد: ${item.code}</p>
            ${Object.entries(item.extras || {})
              .map(
                ([key, value]) => `
              <p class="item-extra">${key}: ${value.value}</p>
            `
              )
              .join("")}
          </div>
          <div class="item-quantity">
            <button class="quantity-btn minus" onclick="updateItemQuantity('${
              item.code
            }', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" onclick="updateItemQuantity('${
              item.code
            }', ${item.quantity + 1})">+</button>
          </div>
          <div class="item-price">
            ${utils.formatCurrency(item.price * item.quantity)}
          </div>
          <button class="remove-btn" onclick="removeItem('${item.code}')">
            <i class="bx bx-trash"></i>
          </button>
        </div>
      `
        )
        .join("");

      if (cartTotal) {
        cartTotal.textContent = utils.formatCurrency(cart.getTotal());
      }
    }

    // Update item quantity
    window.updateItemQuantity = (code, newQuantity) => {
      if (newQuantity < 1) return;
      cart.updateQuantity(code, newQuantity);
      updateCartDisplay();
    };

    // Remove item
    window.removeItem = (code) => {
      if (confirm("آیا از حذف این آیتم اطمینان دارید؟")) {
        cart.removeItem(code);
        updateCartDisplay();
      }
    };

    // Handle checkout
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        try {
          if (!utils.isAuthenticated()) {
            utils.redirectTo("/login.html");
            return;
          }

          const response = await apiClient.post("/orders/create", {
            items: cart.getItems(),
            total: cart.getTotal(),
          });

          if (response.success) {
            cart.clear();
            utils.redirectTo(`/payment.html?orderId=${response.data.orderId}`);
          } else {
            utils.showError(
              "errorMessage",
              response.message || "خطا در ثبت سفارش"
            );
          }
        } catch (error) {
          utils.showError("errorMessage", "خطا در ارتباط با سرور");
          console.error("Checkout error:", error);
        }
      });
    }

    // Initial cart display
    updateCartDisplay();
  });

  // Function to completely reset cart storage
  function resetCartStorage() {
    localStorage.removeItem("cart");
    localStorage.removeItem("selectedService");
    if (window.cart) {
      window.cart.clearCart();
    }
    console.log("Cart storage has been reset");
  }

  // Make reset function available globally
  window.resetCartStorage = resetCartStorage;

  // Checkout button functionality
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (window.cart.items.length === 0) {
        alert("سبد خرید شما خالی است");
        return;
      }

      // بررسی اطلاعات تکمیلی سفارش
      const orderName = document.getElementById("order-name");
      const orderText = document.getElementById("order-text");

      if (!orderName || !orderName.value.trim()) {
        alert("لطفاً نام سفارش را وارد کنید");
        orderName?.focus();
        return;
      }

      // ذخیره اطلاعات سفارش
      const orderDetails = {
        name: orderName.value.trim(),
        text: orderText?.value.trim() || "",
        ip: document.getElementById("order-ip")?.value || "185.xx.xx.xx",
        items: window.cart.items,
        totalPrice: document.querySelector(".total-price span:last-child")
          ?.textContent,
      };

      // ذخیره اطلاعات سفارش در localStorage
      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

      alert("در حال انتقال به درگاه پرداخت...");
    });
  }

  // Redirect for new service
  const addServiceBtn = document.querySelector(".add-service-btn");
  if (addServiceBtn) {
    addServiceBtn.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }
});

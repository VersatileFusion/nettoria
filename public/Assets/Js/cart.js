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
});

class CartItem {
  constructor(name, code, quantity, price, type) {
    this.name = name;
    this.code = code;
    this.quantity = parseInt(quantity) || 1;
    // اگر قیمت عدد باشد، مستقیم استفاده کن، در غیر این صورت تبدیل کن
    this.price =
      typeof price === "number"
        ? price
        : parseInt(price.toString().replace(/[^0-9]/g, ""));
    this.type = type;
    this.duration = 1; // اضافه کردن مدت زمان پیش‌فرض
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
    const discountedPrice = this.price * (1 - discount);
    return {
      original: this.price,
      discounted: discountedPrice,
      discountPercent: discount * 100,
    };
  }
}

class Cart {
  constructor() {
    this.items = [];
    this.loadFromLocalStorage();
    this.initAddToCartButtons();
    this.updateCartIcon();
  }

  loadFromLocalStorage() {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        this.items = items.map(item => {
          return new CartItem(
            item.name,
            item.code,
            item.quantity,
            item.price,
            item.type
          );
        });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.items = [];
    }
  }

  initAddToCartButtons() {
    // Initialize order buttons in virtual server page
    document.querySelectorAll(".server-card .order-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".server-card");
        const name = card.querySelector("h3").textContent;
        const price = card.querySelector(".price").textContent;
        this.addItem(name, "SRV-" + Date.now(), 1, price, "server");
      });
    });

    // Initialize order buttons in cloud host page
    document.querySelectorAll(".host-card .order-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".host-card");
        const name = card.querySelector("h3").textContent;
        const price = card.querySelector(".price").textContent;
        this.addItem(name, "HST-" + Date.now(), 1, price, "host");
      });
    });
  }

  addItem(name, code, quantity, price, type) {
    try {
      const newItem = new CartItem(name, code, quantity, price, type);
      this.items.push(newItem);
      this.saveToLocalStorage();
      this.updateCartIcon();
      console.log('Item added to cart:', newItem);

      // Redirect to select-service page for server/host items
      if (type === 'server' || type === 'host') {
        const serviceDetails = {
          name: name,
          price: price,
          code: code,
          type: type
        };
        localStorage.setItem('selectedService', JSON.stringify(serviceDetails));
        window.location.href = "select-service.html";
      }
      
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  }

  removeItem(code) {
    this.items = this.items.filter(item => item.code !== code);
    this.saveToLocalStorage();
    this.updateCartIcon();
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  updateCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.querySelector('.cart-count');
    
    if (this.items.length > 0) {
      cartIcon.classList.add('has-items');
      cartCount.textContent = this.getItemCount();
    } else {
      cartIcon.classList.remove('has-items');
    }
  }

  clearCart() {
    this.items = [];
    this.saveToLocalStorage();
    this.updateCartIcon();
  }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cart = new Cart();
});

// Function to completely reset cart storage
function resetCartStorage() {
  localStorage.removeItem('cart');
  localStorage.removeItem('selectedService');
  if (window.cart) {
    window.cart.clearCart();
  }
  console.log('Cart storage has been reset');
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

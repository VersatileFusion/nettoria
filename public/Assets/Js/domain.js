const menuIcon = document.querySelector(".bx-menu");
const navbar = document.querySelector(".navbar");

// Open menu
menuIcon.addEventListener("click", () => {
  navbar.classList.toggle("active");
  menuIcon.classList.toggle("menu-fixed");
  // Hide menu icon when menu is open
  menuIcon.style.visibility = menuIcon.classList.contains("bx-menu")
    ? "hidden"
    : "visible";
});

// Close menu when clicking anywhere outside
document.addEventListener("click", (e) => {
  // Check if click is outside both navbar and menu icon
  if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  }
});

// Close menu when clicking on links
document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
    menuIcon.classList.remove("menu-fixed");
    // Show menu icon when menu is closed
    menuIcon.style.visibility = "visible";
  });
});

document.addEventListener("DOMContentLoaded", function () {
    const searchBtn = document.querySelector(".search-btn");
    const domainInput = document.getElementById("domain-input");
    const tldSelect = document.getElementById("tld-select");
    const domainStatus = document.querySelector(".domain-status");
    const domainStatusText = document.getElementById("domain-status-text");
    const domainDetails = document.querySelector(".domain-details");
    const paymentPeriod = document.getElementById("payment-period");
    const totalAmount = document.querySelector(".total-amount");
    const paymentBtn = document.querySelector(".payment-btn");

    // Base price for domain (yearly)
    const basePrice = 1130000;

    // Handle domain search
    searchBtn.addEventListener("click", () => {
        const domain = domainInput.value.trim();
        const tld = tldSelect.value;
        
        if (domain) {
            const fullDomain = domain + tld;
            // Show success message and domain details
            domainStatus.style.display = "block";
            domainStatusText.textContent = `دامنه ${fullDomain} موجود میباشد.`;
            domainDetails.style.display = "block";
            updateTotal();
        }
    });

    // Handle payment period change
    paymentPeriod.addEventListener("change", updateTotal);

    // Update total amount based on payment period
    function updateTotal() {
        const years = parseInt(paymentPeriod.value);
        const total = basePrice * years;
        totalAmount.textContent = formatPrice(total) + " تومان";
    }

    // Format price with commas
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Handle payment button click
    paymentBtn.addEventListener("click", () => {
        const domain = domainInput.value.trim() + tldSelect.value;
        const years = parseInt(paymentPeriod.value);
        const total = basePrice * years;
        
        // Add to cart
        const cart = new Cart();
        cart.addItem(domain, 'DOM-' + Date.now(), years, total.toString(), 'domain');
        
        // Redirect to cart page
        window.location.href = "cart.html";
    });
});

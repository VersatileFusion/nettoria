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

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add click listeners to all "more info" buttons
  const moreInfoButtons = document.querySelectorAll(".more-info");
  moreInfoButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest(".vpn-card");
      card.classList.add("active");
    });
  });

  // Add click listeners to all close buttons
  const closeButtons = document.querySelectorAll(".close-details");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const card = this.closest(".vpn-card");
      card.classList.remove("active");
    });
  });

  // Close details when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".vpn-card")) {
      document.querySelectorAll(".vpn-card.active").forEach((card) => {
        card.classList.remove("active");
      });
    }
  });

  function Alert(title, message, time, type) {
    const number = Math.random().toString(36).substr(2, 9); // Unique ID
    const toastContainer = document.querySelector(".toast");

    const wrapper = document.createElement("div");
    wrapper.className = `wrapper ${type}`;
    wrapper.id = `wrapper-${number}`;

    const main = document.createElement("div");
    main.className = `main ${type}-icon`;

    const titleElement = document.createElement("div");
    titleElement.innerText = title;
    titleElement.style.fontSize = "16px";
    titleElement.style.fontWeight = "600";

    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.style.fontSize = "14px";

    main.appendChild(titleElement);
    main.appendChild(messageElement);
    wrapper.appendChild(main);
    toastContainer.appendChild(wrapper);

    anime({
      targets: `#wrapper-${number}`,
      translateX: [-300, 0],
      duration: 750,
      easing: "spring(1, 70, 100, 10)",
    });

    setTimeout(() => {
      anime({
        targets: `#wrapper-${number}`,
        translateX: [0, 300],
        duration: 750,
        easing: "spring(1, 80, 100, 0)",
      });
      setTimeout(() => {
        wrapper.remove();
      }, 750);
    }, time);
  }

  // Initialize cart
  const cart = new Cart();

  // Cart functionality
  const cartButtons = document.querySelectorAll(".cart-btn");
  cartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const card = this.closest(".vpn-card");
      const name = card.querySelector("h2").textContent;
      const price = card.querySelector(".price").textContent;
      window.cart.addItem(name, 'VPN-' + Date.now(), 1, price, 'vpn');
      Alert("موفقیت", "محصول به سبد خرید اضافه شد", 3000, "success");
    });
  });
});

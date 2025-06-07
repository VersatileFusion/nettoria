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
  const serverCards = document.querySelectorAll(".server-card");

  // Add click handlers for more-info buttons
  document.querySelectorAll(".more-info").forEach((button) => {
      button.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          const card = this.closest(".server-card");
          if (card) {
              // حذف کلاس active از همه کارت‌ها
              serverCards.forEach(c => c.classList.remove("active"));
              // اضافه کردن کلاس active به کارت کلیک شده
              card.classList.add("active");
          }
      });
  });

  // Prevent details from closing when clicking inside
  document.querySelectorAll(".details").forEach((detail) => {
      detail.addEventListener("click", (e) => e.stopPropagation());
  });

  // Close details when clicking outside
  document.addEventListener("click", (e) => {
      if (!e.target.closest(".server-card")) {
          serverCards.forEach(card => card.classList.remove("active"));
      }
  });

  // Close details handlers
  document.querySelectorAll(".close-details").forEach((button) => {
      button.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          const card = this.closest(".server-card");
          if (card) {
              card.classList.remove("active");
          }
      });
  });

  // Order button handlers
  document.querySelectorAll(".details .order-btn").forEach((button) => {
      button.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          const card = this.closest(".server-card");
          if (!card) return;

          const name = card.querySelector("h3")?.textContent;
          const price = card.querySelector(".price")?.textContent;
          const code = "SRV-IR-" + Date.now();

          localStorage.setItem("selectedService", JSON.stringify({
              name: name,
              price: price,
              code: code,
              type: "server"
          }));

          window.location.href = "select-service.html";
      });
  });
});

// Alert function
function Alert(title, message, time, type) {
  const number = Math.random().toString(36).substr(2, 9);
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
